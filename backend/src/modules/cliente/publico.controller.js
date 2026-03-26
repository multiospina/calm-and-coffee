const pool = require('../../config/db');

// ── GET /api/cliente/trazabilidad/:qr_codigo ─────────────────
// Vista pública — el consumidor escanea el QR del pocillo
const getTrazabilidad = async (req, res) => {
  const { qr_codigo } = req.params;

  try {
    // 1. Buscar la cosecha por QR
    const cosechaRes = await pool.query(
      `SELECT c.id, c.variedad, c.proceso, c.lote_nombre,
              c.fecha_inicio, c.fecha_cierre, c.kg_producidos,
              c.qr_codigo,
              f.nombre        AS nombre_finca,
              f.municipio     AS municipio_finca,
              f.departamento,
              f.altitud_msnm,
              f.historia      AS historia_finca,
              f.video_url,
              u.nombre        AS nombre_caficultor,
              u.municipio     AS municipio_caficultor,
              ls.nombre       AS nombre_lote,
              ls.fecha_siembra,
              ls.notas_siembra,
              ls.variedad     AS variedad_lote
       FROM cosechas c
       JOIN fincas f         ON f.id = c.finca_id
       JOIN usuarios u       ON u.id = f.caficultor_id
       LEFT JOIN lotes_siembra ls ON ls.id = c.lote_id
       WHERE c.qr_codigo = $1 AND c.estado = 'cerrada'`,
      [qr_codigo]
    );

    if (cosechaRes.rows.length === 0) {
      return res.status(404).json({
        error: 'QR no encontrado o cosecha no disponible'
      });
    }

    const cosecha = cosechaRes.rows[0];

    // 2. Etapas de la cosecha (la historia completa)
    const etapasRes = await pool.query(
      `SELECT tipo_etapa, fecha, descripcion,
              fotos_urls, datos_extra
       FROM etapas_cosecha
       WHERE cosecha_id = $1
       ORDER BY fecha ASC`,
      [cosecha.id]
    );

    // 3. Catación profesional SCA (si existe)
    const catacionRes = await pool.query(
      `SELECT puntaje_total, notas_narrativas,
              notas_sabor, recomendacion_prep,
              fecha_catacion,
              fragancia_aroma, sabor, acidez,
              cuerpo, balance, dulzor
       FROM cataciones
       WHERE cosecha_id = $1 AND tipo = 'profesional'
       ORDER BY fecha_catacion DESC
       LIMIT 1`,
      [cosecha.id]
    );

    // 4. Valoraciones del público (promedio)
    const valoracionesRes = await pool.query(
      `SELECT ROUND(AVG(cafe_aroma)::numeric, 1)       AS avg_aroma,
              ROUND(AVG(cafe_sabor)::numeric, 1)       AS avg_sabor,
              ROUND(AVG(cafe_cuerpo)::numeric, 1)      AS avg_cuerpo,
              ROUND(AVG(cafe_experiencia)::numeric, 1) AS avg_experiencia,
              COUNT(*)                                  AS total_valoraciones
       FROM valoraciones v
       JOIN pedidos p ON p.id = v.pedido_id
       JOIN menu_items mi ON mi.id = p.menu_item_id
       WHERE mi.cosecha_id = $1`,
      [cosecha.id]
    );

    // 5. Calcular años desde siembra para narrativa
    let narrativaSiembra = null;
    if (cosecha.fecha_siembra) {
      const siembra = new Date(cosecha.fecha_siembra);
      const hoy     = new Date();
      const years   = Math.floor((hoy - siembra) / (1000 * 60 * 60 * 24 * 365));
      const months  = Math.floor(((hoy - siembra) % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
      narrativaSiembra = `Árboles sembrados hace ${years} año${years !== 1 ? 's' : ''} y ${months} mes${months !== 1 ? 'es' : ''}`;
    }

    res.json({
      cosecha: {
        id:           cosecha.id,
        variedad:     cosecha.variedad,
        proceso:      cosecha.proceso,
        lote_nombre:  cosecha.lote_nombre,
        fecha_inicio: cosecha.fecha_inicio,
        fecha_cierre: cosecha.fecha_cierre,
        kg_producidos:cosecha.kg_producidos,
        qr_codigo:    cosecha.qr_codigo,
      },
      finca: {
        nombre:      cosecha.nombre_finca,
        municipio:   cosecha.municipio_finca,
        departamento:cosecha.departamento,
        altitud_msnm:cosecha.altitud_msnm,
        historia:    cosecha.historia_finca,
        video_url:   cosecha.video_url,
      },
      caficultor: {
        nombre:    cosecha.nombre_caficultor,
        municipio: cosecha.municipio_caficultor,
      },
      lote: cosecha.fecha_siembra ? {
        nombre:          cosecha.nombre_lote,
        fecha_siembra:   cosecha.fecha_siembra,
        notas_siembra:   cosecha.notas_siembra,
        narrativa:       narrativaSiembra,
      } : null,
      etapas:      etapasRes.rows,
      catacion:    catacionRes.rows[0] || null,
      valoraciones: valoracionesRes.rows[0],
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener trazabilidad' });
  }
};

// ── GET /api/cliente/cafeterias ──────────────────────────────
const getCafeterias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ca.id, ca.nombre, ca.direccion,
              ca.municipio, ca.descripcion,
              ca.foto_url, ca.horario,
              COUNT(DISTINCT cc.cosecha_id) AS cosechas_activas,
              ROUND(AVG(v.cafe_experiencia)::numeric, 1) AS rating
       FROM cafeterias ca
       LEFT JOIN cosecha_cafeteria cc
              ON cc.cafeteria_id = ca.id AND cc.activa = true
       LEFT JOIN menu_items mi ON mi.cafeteria_id = ca.id
       LEFT JOIN pedidos p     ON p.menu_item_id = mi.id
       LEFT JOIN valoraciones v ON v.pedido_id = p.id
       WHERE ca.activa = true
       GROUP BY ca.id
       ORDER BY ca.nombre ASC`
    );

    res.json({ cafeterias: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cafeterías' });
  }
};

// ── GET /api/cliente/cafeterias/:id/menu ─────────────────────
const getMenuCafeteria = async (req, res) => {
  try {
    const cafeteria = await pool.query(
      'SELECT * FROM cafeterias WHERE id = $1 AND activa = true',
      [req.params.id]
    );

    if (cafeteria.rows.length === 0) {
      return res.status(404).json({ error: 'Cafetería no encontrada' });
    }

    const menu = await pool.query(
      `SELECT mi.id, mi.nombre, mi.tipo,
              mi.descripcion, mi.precio,
              mi.metodos_prep, mi.foto_url,
              mi.stock,
              c.variedad, c.proceso,
              c.qr_codigo,
              f.nombre         AS nombre_finca,
              f.municipio      AS municipio_finca,
              f.altitud_msnm,
              ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating,
              COUNT(v.id) AS total_valoraciones
       FROM menu_items mi
       LEFT JOIN cosechas c     ON c.id = mi.cosecha_id
       LEFT JOIN fincas f       ON f.id = c.finca_id
       LEFT JOIN pedidos p      ON p.menu_item_id = mi.id
       LEFT JOIN valoraciones v ON v.pedido_id = p.id
       WHERE mi.cafeteria_id = $1 AND mi.activo = true
       GROUP BY mi.id, c.variedad, c.proceso,
                c.qr_codigo, f.nombre,
                f.municipio, f.altitud_msnm
       ORDER BY mi.nombre ASC`,
      [req.params.id]
    );

    res.json({
      cafeteria: cafeteria.rows[0],
      menu:      menu.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener menú' });
  }
};

module.exports = { getTrazabilidad, getCafeterias, getMenuCafeteria };