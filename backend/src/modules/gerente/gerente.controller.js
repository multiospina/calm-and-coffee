const pool = require('../../config/db');

// ── GET /api/gerente/cafeteria ───────────────────────────────
const getMiCafeteria = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ca.*,
              COUNT(DISTINCT mi.id)  AS total_items_menu,
              COUNT(DISTINCT t.id)   AS total_turnos,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating_promedio
       FROM cafeterias ca
       LEFT JOIN menu_items mi  ON mi.cafeteria_id = ca.id AND mi.activo = true
       LEFT JOIN turnos t       ON t.cafeteria_id  = ca.id
       LEFT JOIN pedidos p      ON p.cafeteria_id  = ca.id
       LEFT JOIN valoraciones v ON v.pedido_id     = p.id
       WHERE ca.gerente_id = $1 AND ca.activa = true
       GROUP BY ca.id
       LIMIT 1`,
      [req.usuario.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    res.json({ cafeteria: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cafetería' });
  }
};

// ── GET /api/gerente/cafeterias ──────────────────────────────
const getMisCafeterias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ca.*,
              COUNT(DISTINCT mi.id)  AS total_items_menu,
              COUNT(DISTINCT t.id)   AS total_turnos,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating_promedio
       FROM cafeterias ca
       LEFT JOIN menu_items mi  ON mi.cafeteria_id = ca.id AND mi.activo = true
       LEFT JOIN turnos t       ON t.cafeteria_id  = ca.id
       LEFT JOIN pedidos p      ON p.cafeteria_id  = ca.id
       LEFT JOIN valoraciones v ON v.pedido_id     = p.id
       WHERE ca.gerente_id = $1 AND ca.activa = true
       GROUP BY ca.id
       ORDER BY ca.nombre ASC`,
      [req.usuario.id]
    );
    res.json({ cafeterias: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cafeterías' });
  }
};

// ── PUT /api/gerente/cafeteria ───────────────────────────────
const actualizarCafeteria = async (req, res) => {
  const {
    nombre, direccion, municipio,
    telefono, descripcion, foto_url,
    video_url, horario, metodos_pago
  } = req.body;
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const result = await pool.query(
      `UPDATE cafeterias SET
        nombre       = COALESCE($1,  nombre),
        direccion    = COALESCE($2,  direccion),
        municipio    = COALESCE($3,  municipio),
        telefono     = COALESCE($4,  telefono),
        descripcion  = COALESCE($5,  descripcion),
        foto_url     = COALESCE($6,  foto_url),
        video_url    = COALESCE($7,  video_url),
        horario      = COALESCE($8,  horario),
        metodos_pago = COALESCE($9,  metodos_pago)
       WHERE gerente_id = $10
       RETURNING *`,
      [
        nombre, direccion, municipio, telefono,
        descripcion, foto_url, video_url,
        horario      ? JSON.stringify(horario)      : null,
        metodos_pago ? JSON.stringify(metodos_pago) : null,
        req.usuario.id
      ]
    );
    res.json({ message: 'Cafetería actualizada exitosamente', cafeteria: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cafetería' });
  }
};

// ── PUT /api/gerente/cafeteria/mesas ─────────────────────────
const actualizarMesas = async (req, res) => {
  const { total_mesas } = req.body;
  if (!total_mesas || total_mesas < 1 || total_mesas > 50) {
    return res.status(400).json({ error: 'Total de mesas debe ser entre 1 y 50' });
  }
  try {
    await pool.query(
      'UPDATE cafeterias SET total_mesas = $1 WHERE gerente_id = $2',
      [total_mesas, req.usuario.id]
    );
    res.json({ message: 'Mesas actualizadas', total_mesas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar mesas' });
  }
};

// ── GET /api/gerente/menu ────────────────────────────────────
const getMenu = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const result = await pool.query(
      `SELECT mi.*,
              c.variedad, c.proceso, c.qr_codigo,
              f.nombre     AS nombre_finca,
              f.municipio  AS municipio_finca,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating,
              COUNT(p.id)  AS total_pedidos
       FROM menu_items mi
       LEFT JOIN cosechas c      ON c.id  = mi.cosecha_id
       LEFT JOIN fincas f        ON f.id  = c.finca_id
       LEFT JOIN pedidos p       ON p.menu_item_id = mi.id
       LEFT JOIN valoraciones v  ON v.pedido_id    = p.id
       WHERE mi.cafeteria_id = $1
       GROUP BY mi.id, c.variedad, c.proceso,
                c.qr_codigo, f.nombre, f.municipio
       ORDER BY mi.activo DESC, mi.nombre ASC`,
      [cafeteria.rows[0].id]
    );
    res.json({ menu: result.rows, total: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener menú' });
  }
};

// ── POST /api/gerente/menu ───────────────────────────────────
const crearMenuItem = async (req, res) => {
  const { cosecha_id, nombre, tipo, descripcion, precio, stock, metodos_prep, foto_url } = req.body;
  if (!nombre || !tipo || !precio) {
    return res.status(400).json({ error: 'Nombre, tipo y precio son obligatorios' });
  }
  const tiposValidos = ['bebida_cafe', 'producto_fisico'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({ error: `Tipo inválido. Opciones: ${tiposValidos.join(', ')}` });
  }
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const result = await pool.query(
      `INSERT INTO menu_items (
        cafeteria_id, cosecha_id, nombre, tipo,
        descripcion, precio, stock, metodos_prep, foto_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        cafeteria.rows[0].id,
        cosecha_id  || null,
        nombre, tipo,
        descripcion || null,
        precio,
        stock       || 0,
        metodos_prep|| null,
        foto_url    || null
      ]
    );
    res.status(201).json({ message: 'Item creado exitosamente', item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear item' });
  }
};

// ── PUT /api/gerente/menu/:id ────────────────────────────────
const actualizarMenuItem = async (req, res) => {
  const { nombre, descripcion, precio, stock, metodos_prep, foto_url, activo } = req.body;
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const result = await pool.query(
      `UPDATE menu_items SET
        nombre       = COALESCE($1, nombre),
        descripcion  = COALESCE($2, descripcion),
        precio       = COALESCE($3, precio),
        stock        = COALESCE($4, stock),
        metodos_prep = COALESCE($5, metodos_prep),
        foto_url     = COALESCE($6, foto_url),
        activo       = COALESCE($7, activo)
       WHERE id = $8 AND cafeteria_id = $9
       RETURNING *`,
      [nombre, descripcion, precio, stock, metodos_prep, foto_url, activo, req.params.id, cafeteria.rows[0].id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    res.json({ message: 'Item actualizado exitosamente', item: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar item' });
  }
};

// ── GET /api/gerente/turnos ──────────────────────────────────
const getTurnos = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const result = await pool.query(
      `SELECT t.*,
              ARRAY_AGG(
                JSON_BUILD_OBJECT('id', u.id, 'nombre', u.nombre, 'email', u.email)
              ) FILTER (WHERE u.id IS NOT NULL) AS baristas
       FROM turnos t
       LEFT JOIN turno_baristas tb ON tb.turno_id = t.id
       LEFT JOIN usuarios u        ON u.id = tb.barista_id
       WHERE t.cafeteria_id = $1
       GROUP BY t.id
       ORDER BY t.fecha DESC, t.hora_inicio ASC`,
      [cafeteria.rows[0].id]
    );
    res.json({ turnos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener turnos' });
  }
};

// ── POST /api/gerente/turnos ─────────────────────────────────
const crearTurno = async (req, res) => {
  const { nombre, fecha, hora_inicio, hora_fin } = req.body;
  if (!nombre || !fecha || !hora_inicio || !hora_fin) {
    return res.status(400).json({ error: 'Nombre, fecha, hora_inicio y hora_fin son obligatorios' });
  }
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const result = await pool.query(
      `INSERT INTO turnos (cafeteria_id, nombre, fecha, hora_inicio, hora_fin, creado_por)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [cafeteria.rows[0].id, nombre, fecha, hora_inicio, hora_fin, req.usuario.id]
    );
    res.status(201).json({ message: 'Turno creado exitosamente', turno: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear turno' });
  }
};

// ── POST /api/gerente/turnos/:id/baristas ────────────────────
const asignarBarista = async (req, res) => {
  const { barista_id } = req.body;
  if (!barista_id) {
    return res.status(400).json({ error: 'barista_id es obligatorio' });
  }
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const turno = await pool.query(
      'SELECT id FROM turnos WHERE id = $1 AND cafeteria_id = $2',
      [req.params.id, cafeteria.rows[0].id]
    );
    if (turno.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    const esBarista = await pool.query(
      `SELECT u.id FROM usuarios u
       JOIN usuario_roles ur ON ur.usuario_id = u.id
       JOIN roles r          ON r.id = ur.rol_id
       WHERE u.id = $1 AND r.nombre = 'barista'`,
      [barista_id]
    );
    if (esBarista.rows.length === 0) {
      return res.status(400).json({ error: 'El usuario no tiene rol barista' });
    }
    await pool.query(
      `INSERT INTO turno_baristas (turno_id, barista_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, barista_id]
    );
    res.json({ message: 'Barista asignado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al asignar barista' });
  }
};

// ── GET /api/gerente/dashboard ── CORREGIDO: SELECT * trae total_mesas
const getDashboard = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT * FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const cafId = cafeteria.rows[0].id;
    const metricas = await pool.query(
      `SELECT
         COUNT(DISTINCT p.id)                                  AS total_pedidos,
         COUNT(DISTINCT CASE WHEN p.estado = 'entregado'
               THEN p.id END)                                  AS pedidos_entregados,
         COALESCE(SUM(pa.monto) FILTER
           (WHERE pa.estado = 'confirmado'), 0)                AS ingresos_totales,
         ROUND(AVG(v.cafe_experiencia)::numeric, 1)            AS satisfaccion_promedio,
         COUNT(DISTINCT p.cliente_id)                          AS clientes_unicos
       FROM pedidos p
       LEFT JOIN pagos pa        ON pa.pedido_id  = p.id
       LEFT JOIN valoraciones v  ON v.pedido_id   = p.id
       WHERE p.cafeteria_id = $1`,
      [cafId]
    );
    const topCafes = await pool.query(
      `SELECT mi.nombre, COUNT(p.id) AS total_pedidos,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating
       FROM pedidos p
       JOIN menu_items mi       ON mi.id = p.menu_item_id
       LEFT JOIN valoraciones v ON v.pedido_id = p.id
       WHERE p.cafeteria_id = $1 AND p.estado = 'entregado'
       GROUP BY mi.id, mi.nombre
       ORDER BY total_pedidos DESC
       LIMIT 5`,
      [cafId]
    );
    const cosechas = await pool.query(
      `SELECT c.variedad, c.proceso, c.qr_codigo,
              f.nombre AS nombre_finca, f.municipio
       FROM cosecha_cafeteria cc
       JOIN cosechas c ON c.id = cc.cosecha_id
       JOIN fincas f   ON f.id = c.finca_id
       WHERE cc.cafeteria_id = $1 AND cc.activa = true`,
      [cafId]
    );
    res.json({
      cafeteria:            cafeteria.rows[0],
      metricas:             metricas.rows[0],
      top_cafes:            topCafes.rows,
      cosechas_disponibles: cosechas.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

// ── GET /api/gerente/baristas ────────────────────────────────
const getBaristas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.municipio,
              COUNT(DISTINCT tb.turno_id) AS turnos_asignados
       FROM usuarios u
       JOIN usuario_roles ur ON ur.usuario_id = u.id
       JOIN roles r          ON r.id = ur.rol_id
       LEFT JOIN turno_baristas tb ON tb.barista_id = u.id
       WHERE r.nombre = 'barista' AND u.activo = true
       GROUP BY u.id
       ORDER BY u.nombre ASC`
    );
    res.json({ baristas: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener baristas' });
  }
};

// ── POST /api/gerente/baristas ───────────────────────────────
const crearBarista = async (req, res) => {
  const { nombre, email, password, municipio, telefono } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
  }
  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }
    const bcrypt = require('bcryptjs');
    const hash   = await bcrypt.hash(password, 10);
    const usuario = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, municipio, telefono)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, nombre, email`,
      [nombre, email, hash, municipio || null, telefono || null]
    );
    const rol = await pool.query('SELECT id FROM roles WHERE nombre = $1', ['barista']);
    if (rol.rows.length > 0) {
      await pool.query(
        `INSERT INTO usuario_roles (usuario_id, rol_id, asignado_por) VALUES ($1, $2, $3)`,
        [usuario.rows[0].id, rol.rows[0].id, req.usuario.id]
      );
    }
    res.status(201).json({ message: `Barista ${nombre} creado exitosamente`, barista: usuario.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear barista' });
  }
};

// ── GET /api/gerente/equipo ──────────────────────────────────
const getEquipo = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const cafId = cafeteria.rows[0].id;
    const result = await pool.query(
      `SELECT DISTINCT u.id, u.nombre, u.email, u.municipio,
              COUNT(DISTINCT t.id) FILTER (WHERE t.cafeteria_id = $1) AS turnos_cafeteria,
              COUNT(DISTINCT p.id) FILTER (WHERE p.cafeteria_id = $1) AS pedidos_preparados,
              ROUND(AVG(v.cafe_experiencia)::numeric, 1) AS satisfaccion
       FROM usuarios u
       JOIN usuario_roles ur ON ur.usuario_id = u.id
       JOIN roles r          ON r.id = ur.rol_id
       LEFT JOIN turno_baristas tb ON tb.barista_id = u.id
       LEFT JOIN turnos t          ON t.id = tb.turno_id
       LEFT JOIN pedidos p         ON p.turno_id = t.id AND p.barista_id = u.id
       LEFT JOIN valoraciones v    ON v.pedido_id = p.id
       WHERE r.nombre = 'barista' AND u.activo = true
       GROUP BY u.id
       ORDER BY turnos_cafeteria DESC, u.nombre ASC`,
      [cafId]
    );
    res.json({ equipo: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener equipo' });
  }
};

// ── GET /api/gerente/pedidos/hoy ─────────────────────────────
const getPedidosHoy = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const result = await pool.query(
      `SELECT p.id, p.mesa, p.estado, p.creado_en, p.notas_cliente,
              mi.nombre AS nombre_cafe, u.nombre AS nombre_cliente,
              EXTRACT(EPOCH FROM (now() - p.creado_en))/60 AS minutos_esperando
       FROM pedidos p
       JOIN menu_items mi ON mi.id = p.menu_item_id
       JOIN usuarios u    ON u.id  = p.cliente_id
       WHERE p.cafeteria_id = $1 AND p.creado_en::date = CURRENT_DATE
       ORDER BY p.creado_en DESC`,
      [cafeteria.rows[0].id]
    );
    const resumen = await pool.query(
      `SELECT
         COUNT(*) AS total,
         COUNT(CASE WHEN estado = 'entregado'      THEN 1 END) AS entregados,
         COUNT(CASE WHEN estado = 'en_preparacion' THEN 1 END) AS en_preparacion,
         COUNT(CASE WHEN estado NOT IN ('entregado','cancelado') THEN 1 END) AS activos,
         COUNT(CASE WHEN estado = 'cancelado'      THEN 1 END) AS cancelados
       FROM pedidos
       WHERE cafeteria_id = $1 AND creado_en::date = CURRENT_DATE`,
      [cafeteria.rows[0].id]
    );
    res.json({ pedidos: result.rows, resumen: resumen.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
};

// ── GET /api/gerente/cosechas ────────────────────────────────
const getCosechas = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const result = await pool.query(
      `SELECT c.id, c.variedad, c.proceso, c.qr_codigo,
              c.kg_producidos, c.fecha_cierre,
              f.nombre AS nombre_finca, f.municipio, f.altitud_msnm,
              u.nombre AS nombre_caficultor, cc.asignado_en,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating,
              COUNT(DISTINCT p.id) AS total_pedidos
       FROM cosecha_cafeteria cc
       JOIN cosechas c    ON c.id  = cc.cosecha_id
       JOIN fincas f      ON f.id  = c.finca_id
       JOIN usuarios u    ON u.id  = f.caficultor_id
       LEFT JOIN menu_items mi ON mi.cosecha_id = c.id AND mi.cafeteria_id = $1
       LEFT JOIN pedidos p     ON p.menu_item_id = mi.id
       LEFT JOIN valoraciones v ON v.pedido_id   = p.id
       WHERE cc.cafeteria_id = $1 AND cc.activa = true
       GROUP BY c.id, f.nombre, f.municipio, f.altitud_msnm, u.nombre, cc.asignado_en
       ORDER BY cc.asignado_en DESC`,
      [cafeteria.rows[0].id]
    );
    res.json({ cosechas: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cosechas' });
  }
};

// ── GET /api/gerente/vision-general ─────────────────────────
const getVisionGeneral = async (req, res) => {
  try {
    const cafeterias = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 AND activa = true',
      [req.usuario.id]
    );
    if (cafeterias.rows.length === 0) {
      return res.json({ empleados: [] });
    }
    const cafIds = cafeterias.rows.map(c => c.id);
    const result = await pool.query(
      `SELECT DISTINCT
              u.id, u.nombre, u.email, u.municipio,
              ca.id AS cafeteria_id, ca.nombre AS nombre_cafeteria,
              t.id AS turno_id, t.nombre AS nombre_turno,
              t.estado AS estado_turno, t.hora_inicio, t.hora_fin, t.fecha,
              COUNT(DISTINCT p.id) AS pedidos_hoy,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS satisfaccion
       FROM usuarios u
       JOIN usuario_roles ur ON ur.usuario_id = u.id
       JOIN roles r          ON r.id = ur.rol_id
       LEFT JOIN turno_baristas tb ON tb.barista_id = u.id
       LEFT JOIN turnos t          ON t.id = tb.turno_id
                                  AND t.cafeteria_id = ANY($1::uuid[])
                                  AND t.fecha = CURRENT_DATE
       LEFT JOIN cafeterias ca     ON ca.id = t.cafeteria_id
       LEFT JOIN pedidos p         ON p.turno_id = t.id AND p.creado_en::date = CURRENT_DATE
       LEFT JOIN valoraciones v    ON v.pedido_id = p.id
       WHERE r.nombre = 'barista' AND u.activo = true
       GROUP BY u.id, ca.id, ca.nombre, t.id, t.nombre, t.estado, t.hora_inicio, t.hora_fin, t.fecha
       ORDER BY ca.nombre ASC, u.nombre ASC`,
      [cafIds]
    );
    res.json({ empleados: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener visión general' });
  }
};

// ── DELETE /api/gerente/turnos/:id/baristas/:barista_id ──────
const desasignarBarista = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const turno = await pool.query(
      'SELECT id FROM turnos WHERE id = $1 AND cafeteria_id = $2',
      [req.params.id, cafeteria.rows[0].id]
    );
    if (turno.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    await pool.query(
      'DELETE FROM turno_baristas WHERE turno_id = $1 AND barista_id = $2',
      [req.params.id, req.params.barista_id]
    );
    res.json({ message: 'Barista desasignado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al desasignar barista' });
  }
};

// ── PUT /api/gerente/turnos/:id/estado ───────────────────────
const cambiarEstadoTurno = async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['pendiente', 'activo', 'cerrado'];
  if (!estado || !estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado inválido. Opciones: ${estadosValidos.join(', ')}` });
  }
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    if (estado === 'activo') {
      await pool.query(
        `UPDATE turnos SET estado = 'cerrado' WHERE cafeteria_id = $1 AND estado = 'activo' AND id != $2`,
        [cafeteria.rows[0].id, req.params.id]
      );
    }
    const result = await pool.query(
      `UPDATE turnos SET estado = $1 WHERE id = $2 AND cafeteria_id = $3 RETURNING *`,
      [estado, req.params.id, cafeteria.rows[0].id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.json({ message: `Turno ${estado} exitosamente`, turno: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cambiar estado del turno' });
  }
};

// ── DELETE /api/gerente/turnos/:id ───────────────────────────
const eliminarTurno = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const pedidos = await pool.query(
      'SELECT COUNT(*) FROM pedidos WHERE turno_id = $1',
      [req.params.id]
    );
    if (parseInt(pedidos.rows[0].count) > 0) {
      return res.status(400).json({ error: 'No se puede eliminar un turno que tiene pedidos registrados' });
    }
    await pool.query('DELETE FROM turno_baristas WHERE turno_id = $1', [req.params.id]);
    const result = await pool.query(
      'DELETE FROM turnos WHERE id = $1 AND cafeteria_id = $2 RETURNING id',
      [req.params.id, cafeteria.rows[0].id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    res.json({ message: 'Turno eliminado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar turno' });
  }
};

// ── GET /api/gerente/ventas ──────────────────────────────────
const getVentas = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1 LIMIT 1',
      [req.usuario.id]
    );
    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }
    const result = await pool.query(
      `SELECT
         DATE(p.creado_en) AS fecha,
         COUNT(p.id) AS total_pedidos,
         COUNT(CASE WHEN p.estado='entregado' THEN 1 END) AS entregados,
         COALESCE(SUM(pa.monto) FILTER (WHERE pa.estado='confirmado'),0) AS ingresos,
         ROUND(AVG(v.cafe_experiencia)::numeric,1) AS satisfaccion
       FROM pedidos p
       LEFT JOIN pagos pa       ON pa.pedido_id = p.id
       LEFT JOIN valoraciones v ON v.pedido_id  = p.id
       WHERE p.cafeteria_id = $1
         AND p.creado_en >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(p.creado_en)
       ORDER BY fecha ASC`,
      [cafeteria.rows[0].id]
    );
    res.json({ ventas: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
};

module.exports = {
  getMiCafeteria, getMisCafeterias, actualizarCafeteria,
  actualizarMesas,
  getMenu, crearMenuItem, actualizarMenuItem,
  getTurnos, crearTurno, asignarBarista,
  desasignarBarista, cambiarEstadoTurno, eliminarTurno,
  getDashboard, getVentas,
  getBaristas, crearBarista,
  getEquipo, getPedidosHoy,
  getCosechas, getVisionGeneral,
};
