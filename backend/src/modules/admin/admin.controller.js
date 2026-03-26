const pool = require('../../config/db');

// ── GET /api/admin/usuarios ──────────────────────────────────
const getUsuarios = async (req, res) => {
  try {
    const { rol, activo } = req.query;

    let query = `
      SELECT u.id, u.nombre, u.email, u.municipio,
             u.telefono, u.activo, u.creado_en,
             u.ultimo_login, u.cuestionario_completado,
             ARRAY_AGG(r.nombre) AS roles
      FROM usuarios u
      LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
      LEFT JOIN roles r          ON r.id = ur.rol_id
      WHERE 1=1
    `;

    const params = [];

    if (rol) {
      params.push(rol);
      query += ` AND r.nombre = $${params.length}`;
    }

    if (activo !== undefined) {
      params.push(activo === 'true');
      query += ` AND u.activo = $${params.length}`;
    }

    query += ' GROUP BY u.id ORDER BY u.creado_en DESC';

    const result = await pool.query(query, params);

    res.json({ usuarios: result.rows, total: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// ── GET /api/admin/usuarios/:id ──────────────────────────────
const getUsuario = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, ARRAY_AGG(r.nombre) AS roles
       FROM usuarios u
       LEFT JOIN usuario_roles ur ON ur.usuario_id = u.id
       LEFT JOIN roles r          ON r.id = ur.rol_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ usuario: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

// ── POST /api/admin/usuarios/:id/roles ───────────────────────
const asignarRol = async (req, res) => {
  const { rol_nombre } = req.body;

  if (!rol_nombre) {
    return res.status(400).json({ error: 'rol_nombre es obligatorio' });
  }

  try {
    const rol = await pool.query(
      'SELECT id FROM roles WHERE nombre = $1',
      [rol_nombre]
    );

    if (rol.rows.length === 0) {
      return res.status(404).json({ error: `Rol '${rol_nombre}' no existe` });
    }

    await pool.query(
      `INSERT INTO usuario_roles (usuario_id, rol_id, asignado_por)
       VALUES ($1, $2, $3)
       ON CONFLICT (usuario_id, rol_id)
       DO UPDATE SET activo = true, asignado_por = $3`,
      [req.params.id, rol.rows[0].id, req.usuario.id]
    );

    res.json({
      message: `Rol '${rol_nombre}' asignado exitosamente`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al asignar rol' });
  }
};

// ── PUT /api/admin/usuarios/:id/desactivar ───────────────────
const desactivarUsuario = async (req, res) => {
  if (req.params.id === req.usuario.id) {
    return res.status(400).json({
      error: 'No puedes desactivarte a ti mismo'
    });
  }

  try {
    const result = await pool.query(
      `UPDATE usuarios SET activo = false
       WHERE id = $1
       RETURNING id, nombre, email, activo`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario desactivado exitosamente',
      usuario: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al desactivar usuario' });
  }
};

// ── GET /api/admin/cosechas/sin-asignar ──────────────────────
const getCosechasSinAsignar = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.variedad, c.proceso,
              c.lote_nombre, c.fecha_cierre,
              c.kg_producidos, c.qr_codigo,
              f.nombre     AS nombre_finca,
              f.municipio,
              u.nombre     AS nombre_caficultor
       FROM cosechas c
       JOIN fincas f   ON f.id = c.finca_id
       JOIN usuarios u ON u.id = f.caficultor_id
       WHERE c.estado = 'cerrada'
         AND c.id NOT IN (
           SELECT cosecha_id FROM cosecha_cafeteria
           WHERE activa = true
         )
       ORDER BY c.fecha_cierre DESC`
    );

    res.json({
      cosechas: result.rows,
      total:    result.rows.length
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cosechas' });
  }
};

// ── POST /api/admin/cosechas/:cosecha_id/asignar ─────────────
const asignarCosechaACafeteria = async (req, res) => {
  const { cafeteria_id } = req.body;

  if (!cafeteria_id) {
    return res.status(400).json({ error: 'cafeteria_id es obligatorio' });
  }

  try {
    const cosecha = await pool.query(
      `SELECT c.id, c.variedad, f.nombre AS nombre_finca
       FROM cosechas c
       JOIN fincas f ON f.id = c.finca_id
       WHERE c.id = $1 AND c.estado = 'cerrada'`,
      [req.params.cosecha_id]
    );

    if (cosecha.rows.length === 0) {
      return res.status(404).json({
        error: 'Cosecha no encontrada o no está cerrada'
      });
    }

    const cafeteria = await pool.query(
      'SELECT id, nombre FROM cafeterias WHERE id = $1 AND activa = true',
      [cafeteria_id]
    );

    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }

    await pool.query(
      `INSERT INTO cosecha_cafeteria (cosecha_id, cafeteria_id, asignado_por)
       VALUES ($1, $2, $3)
       ON CONFLICT (cosecha_id, cafeteria_id)
       DO UPDATE SET activa = true, asignado_por = $3`,
      [req.params.cosecha_id, cafeteria_id, req.usuario.id]
    );

    await pool.query(
      `UPDATE cosechas SET estado = 'asignada'
       WHERE id = $1`,
      [req.params.cosecha_id]
    );

    res.json({
      message: `Cosecha '${cosecha.rows[0].variedad}' asignada a '${cafeteria.rows[0].nombre}'`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al asignar cosecha' });
  }
};

// ── GET /api/admin/dashboard ─────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const usuarios = await pool.query(
      `SELECT
         COUNT(*)                                              AS total_usuarios,
         COUNT(CASE WHEN activo = true  THEN 1 END)           AS usuarios_activos,
         COUNT(CASE WHEN activo = false THEN 1 END)           AS usuarios_inactivos
       FROM usuarios`
    );

    const porRol = await pool.query(
      `SELECT r.nombre AS rol, COUNT(ur.usuario_id) AS total
       FROM roles r
       LEFT JOIN usuario_roles ur ON ur.rol_id = r.id AND ur.activo = true
       GROUP BY r.id, r.nombre
       ORDER BY r.id`
    );

    const cosechas = await pool.query(
      `SELECT estado, COUNT(*) AS total
       FROM cosechas
       GROUP BY estado`
    );

    const cafeterias = await pool.query(
      `SELECT COUNT(*) AS total,
              COUNT(CASE WHEN activa = true THEN 1 END) AS activas
       FROM cafeterias`
    );

    const pedidos = await pool.query(
      `SELECT
         COUNT(*)                                            AS total_pedidos,
         COALESCE(SUM(pa.monto)
           FILTER (WHERE pa.estado = 'confirmado'), 0)      AS ingresos_totales,
         ROUND(AVG(v.cafe_experiencia)::numeric, 1)         AS satisfaccion_global
       FROM pedidos p
       LEFT JOIN pagos pa        ON pa.pedido_id = p.id
       LEFT JOIN valoraciones v  ON v.pedido_id  = p.id`
    );

    res.json({
      usuarios:        usuarios.rows[0],
      usuarios_por_rol:porRol.rows,
      cosechas:        cosechas.rows,
      cafeterias:      cafeterias.rows[0],
      pedidos:         pedidos.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

// ── GET /api/admin/estadisticas ──────────────────────────────
const getEstadisticas = async (req, res) => {
  try {
    const topCafes = await pool.query(
      `SELECT mi.nombre, ca.nombre AS cafeteria,
              COUNT(p.id) AS pedidos,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating
       FROM pedidos p
       JOIN menu_items mi       ON mi.id = p.menu_item_id
       JOIN cafeterias ca       ON ca.id = p.cafeteria_id
       LEFT JOIN valoraciones v ON v.pedido_id = p.id
       WHERE p.estado = 'entregado'
       GROUP BY mi.id, mi.nombre, ca.nombre
       ORDER BY pedidos DESC
       LIMIT 10`
    );

    const topFincas = await pool.query(
      `SELECT f.nombre, f.municipio,
              u.nombre AS caficultor,
              COUNT(DISTINCT c.id) AS cosechas,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating_promedio
       FROM fincas f
       JOIN usuarios u          ON u.id = f.caficultor_id
       LEFT JOIN cosechas c     ON c.finca_id = f.id
       LEFT JOIN menu_items mi  ON mi.cosecha_id = c.id
       LEFT JOIN pedidos p      ON p.menu_item_id = mi.id
       LEFT JOIN valoraciones v ON v.pedido_id = p.id
       GROUP BY f.id, f.nombre, f.municipio, u.nombre
       ORDER BY cosechas DESC
       LIMIT 5`
    );

    res.json({
      top_cafes:  topCafes.rows,
      top_fincas: topFincas.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = {
  getUsuarios, getUsuario,
  asignarRol, desactivarUsuario,
  getCosechasSinAsignar, asignarCosechaACafeteria,
  getDashboard, getEstadisticas
};