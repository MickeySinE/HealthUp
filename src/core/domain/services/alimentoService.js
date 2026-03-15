import { buscarAlimento as buscarUSDA } from "../../../adapters/APIs/USDA/index.js";
import { buscarAlimento as buscarNinjas } from "../../../adapters/APIs/calorieninja/index.js";
import { buscarAlimento as buscarOFF } from "../../../adapters/APIs/openfoodfacts/index.js";

export async function buscarAlimento(nombre) {
  try {
    const resultados = await buscarUSDA(nombre);
    if (resultados.length > 0) {
      console.log("Fuente: USDA");
      return resultados;
    }
  } catch (e) {
    console.warn("USDA falló, intentando CalorieNinjas...");
  }

  try {
    const resultados = await buscarNinjas(nombre);
    if (resultados.length > 0) {
      console.log("Fuente: CalorieNinjas");
      return resultados;
    }
  } catch (e) {
    console.warn("CalorieNinjas falló, intentando OpenFoodFacts...");
  }

  try {
    const resultados = await buscarOFF(nombre);
    console.log("Fuente: OpenFoodFacts");
    return resultados;
  } catch (e) {
    console.error("Todas las APIs fallaron");
    return [];
  }
}

export async function calcularCalorias(alimentos) {
  let totalCalorias = 0;
  let detalle = [];

  for (const item of alimentos) {
    const resultados = await buscarAlimento(item.nombre);
    if (resultados.length > 0) {
      const alimento = resultados[0];
      const factor = item.cantidad / 100;
      const calorias = alimento.calorias * factor;
      totalCalorias += calorias;
      detalle.push({
        nombre: alimento.nombre,
        cantidad: item.cantidad,
        calorias: Math.round(calorias)
      });
    }
  }

  return { totalCalorias: Math.round(totalCalorias), detalle };
}