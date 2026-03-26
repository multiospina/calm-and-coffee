const pool = require('../../config/db');

// GET /api/caficultor/fincas
const getMisFincas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.nombre, f.municipio, f.departamento,
              f.altitud_msnm, f.area_hectareas, f.num_arboles,
              f.historia, f.temporada_cosecha, f.proceso_principal,
              f.temp_promedio, f.precipitacion_mm, f.brillo_solar_h,
              f.tipo_suelo, f.sombrio, f.video_url, f.activa, f.creado_en,
              COUNT(DISTINCT c.id) AS total_cosechas,
              COUNT(DISTINCT ls.id) AS total_lotes
       FROM fincas f
       LEFT JOIN cosechas c ON c.finca_id = f.id
       LEFT JOIN lotes_siembra ls ON ls.finca_id = f.id
       WHERE f.caficultor_id = $1
       GROUP BY f.id
       ORDER BY f.creado_en DESC`,
      [req.usuario.id]
    );
    res.json({ fincas: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener fincas' });
  }
};

// GET /api/caficultor/fincas/:id
const getFinca = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*,
              COUNT(DISTINCT c.id) AS total_cosechas,
              COUNT(DISTINCT ls.id) AS total_lotes
       FROM fincas f
       LEFT JOIN cosechas c ON c.finca_id = f.id
       LEFT JOIN lotes_siembra ls ON ls.finca_id = f.id
       WHERE f.id = $1 AND f.caficultor_id = $2
       GROUP BY f.id`,
      [req.params.id, req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Finca no encontrada' });
    }

    res.json({ finca: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener finca' });
  }
};

// POST /api/caficultor/fincas
const crearFinca = async (req, res) => {
  const {
    nombre, municipio, departamento, altitud_msnm,
    area_hectareas, num_arboles, historia,
    temporada_cosecha, proceso_principal,
    temp_promedio, precipitacion_mm, brillo_solar_h,
    tipo_suelo, sombrio, video_url
  } = req.body;

  if (!nombre || !municipio || !departamento || !altitud_msnm) {
    return res.status(400).json({
      error: 'Nombre, municipio, departamento y altitud son obligatorios'
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO fincas (
        caficultor_id, nombre, municipio, departamento, altitud_msnm,
        area_hectareas, num_arboles, historia, temporada_cosecha,
        proceso_principal, temp_promedio, precipitacion_mm,
        brillo_solar_h, tipo_suelo, sombrio, video_url
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        req.usuario.id, nombre, municipio, departamento, altitud_msnm,
        area_hectareas || null, num_arboles || null, historia || null,
        temporada_cosecha || null, proceso_principal || null,
        temp_promedio || null, precipitacion_mm || null,
        brillo_solar_h || null, tipo_suelo || null,
        sombrio || null, video_url || null
      ]
    );

    res.status(201).json({
      message: 'Finca creada exitosamente',
      finca: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear finca' });
  }
};

// PUT /api/caficultor/fincas/:id
const actualizarFinca = async (req, res) => {
  const {
    nombre, municipio, departamento, altitud_msnm,
    area_hectareas, num_arboles, historia,
    temporada_cosecha, proceso_principal,
    temp_promedio, precipitacion_mm, brillo_solar_h,
    tipo_suelo, sombrio, video_url, activa
  } = req.body;

  try {
    const existe = await pool.query(
      'SELECT id FROM fincas WHERE id = $1 AND caficultor_id = $2',
      [req.params.id, req.usuario.id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({ error: 'Finca no encontrada' });
    }

    const result = await pool.query(
      `UPDATE fincas SET
        nombre = COALESCE($1, nombre),
        municipio = COALESCE($2, municipio),
        departamento = COALESCE($3, departamento),
        altitud_msnm = COALESCE($4, altitud_msnm),
        area_hectareas = COALESCE($5, area_hectareas),
        num_arboles = COALESCE($6, num_arboles),
        historia = COALESCE($7, historia),
        temporada_cosecha = COALESCE($8, temporada_cosecha),
        proceso_principal = COALESCE($9, proceso_principal),
        temp_promedio = COALESCE($10, temp_promedio),
        precipitacion_mm = COALESCE($11, precipitacion_mm),
        brillo_solar_h = COALESCE($12, brillo_solar_h),
        tipo_suelo = COALESCE($13, tipo_suelo),
        sombrio = COALESCE($14, sombrio),
        video_url = COALESCE($15, video_url),
        activa = COALESCE($16, activa)
      WHERE id = $17 AND caficultor_id = $18
      RETURNING *`,
      [
        nombre, municipio, departamento, altitud_msnm,
        area_hectareas, num_arboles, historia,
        temporada_cosecha, proceso_principal,
        temp_promedio, precipitacion_mm, brillo_solar_h,
        tipo_suelo, sombrio, video_url, activa,
        req.params.id, req.usuario.id
      ]
    );

    res.json({
      message: 'Finca actualizada exitosamente',
      finca: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar finca' });
  }
};

module.exports = { getMisFincas, getFinca, crearFinca, actualizarFinca };