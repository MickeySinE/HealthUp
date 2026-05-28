const express  = require('express');
const { createClient } = require('@supabase/supabase-js');
const router   = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/:id', async (req, res) => {
  const uid = req.params.id;

  // Datos del usuario
  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, bio, foto_url')
    .eq('id', uid)
    .single();

  if (error) return res.status(404).json({ error: 'Usuario no encontrado' });

  // Posts propios
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  // Posts del foro que le gustaron (con datos del post)
  const { data: likesPostsRows } = await supabase
    .from('likes_posts')
    .select('post_id, posts(id, titulo, contenido, categoria, created_at)')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  // Recetas que le gustaron
  const { data: likesRecetasRows } = await supabase
    .from('likes_recetas')
    .select('receta_id, recetas(id, titulo, imagen_url, categoria)')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  res.json({
    ...user,
    posts:         posts         || [],
    likes_posts:   (likesPostsRows   || []).map(r => r.posts),
    likes_recetas: (likesRecetasRows || []).map(r => r.recetas),
  });
});

// PUT actualizar perfil
router.put('/:id', async (req, res) => {
  const { bio, foto_url } = req.body;
  const { data, error } = await supabase.from('users').update({ bio, foto_url }).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

module.exports = router;