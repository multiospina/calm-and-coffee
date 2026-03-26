const router = require('express').Router();
const { verificarToken, verificarRol } = require('../../middlewares/auth');
const {
  getMiCafeteria,
  actualizarCafeteria,
  getMenu,
  crearMenuItem,
  actualizarMenuItem,
  getTurnos,
  crearTurno,
  asignarBarista,
  getDashboard
} = require('./gerente.controller');

router.use(verificarToken);
router.use(verificarRol('gerente'));

router.get('/cafeteria',                    getMiCafeteria);
router.put('/cafeteria',                    actualizarCafeteria);
router.get('/menu',                         getMenu);
router.post('/menu',                        crearMenuItem);
router.put('/menu/:id',                     actualizarMenuItem);
router.get('/turnos',                       getTurnos);
router.post('/turnos',                      crearTurno);
router.post('/turnos/:id/baristas',         asignarBarista);
router.get('/dashboard',                    getDashboard);

module.exports = router;