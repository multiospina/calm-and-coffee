const router = require('express').Router();
const { verificarToken, verificarRol } = require('../../middlewares/auth');
const {
  getTrazabilidad,
  getMenuCafeteria,
  getCafeterias
} = require('./publico.controller');
const {
  getDashboard,
  getHistorial,
  getPasaporte
} = require('./dashboard.controller');
const {
  getPreferencias,
  guardarPreferencias,
  completarCuestionario
} = require('./preferencias.controller');
const {
  crearPedido,
  getMisPedidos,
  valorarPedido
} = require('./pedidos.controller');

// ── Rutas PÚBLICAS ────────────────────────────────────────
router.get('/trazabilidad/:qr_codigo', getTrazabilidad);
router.get('/cafeterias',              getCafeterias);
router.get('/cafeterias/:id/menu',     getMenuCafeteria);

// ── Rutas PRIVADAS ────────────────────────────────────────
router.use(verificarToken);
router.use(verificarRol('cliente'));

router.get('/dashboard',               getDashboard);
router.get('/historial',               getHistorial);
router.get('/pasaporte',               getPasaporte);
router.get('/preferencias',            getPreferencias);
router.post('/preferencias',           guardarPreferencias);
router.post('/cuestionario/completar', completarCuestionario);

// Pedidos
router.post('/pedidos',                crearPedido);
router.get('/pedidos',                 getMisPedidos);
router.post('/pedidos/:id/valorar',    valorarPedido);

module.exports = router;