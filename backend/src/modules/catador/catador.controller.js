const pool = require('../../config/db');

// GET /api/catador/dashboard
const getDashboard = async (req, res) => {
  try {
    const cataciones = await pool.query(
      `SELECT COUNT(*) AS total_cataciones,
              ROUND(AVG(puntaje_total)::numeric,1) AS promedio_puntaje
       FROM cataciones_sca
       WHERE catador_id = $1`,
      [req.usuario.id]
    );

    const pendientes = await pool.query(
      `SELECT c.id, c.variedad, c.proceso, c.qr_codigo,
              f.nombre AS nombre_finca, f.municipio,
              u.nombre AS nombre_caficultor,
              c.fecha_cierre
       FROM cosechas c
       JOIN fincas f   ON f.id = c.finca_id
       JOIN usuarios u ON u.id = f.caficultor_id
       WHERE c.estado = 'cerrada'
         AND c.id NOT IN (
           SELECT cosecha_id FROM cataciones_sca
           WHERE catador_id = $1
         )
       ORDER BY c.fecha_cierre DESC
       LIMIT 10`,
      [req.usuario.id]
    );

    res.json({
      stats:     cataciones.rows[0],
      pendientes: pendientes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

// GET /api/catador/historial
const getHistorial = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cs.*,
              c.variedad, c.proceso, c.qr_codigo,
              f.nombre  AS nombre_finca,
              f.municipio,
              u.nombre  AS nombre_caficultor
       FROM cataciones_sca cs
       JOIN cosechas c ON c.id = cs.cosecha_id
       JOIN fincas f   ON f.id = c.finca_id
       JOIN usuarios u ON u.id = f.caficultor_id
       WHERE cs.catador_id = $1
       ORDER BY cs.creado_en DESC`,
      [req.usuario.id]
    );
    res.json({ cataciones: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// POST /api/catador/cataciones
const crearCatacion = async (req, res) => {
  const {
    cosecha_id, fragancia_aroma, sabor, post_gusto,
    acidez, cuerpo, balance, uniformidad,
    taza_limpia, dulzor, impresion_global,
    notas_sabor, notas_narrativas
  } = req.body;

  if (!cosecha_id) {
    return res.status(400).json({ error: 'cosecha_id es obligatorio' });
  }

  const campos = [
    fragancia_aroma, sabor, post_gusto, acidez,
    cuerpo, balance, uniformidad, taza_limpia,
    dulzor, impresion_global
  ];
  const puntaje_total = campos
    .map(v => parseFloat(v) || 0)
    .reduce((a, b) => a + b, 0);

  try {
    const existe = await pool.query(
      'SELECT id FROM cataciones_sca WHERE cosecha_id=$1 AND catador_id=$2',
      [cosecha_id, req.usuario.id]
    );
    if (existe.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe una catación para esta cosecha' });
    }

    const result = await pool.query(
      `INSERT INTO cataciones_sca (
        cosecha_id, catador_id,
        fragancia_aroma, sabor, post_gusto, acidez,
        cuerpo, balance, uniformidad, taza_limpia,
        dulzor, impresion_global, puntaje_total,
        notas_sabor, notas_narrativas
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *`,
      [
        cosecha_id, req.usuario.id,
        fragancia_aroma||0, sabor||0, post_gusto||0, acidez||0,
        cuerpo||0, balance||0, uniformidad||0, taza_limpia||0,
        dulzor||0, impresion_global||0, puntaje_total,
        notas_sabor ? JSON.stringify(notas_sabor) : null,
        notas_narrativas || null
      ]
    );

    res.status(201).json({
      message: `Catación completada. Puntaje: ${puntaje_total.toFixed(1)}/100`,
      catacion: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear catación' });
  }
};

module.exports = { getDashboard, getHistorial, crearCatacion };