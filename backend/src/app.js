require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const http       = require('http');
const { Server } = require('socket.io');
const pool       = require('./config/db');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, {
  cors: { origin: '*' }
});

// ── Middlewares ──────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ── Rutas ────────────────────────────────────
const authRoutes       = require('./modules/auth/auth.routes');
const caficultorRoutes = require('./modules/caficultor/caficultor.routes');
const clienteRoutes = require('./modules/cliente/cliente.routes');
const baristaRoutes = require('./modules/barista/barista.routes');
const gerenteRoutes = require('./modules/gerente/gerente.routes');
const adminRoutes = require('./modules/admin/admin.routes');

app.use('/api/admin', adminRoutes);
app.use('/api/gerente', gerenteRoutes);
app.use('/api/barista', baristaRoutes);
app.use('/api/cliente', clienteRoutes);
app.use('/api/auth',       authRoutes);
app.use('/api/caficultor', caficultorRoutes);



// ── Ruta de salud ────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status:   'ok',
      message:  'CEA Backend funcionando',
      database: 'conectada',
      version:  '2.0.0'
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ── Socket.io ────────────────────────────────
// Exponer io para que los controllers puedan emitir eventos
app.set('io', io);
io.on('connection', (socket) => {
  console.log(`🔌 Socket conectado: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`🔌 Socket desconectado: ${socket.id}`);
  });
});

// ── Arrancar servidor ────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 CEA Backend corriendo en http://localhost:${PORT}`);
  console.log(`📋 Ambiente: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };