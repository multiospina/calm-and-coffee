const pool = require('../../config/db');

// GET /api/caficultor/fincas/:finca_id/lotes
const getMisLotes = async (req, res) => {
  try {
    const finca = await pool.query(
      'SELECT id FROM fincas WHERE id = $1 AND caficultor_id = $2',
      [req.params.finca_id, req.usuario.id]
    );
    if (finca.rows.length === 0) {
      return res.status(404).json({ error: 'Finca no encontrada' });
    }

    const result = await pool.query(
      `SELECT ls.*,
              COUNT(DISTINCT c.id) AS total_cosechas,
              COUNT(DISTINCT sm.id) AS reportes_maduracion
       FROM lotes_siembra ls
       LEFT JOIN cosechas c ON c.lote_id = ls.id
       LEFT JOIN seguimiento_maduracion sm ON sm.lote_id = ls.id
       WHERE ls.finca_id = $1
       GROUP BY ls.id
       ORDER BY ls.fecha_siembra DESC`,
      [req.params.finca_id]
    );

    res.json({ lotes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener lotes' });
  }
};

// GET /api/caficultor/lotes/:id
const getLote = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ls.*,
              f.nombre AS nombre_finca,
              COUNT(DISTINCT c.id) AS total_cosechas
       FROM lotes_siembra ls
       JOIN fincas f ON f.id = ls.finca_id
       LEFT JOIN cosechas c ON c.lote_id = ls.id
       WHERE ls.id = $1 AND f.caficultor_id = $2
       GROUP BY ls.id, f.nombre`,
      [req.params.id, req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    const mantenimientos = await pool.query(
      `SELECT * FROM mantenimiento_lote
       WHERE lote_id = $1
       ORDER BY fecha DESC`,
      [req.params.id]
    );

    res.json({
      lote: result.rows[0],
      mantenimientos: mantenimientos.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener lote' });
  }
};

// POST /api/caficultor/fincas/:finca_id/lotes
const crearLote = async (req, res) => {
  const {
    nombre, variedad, proceso_base, fecha_siembra,
    primera_cosecha_est, origen_semilla,
    num_arboles, area_hectareas,
    parcela_ubicacion, notas_siembra
  } = req.body;

  if (!nombre || !variedad || !fecha_siembra) {
    return res.status(400).json({
      error: 'Nombre, variedad y fecha de siembra son obligatorios'
    });
  }

  try {
    const finca = await pool.query(
      'SELECT id FROM fincas WHERE id = $1 AND caficultor_id = $2',
      [req.params.finca_id, req.usuario.id]
    );
    if (finca.rows.length === 0) {
      return res.status(404).json({ error: 'Finca no encontrada' });
    }

    const result = await pool.query(
      `INSERT INTO lotes_siembra (
        finca_id, nombre, variedad, proceso_base, fecha_siembra,
        primera_cosecha_est, origen_semilla, num_arboles,
        area_hectareas, parcela_ubicacion, notas_siembra
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        req.params.finca_id, nombre, variedad,
        proceso_base || null, fecha_siembra,
        primera_cosecha_est || null, origen_semilla || null,
        num_arboles || null, area_hectareas || null,
        parcela_ubicacion || null, notas_siembra || null
      ]
    );

    res.status(201).json({
      message: 'Lote creado exitosamente',
      lote: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear lote' });
  }
};

// PUT /api/caficultor/lotes/:id
const actualizarLote = async (req, res) => {
  const {
    nombre, variedad, proceso_base, primera_cosecha_est,
    origen_semilla, num_arboles, area_hectareas,
    parcela_ubicacion, estado, notas_siembra, activo
  } = req.body;

  try {
    const existe = await pool.query(
      `SELECT ls.id FROM lotes_siembra ls
       JOIN fincas f ON f.id = ls.finca_id
       WHERE ls.id = $1 AND f.caficultor_id = $2`,
      [req.params.id, req.usuario.id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Lote no encontrado' });
    }

    const result = await pool.query(
      `UPDATE lotes_siembra SET
        nombre = COALESCE($1, nombre),
        variedad = COALESCE($2, variedad),
        proceso_base = COALESCE($3, proceso_base),
        primera_cosecha_est = COALESCE($4, primera_cosecha_est),
        origen_semilla = COALESCE($5, origen_semilla),
        num_arboles = COALESCE($6, num_arboles),
        area_hectareas = COALESCE($7, area_hectareas),
        parcela_ubicacion = COALESCE($8, parcela_ubicacion),
        estado = COALESCE($9, estado),
        notas_siembra = COALESCE($10, notas_siembra),
        activo = COALESCE($11, activo)
      WHERE id = $12
      RETURNING *`,
      [
        nombre, variedad, proceso_base, primera_cosecha_est,
        origen_semilla, num_arboles, area_hectareas,
        parcela_ubicacion, estado, notas_siembra, activo,
        req.params.id
      ]
    );

    res.json({
      message: 'Lote actualizado exitosamente',
      lote: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar lote' });
  }
};

module.exports = { getMisLotes, getLote, crearLote, actualizarLote };