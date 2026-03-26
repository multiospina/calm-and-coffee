const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../../config/db');

const registro = async (req, res) => {
  const { nombre, email, password, municipio, telefono } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, municipio, telefono)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nombre, email, municipio, creado_en`,
      [nombre, email, hash, municipio || null, telefono || null]
    );

    const usuario = result.rows[0];

    await pool.query(
      'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, 6)',
      [usuario.id]
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      usuario
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.password_hash, u.activo,
              u.cuestionario_completado,
              ARRAY_AGG(r.nombre) AS roles
       FROM usuarios u
       JOIN usuario_roles ur ON ur.usuario_id = u.id
       JOIN roles r ON r.id = ur.rol_id
       WHERE u.email = $1
       GROUP BY u.id`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = result.rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    await pool.query(
      'UPDATE usuarios SET ultimo_login = now() WHERE id = $1',
      [usuario.id]
    );

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, email: usuario.email, roles: usuario.roles },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id:                     usuario.id,
        nombre:                 usuario.nombre,
        email:                  usuario.email,
        roles:                  usuario.roles,
        cuestionario_completado: usuario.cuestionario_completado
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const perfil = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.municipio, u.telefono,
              u.foto_url, u.cuestionario_completado, u.creado_en,
              ARRAY_AGG(r.nombre) AS roles
       FROM usuarios u
       JOIN usuario_roles ur ON ur.usuario_id = u.id
       JOIN roles r ON r.id = ur.rol_id
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ usuario: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { registro, login, perfil };