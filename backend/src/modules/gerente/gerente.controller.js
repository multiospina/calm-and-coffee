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
       GROUP BY ca.id`,
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

// ── PUT /api/gerente/cafeteria ───────────────────────────────
const actualizarCafeteria = async (req, res) => {
  const {
    nombre, direccion, municipio,
    telefono, descripcion, foto_url,
    video_url, horario, metodos_pago
  } = req.body;

  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1',
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
        horario     ? JSON.stringify(horario)      : null,
        metodos_pago ? JSON.stringify(metodos_pago): null,
        req.usuario.id
      ]
    );

    res.json({
      message:   'Cafetería actualizada exitosamente',
      cafeteria: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cafetería' });
  }
};

// ── GET /api/gerente/menu ────────────────────────────────────
const getMenu = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1',
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
  const {
    cosecha_id, nombre, tipo,
    descripcion, precio,
    stock, metodos_prep, foto_url
  } = req.body;

  if (!nombre || !tipo || !precio) {
    return res.status(400).json({
      error: 'Nombre, tipo y precio son obligatorios'
    });
  }

  const tiposValidos = ['bebida_cafe', 'producto_fisico'];
  if (!tiposValidos.includes(tipo)) {
    return res.status(400).json({
      error: `Tipo inválido. Opciones: ${tiposValidos.join(', ')}`
    });
  }

  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1',
      [req.usuario.id]
    );

    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }

    const result = await pool.query(
      `INSERT INTO menu_items (
        cafeteria_id, cosecha_id, nombre, tipo,
        descripcion, precio, stock,
        metodos_prep, foto_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *`,
      [
        cafeteria.rows[0].id,
        cosecha_id   || null,
        nombre, tipo,
        descripcion  || null,
        precio,
        stock        || 0,
        metodos_prep || null,
        foto_url     || null
      ]
    );

    res.status(201).json({
      message: 'Item creado exitosamente',
      item:    result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear item' });
  }
};

// ── PUT /api/gerente/menu/:id ────────────────────────────────
const actualizarMenuItem = async (req, res) => {
  const {
    nombre, descripcion, precio,
    stock, metodos_prep, foto_url, activo
  } = req.body;

  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1',
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
      [
        nombre, descripcion, precio,
        stock, metodos_prep, foto_url, activo,
        req.params.id, cafeteria.rows[0].id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json({
      message: 'Item actualizado exitosamente',
      item:    result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar item' });
  }
};

// ── GET /api/gerente/turnos ──────────────────────────────────
const getTurnos = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1',
      [req.usuario.id]
    );

    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }

    const result = await pool.query(
      `SELECT t.*,
              ARRAY_AGG(
                JSON_BUILD_OBJECT(
                  'id',     u.id,
                  'nombre', u.nombre,
                  'email',  u.email
                )
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
    return res.status(400).json({
      error: 'Nombre, fecha, hora_inicio y hora_fin son obligatorios'
    });
  }

  try {
    const cafeteria = await pool.query(
      'SELECT id FROM cafeterias WHERE gerente_id = $1',
      [req.usuario.id]
    );

    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }

    const result = await pool.query(
      `INSERT INTO turnos (
        cafeteria_id, nombre, fecha,
        hora_inicio, hora_fin, creado_por
      ) VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [
        cafeteria.rows[0].id,
        nombre, fecha,
        hora_inicio, hora_fin,
        req.usuario.id
      ]
    );

    res.status(201).json({
      message: 'Turno creado exitosamente',
      turno:   result.rows[0]
    });
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
      'SELECT id FROM cafeterias WHERE gerente_id = $1',
      [req.usuario.id]
    );

    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }

    // Verificar que el turno pertenece a esta cafetería
    const turno = await pool.query(
      'SELECT id FROM turnos WHERE id = $1 AND cafeteria_id = $2',
      [req.params.id, cafeteria.rows[0].id]
    );

    if (turno.rows.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    // Verificar que el usuario tiene rol barista
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
      `INSERT INTO turno_baristas (turno_id, barista_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [req.params.id, barista_id]
    );

    res.json({ message: 'Barista asignado exitosamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al asignar barista' });
  }
};

// ── GET /api/gerente/dashboard ───────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT id, nombre FROM cafeterias WHERE gerente_id = $1',
      [req.usuario.id]
    );

    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }

    const cafId = cafeteria.rows[0].id;

    // Métricas generales
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

    // Cafés más pedidos
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

    // Cosechas disponibles
    const cosechas = await pool.query(
      `SELECT c.variedad, c.proceso, c.qr_codigo,
              f.nombre AS nombre_finca,
              f.municipio
       FROM cosecha_cafeteria cc
       JOIN cosechas c ON c.id = cc.cosecha_id
       JOIN fincas f   ON f.id = c.finca_id
       WHERE cc.cafeteria_id = $1 AND cc.activa = true`,
      [cafId]
    );

    res.json({
      cafeteria:  cafeteria.rows[0],
      metricas:   metricas.rows[0],
      top_cafes:  topCafes.rows,
      cosechas_disponibles: cosechas.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

module.exports = {
  getMiCafeteria, actualizarCafeteria,
  getMenu, crearMenuItem, actualizarMenuItem,
  getTurnos, crearTurno, asignarBarista,
  getDashboard
};