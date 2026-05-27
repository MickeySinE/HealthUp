require('dotenv').config();
const express = require('express');
const cors    = require('cors');


const authRoutes = require('./routes/auth');
const bdConnection = require('./routes/buscar');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARES ────────────────────────────────
app.use(cors());
app.use(express.json());

// ── RUTAS ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api', bdConnection);

// ── SERVIDOR ───s────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

console.log("USDA:", process.env.USDA_API_KEY);
console.log("NINJA:", process.env.CALORIE_NINJA_KEY);
console.log("SUPABASE:", process.env.SUPABASE_URL);