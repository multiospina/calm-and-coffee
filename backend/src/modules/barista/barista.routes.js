const router = require('express').Router();
const { verificarToken, verificarRol } = require('../../middlewares/auth');
const {
  getMiTurno,
  getColaPedidos,
  avanzarEstadoPedido,
  getMisMetricas,
  getPerfilClienteBarista,
   reportarProblema,
} = require('./barista.controller');

router.use(verificarToken);
router.use(verificarRol('barista'));

router.get('/turno',               getMiTurno);
router.get('/pedidos',             getColaPedidos);
router.put('/pedidos/:id/estado',  avanzarEstadoPedido);
router.get('/metricas',            getMisMetricas);
router.get('/clientes/:id/perfil', getPerfilClienteBarista);
router.post('/pedidos/:id/reportar', reportarProblema);
module.exports = router;