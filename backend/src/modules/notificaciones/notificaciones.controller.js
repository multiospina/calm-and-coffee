const pool = require('../../config/db');

const getNotificaciones = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notificaciones
       WHERE usuario_id = $1
       ORDER BY creado_en DESC
       LIMIT 20`,
      [req.usuario.id]
    );

    const noLeidas = await pool.query(
      `SELECT COUNT(*) FROM notificaciones
       WHERE usuario_id = $1 AND leida = false`,
      [req.usuario.id]
    );

    res.json({
      notificaciones: result.rows,
      no_leidas: parseInt(noLeidas.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener notificaciones' });
  }
};

const marcarLeida = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notificaciones SET leida = true
       WHERE id = $1 AND usuario_id = $2`,
      [req.params.id, req.usuario.id]
    );
    res.json({ message: 'Notificación marcada como leída' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
};

const marcarTodasLeidas = async (req, res) => {
  try {
    await pool.query(
      `UPDATE notificaciones SET leida = true
       WHERE usuario_id = $1`,
      [req.usuario.id]
    );
    res.json({ message: 'Todas marcadas como leídas' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error' });
  }
};

module.exports = { getNotificaciones, marcarLeida, marcarTodasLeidas };