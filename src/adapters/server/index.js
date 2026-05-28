require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const path     = require('path');

const authRoutes   = require('./routes/auth');
const recetasRoutes = require('./routes/recetas');
const foroRoutes   = require('./routes/foro');
const perfilRoutes = require('./routes/perfil');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../web')));

app.use('/api/auth',    authRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/foro',    foroRoutes);
app.use('/api/perfil',  perfilRoutes);

app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));