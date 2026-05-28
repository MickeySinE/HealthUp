const express  = require('express');
const { createClient } = require('@supabase/supabase-js');
const router   = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET posts
router.get('/posts', async (req, res) => {
  const { q, categoria } = req.query;
  let query = supabase.from('posts').select('*, users(username, foto_url)').order('created_at', { ascending: false });
  if (q) query = query.ilike('titulo', `%${q}%`);
  if (categoria) query = query.eq('categoria', categoria);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST crear post
router.post('/posts', async (req, res) => {
  const { user_id, titulo, contenido, categoria } = req.body;
  if (!user_id || !titulo || !contenido) return res.status(400).json({ error: 'Faltan campos' });
  const { data, error } = await supabase.from('posts').insert([{ user_id, titulo, contenido, categoria }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// GET comentarios de un post
router.get('/posts/:id/comentarios', async (req, res) => {
  const { data, error } = await supabase.from('comentarios').select('*, users(username, foto_url)').eq('post_id', req.params.id).order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST comentario
router.post('/posts/:id/comentarios', async (req, res) => {
  const { user_id, contenido } = req.body;
  if (!user_id || !contenido) return res.status(400).json({ error: 'Faltan campos' });
  const { data, error } = await supabase.from('comentarios').insert([{ post_id: req.params.id, user_id, contenido }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST like
router.post('/posts/:id/like', async (req, res) => {
  const { data: post } = await supabase.from('posts').select('likes').eq('id', req.params.id).single();
  const { data, error } = await supabase.from('posts').update({ likes: (post?.likes || 0) + 1 }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;