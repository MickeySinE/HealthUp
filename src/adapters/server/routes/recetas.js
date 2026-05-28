const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router  = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// GET todas las recetas
router.get('/', async (req, res) => {
  const { categoria, q } = req.query;
  let query = supabase.from('recetas').select('*').order('created_at', { ascending: false });
  if (categoria) query = query.eq('categoria', categoria);
  if (q) query = query.ilike('titulo', `%${q}%`);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// GET una receta
router.get('/:id', async (req, res) => {
  const { data, error } = await supabase.from('recetas').select('*').eq('id', req.params.id).single();
  if (error) return res.status(404).json({ error: 'Receta no encontrada' });
  res.json(data);
});

// POST crear receta (admin)
router.post('/', async (req, res) => {
  const { titulo, descripcion, ingredientes, pasos, imagen_url, categoria, tiempo_min, calorias } = req.body;
  const { data, error } = await supabase.from('recetas').insert([{ titulo, descripcion, ingredientes, pasos, imagen_url, categoria, tiempo_min, calorias }]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// POST /api/recetas/:id/like  →  toggle like
router.post('/:id/like', async (req, res) => {
  const { user_id } = req.body;
  const receta_id = req.params.id;

  if (!user_id) return res.status(400).json({ error: 'user_id requerido' });

  const { data: existing } = await supabase
    .from('likes_recetas')
    .select('id')
    .eq('user_id', user_id)
    .eq('receta_id', receta_id)
    .single();

  if (existing) {
    await supabase.from('likes_recetas').delete()
      .eq('user_id', user_id).eq('receta_id', receta_id);
    return res.json({ liked: false });
  } else {
    const { error } = await supabase.from('likes_recetas')
      .insert([{ user_id, receta_id }]);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ liked: true });
  }
});

module.exports = router;