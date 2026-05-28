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

module.exports = router;