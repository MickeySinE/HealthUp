require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const multer   = require('multer');
const { createClient } = require('@supabase/supabase-js');

const authRoutes    = require('./routes/auth');
const recetasRoutes = require('./routes/recetas');
const foroRoutes    = require('./routes/foro');
const perfilRoutes  = require('./routes/perfil');

const app      = express();
const PORT     = process.env.PORT || 3000;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const upload   = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../web')));

// ── UPLOAD ──────────────────────────────────────
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' });
  const ext      = req.file.originalname.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bucket   = req.body.bucket || 'avatars';
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, req.file.buffer, { contentType: req.file.mimetype });
  if (error) return res.status(500).json({ error: error.message });
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  res.json({ url: data.publicUrl });
});

app.use('/api/auth',    authRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/foro',    foroRoutes);
app.use('/api/perfil',  perfilRoutes);

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`))
  .on('error', (err) => console.error('Error al iniciar servidor:', err));

app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' });
  const ext      = req.file.originalname.split('.').pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const bucket   = req.body.bucket || 'avatars';
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, req.file.buffer, { contentType: req.file.mimetype });
  if (error) {
    console.error('Storage error:', error); // ← agrega esto
    return res.status(500).json({ error: error.message });
  }
  const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
  res.json({ url: data.publicUrl });
});
process.on('uncaughtException', (err) => console.error('UNCAUGHT:', err));