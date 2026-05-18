const router = require('express').Router();
const { verificarToken, verificarRol } = require('../../middlewares/auth');
const {
  getMiCafeteria,    getMisCafeterias,  actualizarCafeteria,
  actualizarMesas,
  getMenu,           crearMenuItem,     actualizarMenuItem,
  getTurnos,         crearTurno,        asignarBarista,
  desasignarBarista, cambiarEstadoTurno, eliminarTurno,
  getDashboard,      getVentas,
  getBaristas,       crearBarista,
  getEquipo,
  getPedidosHoy,
  getCosechas,
  getVisionGeneral,
} = require('./gerente.controller');

router.use(verificarToken);
router.use(verificarRol('gerente'));

router.get('/cafeterias',                         getMisCafeterias);
router.get('/cafeteria',                          getMiCafeteria);
router.put('/cafeteria',                          actualizarCafeteria);
router.put('/cafeteria/mesas',                    actualizarMesas);
router.get('/menu',                               getMenu);
router.post('/menu',                              crearMenuItem);
router.put('/menu/:id',                           actualizarMenuItem);
router.get('/turnos',                             getTurnos);
router.post('/turnos',                            crearTurno);
router.put('/turnos/:id/estado',                  cambiarEstadoTurno);
router.delete('/turnos/:id',                      eliminarTurno);
router.post('/turnos/:id/baristas',               asignarBarista);
router.delete('/turnos/:id/baristas/:barista_id', desasignarBarista);
router.get('/baristas',                           getBaristas);
router.post('/baristas',                          crearBarista);
router.get('/equipo',                             getEquipo);
router.get('/vision-general',                     getVisionGeneral);
router.get('/pedidos/hoy',                        getPedidosHoy);
router.get('/cosechas',                           getCosechas);
router.get('/dashboard',                          getDashboard);
router.get('/ventas',                             getVentas);

module.exports = router;