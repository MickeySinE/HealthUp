import { BASE_URL, API_KEY, ENDPOINTS } from "./constants.js";
import { parsearAlimento } from "./parser.js";

export async function buscarAlimento(nombre) {
  const url = `${BASE_URL}${ENDPOINTS.buscar}?query=${nombre}&api_key=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.foods.map(parsearAlimento);
}