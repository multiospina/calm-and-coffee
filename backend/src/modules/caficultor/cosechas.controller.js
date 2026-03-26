const pool = require('../../config/db');
const { randomUUID } = require('crypto');

// GET /api/caficultor/cosechas
const getMisCosechas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, f.nombre AS nombre_finca,
              ls.nombre AS nombre_lote,
              ls.variedad AS variedad_lote,
              COUNT(DISTINCT e.id) AS total_etapas,
              COUNT(DISTINCT cc.cafeteria_id) AS total_cafeterias
       FROM cosechas c
       JOIN fincas f ON f.id = c.finca_id
       LEFT JOIN lotes_siembra ls ON ls.id = c.lote_id
       LEFT JOIN etapas_cosecha e ON e.cosecha_id = c.id
       LEFT JOIN cosecha_cafeteria cc ON cc.cosecha_id = c.id
       WHERE f.caficultor_id = $1
       GROUP BY c.id, f.nombre, ls.nombre, ls.variedad
       ORDER BY c.creado_en DESC`,
      [req.usuario.id]
    );

    res.json({ cosechas: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cosechas' });
  }
};

// GET /api/caficultor/cosechas/:id
const getCosecha = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, f.nombre AS nombre_finca,
              ls.nombre AS nombre_lote, ls.fecha_siembra,
              ls.variedad AS variedad_lote, ls.notas_siembra
       FROM cosechas c
       JOIN fincas f ON f.id = c.finca_id
       LEFT JOIN lotes_siembra ls ON ls.id = c.lote_id
       WHERE c.id = $1 AND f.caficultor_id = $2`,
      [req.params.id, req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cosecha no encontrada' });
    }

    const etapas = await pool.query(
      `SELECT * FROM etapas_cosecha
       WHERE cosecha_id = $1
       ORDER BY fecha ASC`,
      [req.params.id]
    );

    const cafeterias = await pool.query(
      `SELECT ca.id, ca.nombre, ca.municipio, cc.asignado_en, cc.activa
       FROM cosecha_cafeteria cc
       JOIN cafeterias ca ON ca.id = cc.cafeteria_id
       WHERE cc.cosecha_id = $1`,
      [req.params.id]
    );

    res.json({
      cosecha: result.rows[0],
      etapas: etapas.rows,
      cafeterias: cafeterias.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cosecha' });
  }
};

// POST /api/caficultor/cosechas
const crearCosecha = async (req, res) => {
  const {
    finca_id, lote_id, variedad, proceso,
    lote_nombre, fecha_inicio, kg_estimados, notas
  } = req.body;

  if (!finca_id || !variedad || !proceso || !fecha_inicio) {
    return res.status(400).json({
      error: 'Finca, variedad, proceso y fecha de inicio son obligatorios'
    });
  }

  const procesosValidos = ['lavado', 'honey', 'natural', 'anaerobico'];
  if (!procesosValidos.includes(proceso)) {
    return res.status(400).json({
      error: `Proceso inválido. Opciones: ${procesosValidos.join(', ')}`
    });
  }

  try {
    const finca = await pool.query(
      'SELECT id FROM fincas WHERE id = $1 AND caficultor_id = $2',
      [finca_id, req.usuario.id]
    );
    if (finca.rows.length === 0) {
      return res.status(404).json({ error: 'Finca no encontrada' });
    }

    const result = await pool.query(
      `INSERT INTO cosechas (
        finca_id, lote_id, variedad, proceso,
        lote_nombre, fecha_inicio, kg_estimados, notas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *`,
      [
        finca_id, lote_id || null, variedad, proceso,
        lote_nombre || null, fecha_inicio,
        kg_estimados || null, notas || null
      ]
    );

    res.status(201).json({
      message: 'Cosecha creada exitosamente',
      cosecha: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear cosecha' });
  }
};

// PUT /api/caficultor/cosechas/:id
const actualizarCosecha = async (req, res) => {
  const {
    variedad, proceso, lote_nombre,
    kg_estimados, kg_producidos, notas
  } = req.body;

  try {
    const existe = await pool.query(
      `SELECT c.id FROM cosechas c
       JOIN fincas f ON f.id = c.finca_id
       WHERE c.id = $1 AND f.caficultor_id = $2 AND c.estado != 'cerrada'`,
      [req.params.id, req.usuario.id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({
        error: 'Cosecha no encontrada o ya está cerrada'
      });
    }

    const result = await pool.query(
      `UPDATE cosechas SET
        variedad = COALESCE($1, variedad),
        proceso = COALESCE($2, proceso),
        lote_nombre = COALESCE($3, lote_nombre),
        kg_estimados = COALESCE($4, kg_estimados),
        kg_producidos = COALESCE($5, kg_producidos),
        notas = COALESCE($6, notas)
      WHERE id = $7
      RETURNING *`,
      [
        variedad, proceso, lote_nombre,
        kg_estimados, kg_producidos, notas,
        req.params.id
      ]
    );

    res.json({
      message: 'Cosecha actualizada exitosamente',
      cosecha: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar cosecha' });
  }
};

// POST /api/caficultor/cosechas/:id/cerrar
const cerrarCosecha = async (req, res) => {
  const { kg_producidos } = req.body;

  try {
    const existe = await pool.query(
      `SELECT c.id FROM cosechas c
       JOIN fincas f ON f.id = c.finca_id
       WHERE c.id = $1 AND f.caficultor_id = $2 AND c.estado = 'activa'`,
      [req.params.id, req.usuario.id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({
        error: 'Cosecha no encontrada o no está activa'
      });
    }

    const qr = `CEA-QR-${randomUUID().split('-')[0].toUpperCase()}-${new Date().getFullYear()}`;

    const result = await pool.query(
      `UPDATE cosechas SET
        estado = 'cerrada',
        fecha_cierre = CURRENT_DATE,
        kg_producidos = COALESCE($1, kg_producidos),
        qr_codigo = $2
      WHERE id = $3
      RETURNING *`,
      [kg_producidos || null, qr, req.params.id]
    );

    res.json({
      message: 'Cosecha cerrada exitosamente. QR generado.',
      cosecha: result.rows[0],
      qr_codigo: qr
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al cerrar cosecha' });
  }
};

module.exports = {
  getMisCosechas, getCosecha,
  crearCosecha, actualizarCosecha,
  cerrarCosecha
};