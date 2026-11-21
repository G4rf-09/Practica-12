const API_BASE = "https://6b00d4e61c637a569e528f49.mockapi.io/api/v1";
const API_PRODUCTOS = API_BASE + "/productos";
const API_CATEGORIAS = API_BASE + "/categorias";

const IMAGEN_RESPALDO = "img/sin-imagen.svg";

function formatoPrecio(numero) {
  return "Bs. " + Number(numero).toFixed(2);
}
