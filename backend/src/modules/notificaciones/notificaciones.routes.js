const router = require('express').Router();
const { verificarToken } = require('../../middlewares/auth');
const {
  getNotificaciones, marcarLeida, marcarTodasLeidas
} = require('./notificaciones.controller');

router.use(verificarToken);

router.get('/',          getNotificaciones);
router.put('/:id/leer', marcarLeida);
router.put('/leer/todas',marcarTodasLeidas);

module.exports = router;