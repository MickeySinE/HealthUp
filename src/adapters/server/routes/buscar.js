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