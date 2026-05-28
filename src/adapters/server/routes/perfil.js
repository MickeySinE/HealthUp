const express  = require('express');
const { createClient } = require('@supabase/supabase-js');
const router   = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET perfil
router.get('/:id', async (req, res) => {
  const { data: user, error } = await supabase.from('users').select('id, username, email, bio, foto_url').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Usuario no encontrado' });
  const { data: posts } = await supabase.from('posts').select('*').eq('user_id', req.params.id).order('created_at', { ascending: false });
  res.json({ ...user, posts: posts || [] });
});

// PUT actualizar perfil
router.put('/:id', async (req, res) => {
  const { bio, foto_url } = req.body;
  const { data, error } = await supabase.from('users').update({ bio, foto_url }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;