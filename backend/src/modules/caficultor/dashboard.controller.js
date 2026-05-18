const pool = require('../../config/db');

const getDashboard = async (req, res) => {
  try {
    const fincas = await pool.query(
      `SELECT COUNT(*) AS total_fincas,
              SUM(area_hectareas) AS total_hectareas,
              SUM(num_arboles) AS total_arboles
       FROM fincas WHERE caficultor_id = $1`,
      [req.usuario.id]
    );

    const cosechas = await pool.query(
      `SELECT
         COUNT(*)                                        AS total_cosechas,
         COUNT(CASE WHEN c.estado='activa'  THEN 1 END) AS activas,
         COUNT(CASE WHEN c.estado='cerrada' THEN 1 END) AS cerradas,
         SUM(c.kg_producidos)                           AS kg_totales
       FROM cosechas c
       JOIN fincas f ON f.id = c.finca_id
       WHERE f.caficultor_id = $1`,
      [req.usuario.id]
    );

    const cafeterias = await pool.query(
      `SELECT COUNT(DISTINCT cc.cafeteria_id) AS total_cafeterias
       FROM cosecha_cafeteria cc
       JOIN cosechas c ON c.id = cc.cosecha_id
       JOIN fincas f   ON f.id = c.finca_id
       WHERE f.caficultor_id = $1 AND cc.activa = true`,
      [req.usuario.id]
    );

    const satisfaccion = await pool.query(
      `SELECT ROUND(AVG(v.cafe_experiencia)::numeric,1) AS promedio,
              COUNT(v.id) AS total_valoraciones
       FROM valoraciones v
       JOIN pedidos p     ON p.id  = v.pedido_id
       JOIN menu_items mi ON mi.id = p.menu_item_id
       JOIN cosechas c    ON c.id  = mi.cosecha_id
       JOIN fincas f      ON f.id  = c.finca_id
       WHERE f.caficultor_id = $1`,
      [req.usuario.id]
    );

    const topCosechas = await pool.query(
      `SELECT c.variedad, c.proceso, c.qr_codigo,
              f.nombre AS nombre_finca,
              COUNT(DISTINCT p.id) AS total_pedidos,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating
       FROM cosechas c
       JOIN fincas f            ON f.id  = c.finca_id
       LEFT JOIN menu_items mi  ON mi.cosecha_id = c.id
       LEFT JOIN pedidos p      ON p.menu_item_id = mi.id
       LEFT JOIN valoraciones v ON v.pedido_id    = p.id
       WHERE f.caficultor_id = $1
       GROUP BY c.id, f.nombre
       ORDER BY total_pedidos DESC
       LIMIT 5`,
      [req.usuario.id]
    );

    res.json({
      fincas:       fincas.rows[0],
      cosechas:     cosechas.rows[0],
      cafeterias:   cafeterias.rows[0],
      satisfaccion: satisfaccion.rows[0],
      top_cosechas: topCosechas.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

const getFeedback = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         v.cafe_aroma, v.cafe_sabor, v.cafe_cuerpo,
         v.cafe_balance, v.cafe_experiencia,
         v.precio_justo, v.notas_adicionales,
         v.creado_en,
         u.nombre  AS nombre_cliente,
         mi.nombre AS nombre_cafe,
         c.variedad, c.proceso,
         f.nombre  AS nombre_finca
       FROM valoraciones v
       JOIN pedidos p     ON p.id  = v.pedido_id
       JOIN usuarios u    ON u.id  = p.cliente_id
       JOIN menu_items mi ON mi.id = p.menu_item_id
       JOIN cosechas c    ON c.id  = mi.cosecha_id
       JOIN fincas f      ON f.id  = c.finca_id
       WHERE f.caficultor_id = $1
       ORDER BY v.creado_en DESC
       LIMIT 20`,
      [req.usuario.id]
    );

    res.json({ feedback: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener feedback' });
  }
};

module.exports = { getDashboard, getFeedback };