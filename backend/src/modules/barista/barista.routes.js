const router = require('express').Router();
const { verificarToken, verificarRol } = require('../../middlewares/auth');
const {
  getMiTurno,
  getColaPedidos,
  avanzarEstadoPedido,
  getMisMetricas
} = require('./barista.controller');

router.use(verificarToken);
router.use(verificarRol('barista'));

router.get('/turno',              getMiTurno);
router.get('/pedidos',            getColaPedidos);
router.put('/pedidos/:id/estado', avanzarEstadoPedido);
router.get('/metricas',           getMisMetricas);

module.exports = router;