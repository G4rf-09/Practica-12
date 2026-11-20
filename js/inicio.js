// =========================================================
// Página de inicio
// =========================================================

// Muestra las categorías guardadas en MockAPI
async function cargarCategorias() {
  const contenedor = document.getElementById("listaCategorias");

  try {
    const respuesta = await fetch(API_CATEGORIAS);
    const categorias = await respuesta.json();

    contenedor.innerHTML = "";

    categorias.forEach(function (categoria) {
      contenedor.innerHTML += `
        <div class="col-sm-6 col-lg-3">
          <a href="catalogo.html?categoria=${encodeURIComponent(categoria.nombre)}" class="text-decoration-none text-dark">
            <div class="card tarjeta-info h-100 shadow-sm">
              <div class="card-body p-4">
                <i class="bi ${categoria.icono} icono-grande"></i>
                <h3 class="h5 mt-2">${categoria.nombre}</h3>
                <p class="small text-muted mb-0">${categoria.descripcion}</p>
              </div>
            </div>
          </a>
        </div>
      `;
    });
  } catch (error) {
    contenedor.innerHTML = '<p class="text-muted">No se pudieron cargar las categorías.</p>';
  }
}


// Formulario de contacto: solo muestra un mensaje de confirmación
document.getElementById("formContacto").addEventListener("submit", function (evento) {
  evento.preventDefault();
  document.getElementById("avisoContacto").classList.remove("d-none");
  this.reset();
});


cargarCategorias();
