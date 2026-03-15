import { BASE_URL, API_KEY, ENDPOINTS } from "./constants.js";
import { parsearAlimento } from "./parser.js";

export async function buscarAlimento(nombre) {
  const url = `${BASE_URL}${ENDPOINTS.buscar}?query=${nombre}`;
  const res = await fetch(url, {
    headers: { "X-Api-Key": API_KEY }
  });
  const data = await res.json();
  return data.items.map(parsearAlimento);
}