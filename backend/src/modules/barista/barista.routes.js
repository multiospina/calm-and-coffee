const router = require('express').Router();
const { verificarToken, verificarRol } = require('../../middlewares/auth');
const {
  getMiTurno,
  getColaPedidos,
  avanzarEstadoPedido,
  getMisMetricas,
  getPerfilClienteBarista,
  reportarProblema,
  getStockCafeteria,
  agotarCafe,
  getRendimiento,
} = require('./barista.controller');

router.use(verificarToken);
router.use(verificarRol('barista'));

router.get('/turno',               getMiTurno);
router.get('/pedidos',             getColaPedidos);
router.put('/pedidos/:id/estado',  avanzarEstadoPedido);
router.get('/metricas',            getMisMetricas);
router.get('/clientes/:id/perfil', getPerfilClienteBarista);
router.post('/pedidos/:id/reportar', reportarProblema);
router.get('/stock',               getStockCafeteria);
router.put('/stock/:id/agotar',    agotarCafe);
router.get('/rendimiento',         getRendimiento);

module.exports = router;