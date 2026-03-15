import { BASE_URL, ENDPOINTS } from "./constants.js";
import { parsearAlimento } from "./parser.js";

export async function buscarAlimento(nombre) {
  const url = `${BASE_URL}${ENDPOINTS.buscar}?search_terms=${nombre}&json=true&page_size=5`;
  const res = await fetch(url);
  const data = await res.json();
  return data.products.map(parsearAlimento);
}

export async function buscarPorCodigo(codigo) {
  const url = `${BASE_URL}${ENDPOINTS.porCodigo}/${codigo}.json`;
  const res = await fetch(url);
  const data = await res.json();
  return parsearAlimento(data.product);
}