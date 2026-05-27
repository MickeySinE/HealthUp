import express from "express";
import cors from "cors";
import { buscarAlimento } from "../../core/domain/services/alimentoService.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/buscar", async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.status(400).json({ error: "Búsqueda muy corta" });
  }
  try {
    const resultados = await buscarAlimento(q.trim());
    res.json(resultados.slice(0, 12)); // máximo 12 resultados
  } catch (e) {
    res.status(500).json({ error: "Error al buscar" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`HealthUP API corriendo en http://localhost:${PORT}`));