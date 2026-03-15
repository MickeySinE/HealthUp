export function parsearAlimento(item) {
  const n = item.nutriments || {};
  return {
    nombre: item.product_name || "Sin nombre",
    calorias: n["energy-kcal_100g"] ?? 0,
    proteinas: n["proteins_100g"] ?? 0,
    carbohidratos: n["carbohydrates_100g"] ?? 0,
    grasas: n["fat_100g"] ?? 0
  };
}