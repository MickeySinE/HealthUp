import { buscarAlimento as buscarUSDA } from "../src/adapters/APIs/USDA/index.js";
import { buscarAlimento as buscarNinjas } from "../src/adapters/APIs/calorieninja/index.js";
import { buscarAlimento as buscarOFF } from "../src/adapters/APIs/openfoodfacts/index.js";
import { buscarAlimento, calcularCalorias } from "../src/core/domain/services/alimentoService.js";

async function probar() {
  console.log("=== Probando USDA ===");
  try {
    const usda = await buscarUSDA("manzana");
    console.log("USDA OK:", usda[0]);
  } catch (e) {
    console.error("USDA ERROR:", e.message);
  }

  console.log("\n=== Probando CalorieNinjas ===");
  try {
    const ninjas = await buscarNinjas("apple");
    console.log("CalorieNinjas OK:", ninjas[0]);
  } catch (e) {
    console.error("CalorieNinjas ERROR:", e.message);
  }

  console.log("\n=== Probando OpenFoodFacts ===");
  try {
    const off = await buscarOFF("leche");
    console.log("OpenFoodFacts OK:", off[0]);
  } catch (e) {
    console.error("OpenFoodFacts ERROR:", e.message);
  }

console.log("\n=== Probando alimentoService ===");
try {
  const resultados = await buscarAlimento("manzana");
  console.log("Primer resultado:", resultados[0]);

  const calorias = await calcularCalorias([
    { nombre: "manzana", cantidad: 150 },
    { nombre: "pollo", cantidad: 200 }
  ]);
  console.log("Cálculo de calorías:", calorias);
} catch (e) {
  console.error("Error en service:", e.message);
}



}

probar();