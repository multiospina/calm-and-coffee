const router = require('express').Router();
const { recibirTemperatura, obtenerTemperatura } = require('./temperatura.controller');

// Rutas públicas — sin autenticación
// El ESP32 y los jueces acceden sin token
router.post('/', recibirTemperatura);
router.get('/',  obtenerTemperatura);

module.exports = router;
