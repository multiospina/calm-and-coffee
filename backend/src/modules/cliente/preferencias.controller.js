const pool = require('../../config/db');

// ── GET /api/cliente/preferencias ────────────────────────────
const getPreferencias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM preferencias_usuario
       WHERE cliente_id = $1
       ORDER BY creado_en DESC
       LIMIT 1`,
      [req.usuario.id]
    );

    res.json({ preferencias: result.rows[0] || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener preferencias' });
  }
};

// ── POST /api/cliente/preferencias ───────────────────────────
const guardarPreferencias = async (req, res) => {
  const { sabores_favoritos, intensidad, momentos_favoritos } = req.body;

  if (!intensidad) {
    return res.status(400).json({ error: 'La intensidad es obligatoria' });
  }

  const intensidadesValidas = ['suave','equilibrado','medio_pronunciado','intenso'];
  if (!intensidadesValidas.includes(intensidad)) {
    return res.status(400).json({
      error: `Intensidad inválida. Opciones: ${intensidadesValidas.join(', ')}`
    });
  }

  try {
    // Calcular semana del año
    const ahora    = new Date();
    const inicio   = new Date(ahora.getFullYear(), 0, 1);
    const semana   = Math.ceil(((ahora - inicio) / 86400000 + inicio.getDay() + 1) / 7);

    const result = await pool.query(
      `INSERT INTO preferencias_usuario (
        cliente_id, sabores_favoritos,
        intensidad, momentos_favoritos,
        semana_actualizacion
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        req.usuario.id,
        sabores_favoritos   || [],
        intensidad,
        momentos_favoritos  || [],
        semana
      ]
    );

    res.status(201).json({
      message:      'Preferencias guardadas exitosamente',
      preferencias: result.rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar preferencias' });
  }
};

// ── POST /api/cliente/cuestionario/completar ─────────────────
const completarCuestionario = async (req, res) => {
  const { sabores_favoritos, intensidad, momentos_favoritos } = req.body;

  if (!intensidad) {
    return res.status(400).json({ error: 'La intensidad es obligatoria' });
  }

  try {
    // Guardar preferencias iniciales
    await pool.query(
      `INSERT INTO preferencias_usuario (
        cliente_id, sabores_favoritos,
        intensidad, momentos_favoritos, es_inicial
      ) VALUES ($1, $2, $3, $4, true)`,
      [
        req.usuario.id,
        sabores_favoritos  || [],
        intensidad,
        momentos_favoritos || []
      ]
    );

    // Marcar cuestionario como completado
    await pool.query(
      `UPDATE usuarios
       SET cuestionario_completado = true
       WHERE id = $1`,
      [req.usuario.id]
    );

    // Crear pasaporte cafetero si no existe
    const pasaporte = await pool.query(
      'SELECT id FROM pasaporte_cafetero WHERE cliente_id = $1',
      [req.usuario.id]
    );

    if (pasaporte.rows.length === 0) {
      await pool.query(
        `INSERT INTO pasaporte_cafetero (cliente_id)
         VALUES ($1)`,
        [req.usuario.id]
      );
    }

    res.json({
      message: 'Cuestionario completado. Pasaporte cafetero creado.',
      cuestionario_completado: true
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al completar cuestionario' });
  }
};

module.exports = {
  getPreferencias,
  guardarPreferencias,
  completarCuestionario
};