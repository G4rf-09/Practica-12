// =========================================================
// Configuración compartida por todas las páginas
// =========================================================

// Direcciones de la API en MockAPI.io
const API_BASE = "https://6b00d4e61c637a569e528f49.mockapi.io/api/v1";
const API_PRODUCTOS = API_BASE + "/productos";
const API_CATEGORIAS = API_BASE + "/categorias";

// Imagen que se muestra si la URL de un producto no carga
const IMAGEN_RESPALDO = "img/sin-imagen.svg";

// Convierte un número a texto con formato de precio. Ej: 4200 -> "Bs. 4200.00"
function formatoPrecio(numero) {
  return "Bs. " + Number(numero).toFixed(2);
}
