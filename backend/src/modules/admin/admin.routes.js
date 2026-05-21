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
  getEstadisticas,
  getPerfilCliente,
  crearCafeteria,
} = require('./admin.controller');

router.use(verificarToken);
router.use(verificarRol('admin'));

router.get('/usuarios',                        getUsuarios);
router.get('/usuarios/:id',                    getUsuario);
router.get('/usuarios/:id/perfil',             getPerfilCliente);
router.post('/usuarios/:id/roles',             asignarRol);
router.put('/usuarios/:id/desactivar',         desactivarUsuario);
router.get('/cosechas/sin-asignar',            getCosechasSinAsignar);
router.post('/cosechas/:cosecha_id/asignar',   asignarCosechaACafeteria);
router.get('/dashboard',                       getDashboard);
router.get('/estadisticas',                    getEstadisticas);
router.post('/cafeterias', crearCafeteria);
module.exports = router;