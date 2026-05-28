const express  = require('express');
const { createClient } = require('@supabase/supabase-js');
const router   = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET posts
router.get('/posts', async (req, res) => {
  const { q, categoria, user_id } = req.query;

  let query = supabase
    .from('posts')
    .select('*, users(username, foto_url)')
    .order('created_at', { ascending: false });

  if (q) query = query.ilike('titulo', `%${q}%`);
  if (categoria) query = query.eq('categoria', categoria);

  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });

  const postsConLikes = await Promise.all((data || []).map(async (post) => {
    const { count } = await supabase
      .from('likes_posts')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id);

    let liked = false;

    if (user_id) {
      const { data: likedRow } = await supabase
        .from('likes_posts')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user_id)
        .maybeSingle();

      liked = !!likedRow;
    }

    return {
      ...post,
      likes_count: count || 0,
      liked
    };
  }));

  res.json(postsConLikes);
});

// POST crear post
router.post('/posts', async (req, res) => {
  const { user_id, titulo, contenido, categoria, imagen_url } = req.body;
  if (!user_id || !titulo || !contenido) return res.status(400).json({ error: 'Faltan campos' });
  const { data, error } = await supabase
    .from('posts')
    .insert([{ user_id, titulo, contenido, categoria, imagen_url }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// GET comentarios de un post
router.get('/posts/:id/comentarios', async (req, res) => {
  const { data, error } = await supabase
    .from('comentarios')
    .select('*, users(username, foto_url)')
    .eq('post_id', req.params.id)
    .order('created_at', { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST comentario
router.post('/posts/:id/comentarios', async (req, res) => {
  const { user_id, contenido } = req.body;
  if (!user_id || !contenido) return res.status(400).json({ error: 'Faltan campos' });
  const { data, error } = await supabase
    .from('comentarios')
    .insert([{ post_id: req.params.id, user_id, contenido }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST like toggle
router.post('/posts/:id/like', async (req, res) => {
  const { user_id } = req.body;
  const post_id = req.params.id;

  if (!user_id) return res.status(400).json({ error: 'user_id requerido' });

  const { data: existing } = await supabase
    .from('likes_posts')
    .select('id')
    .eq('user_id', user_id)
    .eq('post_id', post_id)
    .maybeSingle();

  if (existing) {
    await supabase.from('likes_posts').delete()
      .eq('user_id', user_id).eq('post_id', post_id);
  } else {
    const { error } = await supabase.from('likes_posts')
      .insert([{ user_id, post_id }]);
    if (error) return res.status(500).json({ error: error.message });
  }

  const { count } = await supabase
    .from('likes_posts')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post_id);

  return res.json({ liked: !existing, count: count || 0 });
});

// GET likes de un post
router.get('/posts/:id/likes', async (req, res) => {
  const { user_id } = req.query;
  const post_id = req.params.id;

  const { count } = await supabase
    .from('likes_posts')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post_id);

  let liked = false;
  if (user_id) {
    const { data } = await supabase.from('likes_posts')
      .select('id').eq('user_id', user_id).eq('post_id', post_id).maybeSingle();
    liked = !!data;
  }
  res.json({ count: count || 0, liked });
});

// DELETE post
router.delete('/posts/:id', async (req, res) => {
  const { user_id } = req.body;
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', req.params.id).single();
  if (!post || String(post.user_id) !== String(user_id)) return res.status(403).json({ error: 'No autorizado' });
  await supabase.from('comentarios').delete().eq('post_id', req.params.id);
  await supabase.from('likes_posts').delete().eq('post_id', req.params.id);
  const { error } = await supabase.from('posts').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

module.exports = router;