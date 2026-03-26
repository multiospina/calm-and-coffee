const pool = require('../../config/db');

// ── GET /api/barista/turno ───────────────────────────────────
const getMiTurno = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.id, t.nombre, t.fecha,
              t.hora_inicio, t.hora_fin, t.estado,
              ca.nombre AS nombre_cafeteria,
              ca.id     AS cafeteria_id,
              ca.direccion, ca.municipio
       FROM turnos t
       JOIN turno_baristas tb ON tb.turno_id = t.id
       JOIN cafeterias ca     ON ca.id = t.cafeteria_id
       WHERE tb.barista_id = $1
         AND t.fecha = CURRENT_DATE
         AND t.estado IN ('pendiente','activo')
       ORDER BY t.hora_inicio ASC
       LIMIT 1`,
      [req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.json({ turno: null, mensaje: 'No tienes turno activo hoy' });
    }

    res.json({ turno: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener turno' });
  }
};

// ── GET /api/barista/pedidos ─────────────────────────────────
const getColaPedidos = async (req, res) => {
  try {
    // Buscar el turno activo del barista hoy
    const turnoRes = await pool.query(
      `SELECT t.id, t.cafeteria_id
       FROM turnos t
       JOIN turno_baristas tb ON tb.turno_id = t.id
       WHERE tb.barista_id = $1
         AND t.fecha = CURRENT_DATE
         AND t.estado = 'activo'
       LIMIT 1`,
      [req.usuario.id]
    );

    if (turnoRes.rows.length === 0) {
      return res.json({ pedidos: [], mensaje: 'No tienes turno activo' });
    }

    const turno = turnoRes.rows[0];

    const result = await pool.query(
      `SELECT p.id, p.mesa, p.estado,
              p.metodo_preparacion, p.notas_cliente,
              p.creado_en, p.qr_pocillo,
              mi.nombre        AS nombre_cafe,
              mi.precio,
              mi.foto_url,
              c.variedad, c.proceso,
              u.nombre         AS nombre_cliente,
              EXTRACT(EPOCH FROM (now() - p.creado_en))/60 AS minutos_esperando
       FROM pedidos p
       JOIN menu_items mi ON mi.id = p.menu_item_id
       LEFT JOIN cosechas c ON c.id = mi.cosecha_id
       JOIN usuarios u     ON u.id = p.cliente_id
       WHERE p.cafeteria_id = $1
         AND p.turno_id = $2
         AND p.estado NOT IN ('entregado','cancelado')
       ORDER BY p.creado_en ASC`,
      [turno.cafeteria_id, turno.id]
    );

    res.json({
      turno_id:    turno.id,
      cafeteria_id:turno.cafeteria_id,
      pedidos:     result.rows,
      total:       result.rows.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cola de pedidos' });
  }
};

// ── PUT /api/barista/pedidos/:id/estado ──────────────────────
// Este es el endpoint que dispara Socket.io en tiempo real
const avanzarEstadoPedido = async (req, res) => {
  const { estado } = req.body;

  const estadosValidos = [
    'pendiente_pago', 'pagado',
    'en_preparacion', 'listo',
    'entregado',      'cancelado'
  ];

  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({
      error: `Estado inválido. Opciones: ${estadosValidos.join(', ')}`
    });
  }

  try {
    // Verificar que el pedido pertenece al turno activo del barista
    const existe = await pool.query(
      `SELECT p.id, p.cliente_id, p.cafeteria_id,
              p.estado AS estado_actual,
              mi.nombre AS nombre_cafe
       FROM pedidos p
       JOIN menu_items mi ON mi.id = p.menu_item_id
       JOIN turno_baristas tb ON tb.turno_id = p.turno_id
       WHERE p.id = $1 AND tb.barista_id = $2`,
      [req.params.id, req.usuario.id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedido = existe.rows[0];

    // Actualizar estado
const result = await pool.query(
  `UPDATE pedidos SET
    estado = $1,
    barista_id = $2,
    entregado_en = CASE WHEN $1::varchar = 'entregado' THEN now() ELSE entregado_en END
   WHERE id = $3
   RETURNING *`,
  [estado, req.usuario.id, req.params.id]
);

    const pedidoActualizado = result.rows[0];

    // ── Emitir evento Socket.io ──────────────────────────────
    // El objeto io está disponible en app.js — lo pasamos via req.app
    const io = req.app.get('io');
    if (io) {
      // Notificar al cliente específico
      io.emit(`pedido:${req.params.id}`, {
        pedido_id:  req.params.id,
        estado:     estado,
        nombre_cafe:pedido.nombre_cafe,
        barista:    req.usuario.nombre,
        timestamp:  new Date().toISOString()
      });

      // Notificar al dashboard del barista
      io.emit(`cafeteria:${pedido.cafeteria_id}:pedidos`, {
        accion:    'estado_actualizado',
        pedido_id: req.params.id,
        estado:    estado
      });
    }

    res.json({
      message:         `Pedido actualizado a: ${estado}`,
      pedido:          pedidoActualizado
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar pedido' });
  }
};

// ── GET /api/barista/metricas ────────────────────────────────
const getMisMetricas = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT
         COUNT(p.id)                                         AS total_pedidos_hoy,
         COUNT(CASE WHEN p.estado = 'entregado' THEN 1 END) AS entregados,
         COUNT(CASE WHEN p.estado = 'cancelado' THEN 1 END) AS cancelados,
         ROUND(AVG(v.cafe_experiencia)::numeric, 1)          AS satisfaccion_promedio,
         ROUND(AVG(
           EXTRACT(EPOCH FROM (p.entregado_en - p.creado_en))/60
         )::numeric, 1)                                      AS tiempo_promedio_min
       FROM pedidos p
       LEFT JOIN valoraciones v ON v.pedido_id = p.id
       JOIN turno_baristas tb ON tb.turno_id = p.turno_id
       JOIN turnos t          ON t.id = p.turno_id
       WHERE tb.barista_id = $1
         AND t.fecha = $2`,
      [req.usuario.id, hoy]
    );

    res.json({ metricas: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
};

module.exports = {
  getMiTurno,
  getColaPedidos,
  avanzarEstadoPedido,
  getMisMetricas
};