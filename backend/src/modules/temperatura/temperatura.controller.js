let ultimaTemp = {
  temperatura: null,
  zona: null,
  mensaje: null,
  actualizado: null,
  dispositivo: null,
};

const recibirTemperatura = async (req, res) => {
  const { temperatura, zona, mensaje, dispositivo } = req.body;
  if (temperatura === undefined || temperatura === null) {
    return res.status(400).json({ error: 'temperatura es requerida' });
  }
  ultimaTemp = {
    temperatura: parseFloat(temperatura),
    zona: zona || 'desconocida',
    mensaje: mensaje || '',
    dispositivo: dispositivo || 'ESP32-CEA',
    actualizado: new Date().toISOString(),
  };
  res.json({ ok: true, recibido: ultimaTemp.temperatura });
};

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
  const diff = Date.now() - new Date(ultimaTemp.actualizado).getTime();
  res.json({ ...ultimaTemp, conectado: diff < 15000 });
};

module.exports = { recibirTemperatura, obtenerTemperatura };