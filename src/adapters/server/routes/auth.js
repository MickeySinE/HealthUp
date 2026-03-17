const express    = require('express');
const bcrypt     = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const router  = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// ── REGISTRO ───────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, email, pwd } = req.body;

  if (!username || !email || !pwd) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }

  try {
    // Verificar si el email ya existe
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      return res.status(409).json({ error: 'El correo ya está registrado.' });
    }

    // Encriptar contraseña
    const hashedPwd = await bcrypt.hash(pwd, 10);

    // Insertar usuario
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, email, pwd: hashedPwd }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ message: 'Usuario creado correctamente.', user: { id: data.id, username: data.username, email: data.email } });

  } catch (err) {
    console.error('Error en registro:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ── LOGIN ──────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, pwd } = req.body;

  if (!email || !pwd) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }

  try {
    // Buscar usuario por email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    // Verificar contraseña
    const match = await bcrypt.compare(pwd, user.pwd);

    if (!match) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    return res.status(200).json({ message: 'Login exitoso.', user: { id: user.id, username: user.username, email: user.email } });

  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;