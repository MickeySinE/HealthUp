const express = require('express');
const router  = express.Router();

// ── CACHÉ EN MEMORIA ───────────────────────────
// Guarda resultados por 5 minutos para no re-llamar las APIs
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// ── FETCH CON TIMEOUT ──────────────────────────
// Evita que una API colgada trabe todo
function fetchConTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeout));
}

// ── RUTA BUSCADOR ──────────────────────────────
router.get('/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Falta el parámetro q' });

  const key = q.toLowerCase().trim();

  // Revisar caché primero
  const cached = getCached(key);
  if (cached) {
    console.log(`Cache hit: "${key}"`);
    return res.json(cached);
  }

  const urlUSDA = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(q)}&api_key=${process.env.USDA_API_KEY}`;
  const urlOFF  = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&json=true&page_size=8`;

  // Consultar ambas APIs en paralelo con timeout
  const [resultadosUSDA, resultadosOFF] = await Promise.all([

    // USDA
    fetchConTimeout(urlUSDA)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.foods?.length) return [];
        return data.foods.slice(0, 5).map(item => {
          const n = item.foodNutrients || [];
          const get = (id) => n.find(x => x.nutrientId === id)?.value ?? 0;
          return {
            nombre:        item.description,
            calorias:      get(1008),
            proteinas:     get(1003),
            carbohidratos: get(1005),
            grasas:        get(1004),
            fuente:        'USDA'
          };
        });
      })
      .catch(e => { console.warn('USDA falló:', e.message); return []; }),

    // OpenFoodFacts
    fetchConTimeout(urlOFF, 8000)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.products?.length) return [];
        return data.products
          .filter(p => p.product_name)
          .slice(0, 5)
          .map(item => {
            const n = item.nutriments || {};
            return {
              nombre:        item.product_name,
              calorias:      n['energy-kcal_100g'] ?? 0,
              proteinas:     n['proteins_100g']    ?? 0,
              carbohidratos: n['carbohydrates_100g'] ?? 0,
              grasas:        n['fat_100g']          ?? 0,
              fuente:        'OpenFoodFacts'
            };
          });
      })
      .catch(e => { console.warn('OpenFoodFacts falló:', e.message); return []; })

  ]);

  // Combinar y eliminar duplicados por nombre
  const todos = [...resultadosUSDA, ...resultadosOFF];
  const vistos = new Set();
  const resultados = todos.filter(item => {
    const key = item.nombre.toLowerCase().trim();
    if (vistos.has(key)) return false;
    vistos.add(key);
    return true;
  });

  // Guardar en caché aunque esté vacío para no re-llamar las APIs
  setCached(key, resultados);

  return res.json(resultados);
});

module.exports = router;