const router = require('express').Router();
const { verificarToken, verificarRol } = require('../../middlewares/auth');
const {
  getMisFincas, getFinca,
  crearFinca, actualizarFinca
} = require('./fincas.controller');
const {
  getMisLotes, getLote,
  crearLote, actualizarLote
} = require('./lotes.controller');
const {
  getMisCosechas, getCosecha,
  crearCosecha, actualizarCosecha,
  cerrarCosecha
} = require('./cosechas.controller');
const {
  getEtapas, crearEtapa
} = require('./etapas.controller');

router.use(verificarToken);
router.use(verificarRol('caficultor'));

// Fincas
router.get('/fincas',          getMisFincas);
router.get('/fincas/:id',      getFinca);
router.post('/fincas',         crearFinca);
router.put('/fincas/:id',      actualizarFinca);

// Lotes
router.get('/fincas/:finca_id/lotes',      getMisLotes);
router.get('/lotes/:id',                   getLote);
router.post('/fincas/:finca_id/lotes',     crearLote);
router.put('/lotes/:id',                   actualizarLote);

// Cosechas
router.get('/cosechas',              getMisCosechas);
router.get('/cosechas/:id',          getCosecha);
router.post('/cosechas',             crearCosecha);
router.put('/cosechas/:id',          actualizarCosecha);
router.post('/cosechas/:id/cerrar',  cerrarCosecha);

// Etapas
router.get('/cosechas/:cosecha_id/etapas',  getEtapas);
router.post('/cosechas/:cosecha_id/etapas', crearEtapa);

module.exports = router;