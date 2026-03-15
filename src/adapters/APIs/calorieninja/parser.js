export function parsearAlimento(item) {
  return {
    nombre: item.name,
    calorias: item.calories,
    proteinas: item.protein_g,
    carbohidratos: item.carbohydrates_total_g,
    grasas: item.fat_total_g
  };
}