const router = require('express').Router();
const { verificarToken, verificarRol } = require('../../middlewares/auth');
const {
  getUsuarios,
  getUsuario,
  asignarRol,
  desactivarUsuario,
  getCosechasSinAsignar,
  asignarCosechaACafeteria,
  getDashboard,
  getEstadisticas
} = require('./admin.controller');

router.use(verificarToken);
router.use(verificarRol('admin'));

router.get('/usuarios',                           getUsuarios);
router.get('/usuarios/:id',                       getUsuario);
router.post('/usuarios/:id/roles',                asignarRol);
router.put('/usuarios/:id/desactivar',            desactivarUsuario);
router.get('/cosechas/sin-asignar',               getCosechasSinAsignar);
router.post('/cosechas/:cosecha_id/asignar',      asignarCosechaACafeteria);
router.get('/dashboard',                          getDashboard);
router.get('/estadisticas',                       getEstadisticas);

module.exports = router;