const pool = require('../../config/db');

// GET /api/caficultor/cosechas/:cosecha_id/etapas
const getEtapas = async (req, res) => {
  try {
    const cosecha = await pool.query(
      `SELECT c.id FROM cosechas c
       JOIN fincas f ON f.id = c.finca_id
       WHERE c.id = $1 AND f.caficultor_id = $2`,
      [req.params.cosecha_id, req.usuario.id]
    );

    if (cosecha.rows.length === 0) {
      return res.status(404).json({ error: 'Cosecha no encontrada' });
    }

    const result = await pool.query(
      `SELECT e.*, u.nombre AS registrado_por_nombre
       FROM etapas_cosecha e
       LEFT JOIN usuarios u ON u.id = e.registrado_por
       WHERE e.cosecha_id = $1
       ORDER BY e.fecha ASC`,
      [req.params.cosecha_id]
    );

    res.json({ etapas: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener etapas' });
  }
};

// POST /api/caficultor/cosechas/:cosecha_id/etapas
const crearEtapa = async (req, res) => {
  const { tipo_etapa, fecha, descripcion, fotos_urls, datos_extra } = req.body;

  if (!tipo_etapa || !fecha || !descripcion) {
    return res.status(400).json({
      error: 'Tipo de etapa, fecha y descripción son obligatorios'
    });
  }

  const tiposValidos = [
    'cultivo', 'floracion', 'maduracion', 'recoleccion',
    'beneficio', 'secado', 'tostion', 'despacho'
  ];

  if (!tiposValidos.includes(tipo_etapa)) {
    return res.status(400).json({
      error: `Tipo inválido. Opciones: ${tiposValidos.join(', ')}`
    });
  }

  try {
    const cosecha = await pool.query(
      `SELECT c.id FROM cosechas c
       JOIN fincas f ON f.id = c.finca_id
       WHERE c.id = $1 AND f.caficultor_id = $2`,
      [req.params.cosecha_id, req.usuario.id]
    );

    if (cosecha.rows.length === 0) {
      return res.status(404).json({ error: 'Cosecha no encontrada' });
    }

    const result = await pool.query(
      `INSERT INTO etapas_cosecha (
        cosecha_id, tipo_etapa, fecha, descripcion,
        fotos_urls, datos_extra, registrado_por
      ) VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        req.params.cosecha_id, tipo_etapa, fecha, descripcion,
        fotos_urls || null,
        datos_extra ? JSON.stringify(datos_extra) : null,
        req.usuario.id
      ]
    );

    res.status(201).json({
      message: 'Etapa registrada exitosamente',
      etapa: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear etapa' });
  }
};

module.exports = { getEtapas, crearEtapa };