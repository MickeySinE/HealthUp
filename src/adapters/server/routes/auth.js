const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Cliente normal para consultas a la BD
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Cliente admin para manejar Supabase Auth
const supabaseAdmin = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ── REGISTRO ───────────────────────────────────
router.post('/register', async (req, res) => {
  const { username, email, pwd } = req.body;

  if (!username || !email || !pwd) {
    return res.status(400).json({ error: 'Todos los campos son requeridos.' });
  }

  if (pwd.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    // Verificar si el username ya existe en nuestra tabla
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'El nombre de usuario ya está en uso.' });
    }

    // Crear usuario en Supabase Auth — manda correo de confirmación automáticamente
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: pwd,
      email_confirm: false,
      user_metadata: { username }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        return res.status(409).json({ error: 'El correo ya está registrado.' });
      }
      throw authError;
    }

    // Guardar datos extra en nuestra tabla users
    const { error: dbError } = await supabase
      .from('users')
      .insert([{
        id:       authData.user.id,
        username,
        email,
        pwd:      '—'
      }]);

    if (dbError) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    return res.status(201).json({
      message: 'Cuenta creada. Revisa tu correo para confirmar tu cuenta antes de iniciar sesión.',
    });

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
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pwd
    });

    if (authError) {
      if (authError.message.includes('Email not confirmed')) {
        return res.status(401).json({ error: 'Debes confirmar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.' });
      }
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('id, username, email, bio, foto_url')
      .eq('id', authData.user.id)
      .single();

    if (dbError || !userData) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    return res.status(200).json({
      message: 'Login exitoso.',
      user: {
        id:       userData.id,
        username: userData.username,
        email:    userData.email,
      }
    });

  } catch (err) {
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;