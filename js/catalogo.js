// =========================================================
// Catálogo de productos
// =========================================================

// Lista de productos que llega de la API
let productos = [];

// Categoría elegida en los filtros ("Todos" muestra todo)
let categoriaActual = "Todos";

// Elementos de la página
const contenedor = document.getElementById("listaProductos");
const mensaje = document.getElementById("mensaje");
const buscador = document.getElementById("buscador");
const aviso = document.getElementById("aviso");


// =========================================================
// Cargar categorías y armar los botones de filtro
// =========================================================
async function cargarFiltros() {
  const filtros = document.getElementById("filtros");

  // Si se llegó desde el inicio con ?categoria=..., se usa esa categoría
  const parametros = new URLSearchParams(window.location.search);
  if (parametros.get("categoria")) {
    categoriaActual = parametros.get("categoria");
  }

  try {
    const respuesta = await fetch(API_CATEGORIAS);
    const categorias = await respuesta.json();

    // Primero el botón "Todos" y después uno por cada categoría
    const nombres = ["Todos"];
    categorias.forEach(function (categoria) {
      nombres.push(categoria.nombre);
    });

    filtros.innerHTML = "";
    nombres.forEach(function (nombre) {
      let clase = "btn btn-outline-dark btn-sm";
      if (nombre === categoriaActual) {
        clase = "btn btn-rojo btn-sm";
      }
      filtros.innerHTML += `<button class="${clase}" onclick="elegirCategoria('${nombre}')">${nombre}</button>`;
    });
  } catch (error) {
    filtros.innerHTML = "";
  }
}

// Cambia la categoría elegida y vuelve a dibujar
function elegirCategoria(nombre) {
  categoriaActual = nombre;
  cargarFiltros();
  aplicarFiltros();
}


// =========================================================
// Cargar productos desde MockAPI
// =========================================================
async function cargarProductos() {
  mensaje.textContent = "Cargando productos...";

  try {
    const respuesta = await fetch(API_PRODUCTOS);
    productos = await respuesta.json();
    aplicarFiltros();
  } catch (error) {
    mensaje.textContent = "No se pudieron cargar los productos. Revisa tu conexión.";
  }
}


// Filtra por categoría y por el texto del buscador
function aplicarFiltros() {
  const texto = buscador.value.toLowerCase();

  const filtrados = productos.filter(function (producto) {
    const coincideNombre = producto.nombre.toLowerCase().includes(texto);
    const coincideCategoria = categoriaActual === "Todos" || producto.categoria === categoriaActual;
    return coincideNombre && coincideCategoria;
  });

  mostrarProductos(filtrados);
}

buscador.addEventListener("input", aplicarFiltros);


// =========================================================
// Dibujar las tarjetas
// =========================================================
function mostrarProductos(lista) {
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    mensaje.textContent = "No se encontraron productos.";
    return;
  }
  mensaje.textContent = "";

  lista.forEach(function (producto) {
    const agotado = producto.stock <= 0;

    // Texto del stock según la cantidad
    let textoStock = `<span class="text-success fw-semibold">${producto.stock} disponibles</span>`;
    if (agotado) {
      textoStock = '<span class="badge text-bg-dark">Agotado</span>';
    } else if (producto.stock <= 3) {
      textoStock = `<span class="text-danger fw-semibold">¡Últimas ${producto.stock} unidades!</span>`;
    }

    // Zona de compra: cantidad + botón (o botón desactivado si está agotado)
    let zonaCompra = `
      <div class="input-group input-group-sm">
        <input type="number" id="cantidad-${producto.id}" class="form-control" value="1" min="1" max="${producto.stock}">
        <button class="btn btn-rojo" onclick="comprar('${producto.id}')">
          <i class="bi bi-cart-plus"></i> Comprar
        </button>
      </div>
    `;
    if (agotado) {
      zonaCompra = '<button class="btn btn-secondary btn-sm w-100" disabled>Sin stock</button>';
    }

    // Clase de color para la plataforma (ej: "plataforma-nintendo")
    const clasePlataforma = "plataforma-" + producto.plataforma.toLowerCase();

    let claseTarjeta = "card h-100 shadow-sm tarjeta-producto";
    if (agotado) {
      claseTarjeta += " agotado";
    }

    contenedor.innerHTML += `
      <div class="col">
        <div class="${claseTarjeta}">
          <div class="contenedor-imagen">
            <img src="${producto.imagenUrl}" class="card-img-top" alt="${producto.nombre}"
                 onerror="this.src='${IMAGEN_RESPALDO}'">
            <span class="badge etiqueta-plataforma ${clasePlataforma}">${producto.plataforma}</span>
          </div>
          <div class="card-body d-flex flex-column">
            <small class="text-muted">${producto.categoria}</small>
            <h5 class="card-title fw-bold">${producto.nombre}</h5>
            <p class="descripcion-producto">${producto.descripcion}</p>
            <div class="mt-auto">
              <p class="precio mb-1">${formatoPrecio(producto.precio)}</p>
              <p class="small mb-2"><i class="bi bi-box-seam"></i> ${textoStock}</p>
              ${zonaCompra}
            </div>
          </div>
        </div>
      </div>
    `;
  });
}


// =========================================================
// Comprar: resta la cantidad al stock (PUT)
// =========================================================
async function comprar(id) {
  const cantidad = Number(document.getElementById("cantidad-" + id).value);

  if (cantidad < 1) {
    mostrarAviso("Ingresa una cantidad válida.", "warning");
    return;
  }

  try {
    // Se consulta el producto otra vez para tener el stock más reciente
    const respuesta = await fetch(API_PRODUCTOS + "/" + id);
    const producto = await respuesta.json();

    if (cantidad > producto.stock) {
      mostrarAviso("Solo quedan " + producto.stock + " unidades de " + producto.nombre + ".", "warning");
      cargarProductos();
      return;
    }

    const total = cantidad * producto.precio;
    const confirmar = confirm(
      "¿Comprar " + cantidad + " x " + producto.nombre + " por " + formatoPrecio(total) + "?"
    );
    if (!confirmar) {
      return;
    }

    // Nuevo stock = stock actual - cantidad comprada
    const nuevoStock = producto.stock - cantidad;

    await fetch(API_PRODUCTOS + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: nuevoStock })
    });

    mostrarAviso("¡Compra realizada! " + cantidad + " x " + producto.nombre + " - Total: " + formatoPrecio(total), "success");
    cargarProductos();
  } catch (error) {
    mostrarAviso("No se pudo completar la compra. Intenta de nuevo.", "danger");
  }
}


// Muestra un aviso de color arriba de los productos
function mostrarAviso(texto, tipo) {
  aviso.className = "alert alert-" + tipo;
  aviso.textContent = texto;
  window.scrollTo(0, 0);
}


cargarFiltros();
cargarProductos();
