const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.get('/:id', async (req, res) => {
  const uid = req.params.id;

  const { data: user, error } = await supabase
    .from('users')
    .select('id, username, email, bio, foto_url')
    .eq('id', uid)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, titulo, contenido, categoria, created_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: false });

  if (postsError) {
    console.error('postsError:', postsError);
  }

  const { data: likesPostsRows, error: likesPostsError } = await supabase
    .from('likes_posts')
    .select('post_id')
    .eq('user_id', uid);

  if (likesPostsError) {
    console.error('likesPostsError:', likesPostsError);
  }

  const postIds = (likesPostsRows || []).map(r => r.post_id);

  let orderedLikedPosts = [];
  if (postIds.length > 0) {
    const { data: likedPosts, error: likedPostsError } = await supabase
      .from('posts')
      .select('id, titulo, contenido, categoria, created_at')
      .in('id', postIds);

    if (likedPostsError) {
      console.error('likedPostsError:', likedPostsError);
    }

    orderedLikedPosts = postIds
      .map(id => (likedPosts || []).find(p => String(p.id) === String(id)))
      .filter(Boolean);
  }

  const { data: likesRecetasRows, error: likesRecetasError } = await supabase
    .from('likes_recetas')
    .select('receta_id')
    .eq('user_id', uid);

  if (likesRecetasError) {
    console.error('likesRecetasError:', likesRecetasError);
  }

  res.json({
    ...user,
    posts: posts || [],
    likes_posts: orderedLikedPosts,
    likes_recetas: (likesRecetasRows || []).map(r => r.receta_id).filter(Boolean),
  });
});

router.put('/:id', async (req, res) => {
  const { bio, foto_url } = req.body;

  const { data, error } = await supabase
    .from('users')
    .update({ bio, foto_url })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
});

module.exports = router;