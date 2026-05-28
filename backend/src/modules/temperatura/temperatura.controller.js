// ── Almacenamiento en memoria ─────────────────────────────────
let ultimaTemp = {
  temperatura:  null,
  zona:         null,
  mensaje:      null,
  actualizado:  null,
  dispositivo:  null,
};

// ── POST /api/temperatura ─────────────────────────────────────
// El ESP32 envía datos aquí cada 3 segundos
const recibirTemperatura = async (req, res) => {
  const { temperatura, zona, mensaje, dispositivo } = req.body;
  if (temperatura === undefined || temperatura === null) {
    return res.status(400).json({ error: 'temperatura es requerida' });
  }
  ultimaTemp = {
    temperatura:  parseFloat(temperatura),
    zona:         zona         || 'desconocida',
    mensaje:      mensaje      || '',
    dispositivo:  dispositivo  || 'ESP32-CEA',
    actualizado:  new Date().toISOString(),
  };
  console.log(`[TEMP] ${ultimaTemp.temperatura}°C | ${ultimaTemp.zona}`);
  res.json({ ok: true, recibido: ultimaTemp.temperatura });
};

// ── GET /api/temperatura ──────────────────────────────────────
// El frontend consulta aquí cada 3 segundos
const obtenerTemperatura = async (req, res) => {
  if (!ultimaTemp.actualizado) {
    return res.json({
      temperatura: null,
      zona: 'sin_datos',
      mensaje: 'Esperando datos del sensor...',
      actualizado: null,
      conectado: false,
    });
  }
  // Si el último dato tiene más de 15 segundos → sensor desconectado
  const diff = Date.now() - new Date(ultimaTemp.actualizado).getTime();
  const conectado = diff < 15000;
  res.json({ ...ultimaTemp, conectado });
};

module.exports = { recibirTemperatura, obtenerTemperatura };
