const express = require('express');
const router  = express.Router();

router.get('/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Falta el parámetro q' });

  const urlUSDA = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${q}&api_key=${process.env.USDA_API_KEY}`;
  const urlOFF  = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${q}&json=true&page_size=8`;

  try {

    // 🥇 USDA
    try {
      const resUSDA = await fetch(urlUSDA);

      if (resUSDA.ok) {
        const text = await resUSDA.text(); // 👈 clave
        const dataUSDA = JSON.parse(text); // 👈 evita crash

        if (dataUSDA.foods && dataUSDA.foods.length > 0) {
          const resultados = dataUSDA.foods.slice(0, 8).map(item => {
            const n = item.foodNutrients || [];
            const buscar = (id) => n.find(x => x.nutrientId === id)?.value ?? 0;

            return {
              nombre: item.description,
              calorias: buscar(1008),
              proteinas: buscar(1003),
              carbohidratos: buscar(1005),
              grasas: buscar(1004),
              fuente: 'USDA'
            };
          });

          return res.json(resultados);
        }
      }

    } catch (e) {
      console.warn("USDA falló:", e.message);
    }

    // 🥈 OpenFoodFacts
    try {
      const resOFF = await fetch(urlOFF);

      if (resOFF.ok) {
        const text = await resOFF.text(); // 👈 igual aquí
        const dataOFF = JSON.parse(text);

        const resultados = (dataOFF.products || []).map(item => {
          const n = item.nutriments || {};
          return {
            nombre: item.product_name || 'Sin nombre',
            calorias: n['energy-kcal_100g'] ?? 0,
            proteinas: n['proteins_100g'] ?? 0,
            carbohidratos: n['carbohydrates_100g'] ?? 0,
            grasas: n['fat_100g'] ?? 0,
            fuente: 'OpenFoodFacts'
          };
        });

        return res.json(resultados);
      }

    } catch (e) {
      console.warn("OFF falló:", e.message);
    }

    // 🧯 si todo falla
    return res.json([]);

  } catch (err) {
    console.error("ERROR REAL:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// ── BUSCADOR ──
const API_BASE = "http://localhost:3000";
const inputBuscador = document.getElementById("buscador");
let searchTimeout = null;

function navigateTo(pageId) {
  document.querySelectorAll(".page").forEach(p => p.hidden = true);
  document.getElementById(pageId).hidden = false;
  // actualiza link activo si tu nav ya lo maneja
}

async function buscarYMostrar(query) {
  navigateTo("page-search");

  const title = document.getElementById("search-title");
  const sub = document.getElementById("search-sub");
  const loading = document.getElementById("search-state-loading");
  const empty = document.getElementById("search-state-empty");
  const grid = document.getElementById("searchResults");

  title.textContent = `"${query}"`;
  sub.textContent = "Información nutricional por cada 100g de porción.";
  loading.hidden = false;
  empty.hidden = true;
  grid.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/api/buscar?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    loading.hidden = true;

    if (!data.length) {
      empty.hidden = false;
      return;
    }

    grid.innerHTML = data.map(a => `
      <div class="nutrition-card">
        <div class="nutrition-card__header">
          <p class="nutrition-card__name">${a.nombre}</p>
          <p class="nutrition-card__portion">Por cada 100g</p>
          <div class="nutrition-card__calories">
            <span class="nutrition-card__calories-num">${a.calorias ?? "—"}</span>
            <span class="nutrition-card__calories-label">kcal</span>
          </div>
        </div>
        <div class="nutrition-card__macros">
          <div class="nutrition-card__macro">
            <span class="nutrition-card__macro-val">${a.proteinas ?? "—"}g</span>
            <span class="nutrition-card__macro-label">Proteína</span>
          </div>
          <div class="nutrition-card__macro">
            <span class="nutrition-card__macro-val">${a.carbohidratos ?? "—"}g</span>
            <span class="nutrition-card__macro-label">Carbos</span>
          </div>
          <div class="nutrition-card__macro">
            <span class="nutrition-card__macro-val">${a.grasas ?? "—"}g</span>
            <span class="nutrition-card__macro-label">Grasas</span>
          </div>
        </div>
      </div>
    `).join("");

  } catch (e) {
    loading.hidden = true;
    empty.hidden = false;
    sub.textContent = "Error al conectar con el servidor. ¿Está corriendo npm run dev?";
  }
}

// Buscar al presionar Enter
inputBuscador.addEventListener("keydown", e => {
  if (e.key === "Enter" && inputBuscador.value.trim().length >= 2) {
    buscarYMostrar(inputBuscador.value.trim());
  }
});

// Buscar al escribir (debounce 500ms)
inputBuscador.addEventListener("input", () => {
  clearTimeout(searchTimeout);
  const q = inputBuscador.value.trim();
  if (q.length >= 3) {
    searchTimeout = setTimeout(() => buscarYMostrar(q), 500);
  }
});