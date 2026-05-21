const router = require('express').Router();
const { verificarToken, verificarRol } = require('../../middlewares/auth');
const {
  getDashboard,
  getHistorial,
  crearCatacion
} = require('./catador.controller');

router.use(verificarToken);
router.use(verificarRol('catador'));

router.get('/dashboard',   getDashboard);
router.get('/historial',   getHistorial);
router.post('/cataciones', crearCatacion);

module.exports = router;