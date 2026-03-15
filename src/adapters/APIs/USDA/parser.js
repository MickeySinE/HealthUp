export function parsearAlimento(item) {
  const nutrientes = item.foodNutrients || [];
  const buscar = (id) => nutrientes.find(n => n.nutrientId === id)?.value ?? 0;

  return {
    nombre: item.description,
    calorias: buscar(1008),
    proteinas: buscar(1003),
    carbohidratos: buscar(1005),
    grasas: buscar(1004)
  };
}