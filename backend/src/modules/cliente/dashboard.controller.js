const pool = require('../../config/db');

// ── GET /api/cliente/dashboard ───────────────────────────────
const getDashboard = async (req, res) => {
  const clienteId = req.usuario.id;

  try {
    // 1. Pasaporte actual
    const pasaporteRes = await pool.query(
      `SELECT puntos, nivel, cafes_catados,
              cafeterias_visitadas, procesos_catados,
              variedades_catadas, actualizado_en
       FROM pasaporte_cafetero
       WHERE cliente_id = $1`,
      [clienteId]
    );

    // 2. Preferencias más recientes
    const prefRes = await pool.query(
      `SELECT sabores_favoritos, intensidad, momentos_favoritos
       FROM preferencias_usuario
       WHERE cliente_id = $1
       ORDER BY creado_en DESC LIMIT 1`,
      [clienteId]
    );

    const pref = prefRes.rows[0];

    // 3. Recomendaciones personalizadas basadas en preferencias
    let recomendaciones = [];
    if (pref) {
      const sabores    = pref.sabores_favoritos  || [];
      const intensidad = pref.intensidad         || 'equilibrado';

      const mapaIntensidad = {
        suave:             ['lavado'],
        equilibrado:       ['lavado', 'honey'],
        medio_pronunciado: ['honey', 'natural'],
        intenso:           ['natural', 'anaerobico'],
      };
      const procesosRecom = mapaIntensidad[intensidad] || ['lavado'];

      recomendaciones = await pool.query(
        `SELECT mi.id, mi.nombre, mi.precio,
                mi.foto_url, mi.descripcion,
                c.variedad, c.proceso,
                c.qr_codigo,
                f.nombre         AS nombre_finca,
                f.municipio,
                f.altitud_msnm,
                ROUND(AVG(v.cafe_experiencia)::numeric,1) AS rating,
                COUNT(v.id) AS total_valoraciones
         FROM menu_items mi
         JOIN cosechas c       ON c.id = mi.cosecha_id
         JOIN fincas f         ON f.id = c.finca_id
         JOIN cosecha_cafeteria cc ON cc.cosecha_id = c.id
         LEFT JOIN pedidos p   ON p.menu_item_id = mi.id
         LEFT JOIN valoraciones v ON v.pedido_id = p.id
         WHERE mi.activo = true
           AND cc.activa = true
           AND c.proceso = ANY($1::text[])
         GROUP BY mi.id, c.variedad, c.proceso,
                  c.qr_codigo, f.nombre,
                  f.municipio, f.altitud_msnm
         ORDER BY rating DESC NULLS LAST
         LIMIT 3`,
        [procesosRecom]
      );
      recomendaciones = recomendaciones.rows;
    }

    // 4. Notificaciones — insignias desbloqueables
    let insigniasPendientes = [];
    const pasaporte = pasaporteRes.rows[0];
    if (pasaporte) {
      insigniasPendientes = await pool.query(
        `SELECT i.id, i.nombre, i.descripcion,
                i.puntos_otorga, i.condicion
         FROM insignias i
         WHERE i.id NOT IN (
           SELECT pi.insignia_id
           FROM pasaporte_insignias pi
           JOIN pasaporte_cafetero pc ON pc.id = pi.pasaporte_id
           WHERE pc.cliente_id = $1
         )
         ORDER BY i.puntos_otorga ASC
         LIMIT 3`,
        [clienteId]
      );
      insigniasPendientes = insigniasPendientes.rows;
    }

    res.json({
      pasaporte:            pasaporte || null,
      preferencias:         pref      || null,
      recomendaciones,
      insignias_pendientes: insigniasPendientes,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener dashboard' });
  }
};

// ── GET /api/cliente/historial ───────────────────────────────
const getHistorial = async (req, res) => {
  const clienteId = req.usuario.id;

  try {
    const result = await pool.query(
      `SELECT hc.id, hc.escaneado_en, hc.tipo_qr,
              hc.puntos_ganados,
              c.variedad, c.proceso, c.qr_codigo,
              f.nombre         AS nombre_finca,
              f.municipio,
              ca.nombre        AS nombre_cafeteria,
              v.cafe_aroma, v.cafe_sabor,
              v.cafe_experiencia, v.notas_sabor,
              v.comentario
       FROM historial_catas hc
       JOIN cosechas c          ON c.id = hc.cosecha_id
       JOIN fincas f            ON f.id = c.finca_id
       LEFT JOIN cafeterias ca  ON ca.id = hc.cafeteria_id
       LEFT JOIN pedidos p      ON p.cliente_id = $1
                               AND p.cafeteria_id = hc.cafeteria_id
       LEFT JOIN valoraciones v ON v.pedido_id = p.id
                               AND v.cliente_id = $1
       WHERE hc.cliente_id = $1
       ORDER BY hc.escaneado_en DESC`,
      [clienteId]
    );

    res.json({ historial: result.rows, total: result.rows.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// ── GET /api/cliente/pasaporte ───────────────────────────────
const getPasaporte = async (req, res) => {
  const clienteId = req.usuario.id;

  try {
    const pasaporteRes = await pool.query(
      `SELECT pc.*, u.nombre AS nombre_cliente,
              u.municipio, u.creado_en AS miembro_desde
       FROM pasaporte_cafetero pc
       JOIN usuarios u ON u.id = pc.cliente_id
       WHERE pc.cliente_id = $1`,
      [clienteId]
    );

    if (pasaporteRes.rows.length === 0) {
      return res.status(404).json({ error: 'Pasaporte no encontrado' });
    }

    const pasaporte = pasaporteRes.rows[0];

    // Insignias desbloqueadas
    const insigniasRes = await pool.query(
      `SELECT i.id, i.nombre, i.descripcion,
              i.puntos_otorga, pi.desbloqueada_en
       FROM pasaporte_insignias pi
       JOIN insignias i ON i.id = pi.insignia_id
       WHERE pi.pasaporte_id = $1
       ORDER BY pi.desbloqueada_en DESC`,
      [pasaporte.id]
    );

    // Todas las insignias (para mostrar progreso)
    const todasRes = await pool.query(
      `SELECT i.*,
              CASE WHEN pi.insignia_id IS NOT NULL
                   THEN true ELSE false END AS desbloqueada
       FROM insignias i
       LEFT JOIN pasaporte_insignias pi
              ON pi.insignia_id = i.id
             AND pi.pasaporte_id = $1
       ORDER BY i.puntos_otorga ASC`,
      [pasaporte.id]
    );

    const niveles = [
      { nivel: 0, nombre: 'Curioso',          puntos_min: 0,   puntos_max: 50  },
      { nivel: 1, nombre: 'Explorador',        puntos_min: 51,  puntos_max: 150 },
      { nivel: 2, nombre: 'Conocedor',         puntos_min: 151, puntos_max: 350 },
      { nivel: 3, nombre: 'Entendido',         puntos_min: 351, puntos_max: 700 },
      { nivel: 4, nombre: 'Maestro Catador',   puntos_min: 701, puntos_max: 9999},
    ];

    const nivelActual   = niveles[pasaporte.nivel];
    const nivelSiguiente= niveles[pasaporte.nivel + 1] || null;
    const puntosParaSiguiente = nivelSiguiente
      ? nivelSiguiente.puntos_min - pasaporte.puntos
      : 0;

    res.json({
      pasaporte,
      nivel_actual:         nivelActual,
      nivel_siguiente:      nivelSiguiente,
      puntos_para_siguiente: puntosParaSiguiente,
      insignias_desbloqueadas: insigniasRes.rows,
      todas_las_insignias:     todasRes.rows,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener pasaporte' });
  }
};

module.exports = { getDashboard, getHistorial, getPasaporte };