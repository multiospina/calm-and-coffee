const pool = require('../../config/db');

// POST /api/cliente/pedidos
const crearPedido = async (req, res) => {
  const { menu_item_id, cafeteria_id, mesa, metodo_preparacion, notas_cliente } = req.body;

  if (!menu_item_id || !cafeteria_id) {
    return res.status(400).json({ error: 'menu_item_id y cafeteria_id son obligatorios' });
  }

  try {
    // Verificar stock disponible
    const itemRes = await pool.query(
      'SELECT id, nombre, precio, stock, activo FROM menu_items WHERE id = $1 AND cafeteria_id = $2',
      [menu_item_id, cafeteria_id]
    );

    if (itemRes.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const item = itemRes.rows[0];

    if (!item.activo) {
      return res.status(400).json({ error: 'Este café no está disponible' });
    }

    if (item.stock <= 0) {
      return res.status(400).json({ error: 'Stock agotado para este café' });
    }

    // Buscar turno activo en esa cafetería
    const turnoRes = await pool.query(
      `SELECT t.id, tb.barista_id
       FROM turnos t
       JOIN turno_baristas tb ON tb.turno_id = t.id
       WHERE t.cafeteria_id = $1
         AND t.estado = 'activo'
       LIMIT 1`,
      [cafeteria_id]
    );

    const turno_id  = turnoRes.rows[0]?.id       || null;
    const barista_id = turnoRes.rows[0]?.barista_id || null;

    // Generar QR del pocillo
    const qr_pocillo = `CEA-POCILLO-${Date.now()}`;

    // Crear el pedido
    const pedidoRes = await pool.query(
      `INSERT INTO pedidos (
        cliente_id, barista_id, cafeteria_id, turno_id,
        menu_item_id, mesa, estado, qr_pocillo,
        metodo_preparacion, notas_cliente
      ) VALUES ($1,$2,$3,$4,$5,$6,'pendiente_pago',$7,$8,$9)
      RETURNING *`,
      [
        req.usuario.id, barista_id, cafeteria_id, turno_id,
        menu_item_id, mesa || 'Mesa 1', qr_pocillo,
        metodo_preparacion || null, notas_cliente || null
      ]
    );

    // Crear el pago
    await pool.query(
      `INSERT INTO pagos (pedido_id, monto, metodo, estado)
       VALUES ($1, $2, 'efectivo', 'pendiente')`,
      [pedidoRes.rows[0].id, item.precio]
    );

    // Restar 1 al stock
    await pool.query(
      'UPDATE menu_items SET stock = stock - 1 WHERE id = $1',
      [menu_item_id]
    );

    // Emitir Socket.io al barista
    const io = req.app.get('io');
    if (io && turno_id) {
      io.emit(`cafeteria:${cafeteria_id}:pedidos`, {
        accion:    'nuevo_pedido',
        pedido_id: pedidoRes.rows[0].id,
        cafe:      item.nombre,
        mesa:      mesa || 'Mesa 1',
      });
    }

    res.status(201).json({
      message:    'Pedido creado exitosamente',
      pedido:     pedidoRes.rows[0],
      qr_pocillo: qr_pocillo,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear pedido' });
  }
};

// GET /api/cliente/pedidos
const getMisPedidos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.id, p.mesa, p.estado, p.qr_pocillo,
              p.creado_en, p.entregado_en,
              mi.nombre AS nombre_cafe, mi.precio,
              ca.nombre AS nombre_cafeteria,
              ca.municipio,
              c.variedad, c.proceso, c.qr_codigo
       FROM pedidos p
       JOIN menu_items mi  ON mi.id = p.menu_item_id
       JOIN cafeterias ca  ON ca.id = p.cafeteria_id
       LEFT JOIN cosechas c ON c.id = mi.cosecha_id
       WHERE p.cliente_id = $1
       ORDER BY p.creado_en DESC`,
      [req.usuario.id]
    );

    res.json({ pedidos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// POST /api/cliente/pedidos/:id/valorar
const valorarPedido = async (req, res) => {
  const {
    cafe_aroma, cafe_sabor, cafe_cuerpo,
    cafe_balance, cafe_experiencia,
    barista_atencion, tienda_ambiente,
    precio_justo, notas_sabor, comentario
  } = req.body;

  if (!cafe_experiencia) {
    return res.status(400).json({ error: 'La experiencia general es obligatoria' });
  }

  try {
    // Verificar que el pedido pertenece al cliente y está entregado
    const pedidoRes = await pool.query(
      `SELECT p.id, p.cafeteria_id, mi.cosecha_id
       FROM pedidos p
       JOIN menu_items mi ON mi.id = p.menu_item_id
       WHERE p.id = $1 AND p.cliente_id = $2`,
      [req.params.id, req.usuario.id]
    );

    if (pedidoRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const pedido = pedidoRes.rows[0];

    // Verificar que no haya valoración previa
    const valoracionExiste = await pool.query(
      'SELECT id FROM valoraciones WHERE pedido_id = $1',
      [req.params.id]
    );

    if (valoracionExiste.rows.length > 0) {
      return res.status(409).json({ error: 'Ya valoraste este pedido' });
    }

    // Insertar valoración
    await pool.query(
      `INSERT INTO valoraciones (
        pedido_id, cliente_id,
        cafe_aroma, cafe_sabor, cafe_cuerpo,
        cafe_balance, cafe_experiencia,
        barista_atencion, tienda_ambiente,
        precio_justo, notas_sabor, comentario
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        req.params.id, req.usuario.id,
        cafe_aroma || 3, cafe_sabor || 3, cafe_cuerpo || 3,
        cafe_balance || 3, cafe_experiencia,
        barista_atencion || 3, tienda_ambiente || 3,
        precio_justo || 'justo',
        notas_sabor || [],
        comentario || null
      ]
    );

    // Sumar puntos al pasaporte
   const puntos = cafe_experiencia * 5 + 10;

// Obtener puntos actuales
const pasaporteActual = await pool.query(
  'SELECT puntos FROM pasaporte_cafetero WHERE cliente_id = $1',
  [req.usuario.id]
);

const puntosNuevos = (parseInt(pasaporteActual.rows[0]?.puntos) || 0) + puntos;

// Calcular nivel según puntos
let nuevoNivel = 0;
if (puntosNuevos >= 701) nuevoNivel = 4;
else if (puntosNuevos >= 351) nuevoNivel = 3;
else if (puntosNuevos >= 151) nuevoNivel = 2;
else if (puntosNuevos >= 51)  nuevoNivel = 1;
else nuevoNivel = 0;

await pool.query(
  `UPDATE pasaporte_cafetero SET
    puntos        = $1,
    nivel         = $2,
    cafes_catados = cafes_catados + 1
   WHERE cliente_id = $3`,
  [puntosNuevos, nuevoNivel, req.usuario.id]
);
    // Registrar en historial_catas
    await pool.query(
      `INSERT INTO historial_catas (cliente_id, cosecha_id, cafeteria_id, tipo_qr, puntos_ganados)
       VALUES ($1, $2, $3, 'pocillo', $4)
       ON CONFLICT DO NOTHING`,
      [req.usuario.id, pedido.cosecha_id, pedido.cafeteria_id, puntos]
    );

    res.json({
      message: 'Valoración guardada exitosamente',
      puntos_ganados: puntos
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al valorar pedido' });
  }
};

module.exports = { crearPedido, getMisPedidos, valorarPedido };