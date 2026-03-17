const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARES ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── RUTAS ──────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── SERVIDOR ───────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});