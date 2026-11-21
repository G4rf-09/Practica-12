let productos = [];

let categorias = [];

let plataformaActual = "Todas";
let categoriaActual = "Todas";

const PLATAFORMAS = ["Todas", "Nintendo", "PlayStation", "Xbox"];

const contenedor = document.getElementById("listaProductos");
const mensaje = document.getElementById("mensaje");
const buscador = document.getElementById("buscador");
const aviso = document.getElementById("aviso");

const parametros = new URLSearchParams(window.location.search);
if (parametros.get("plataforma")) {
  plataformaActual = parametros.get("plataforma");
}
if (parametros.get("categoria")) {
  categoriaActual = parametros.get("categoria");
}

function dibujarBotones(idContenedor, opciones, elegida, funcion) {
  const caja = document.getElementById(idContenedor);
  caja.innerHTML = "";

  opciones.forEach(function (opcion) {
    let clase = "btn btn-outline-dark btn-sm";
    if (opcion === elegida) {
      clase = "btn btn-rojo btn-sm";
    }
    caja.innerHTML += `<button class="${clase}" onclick="${funcion}('${opcion}')">${opcion}</button>`;
  });
}

function dibujarFiltros() {
  dibujarBotones("filtrosPlataforma", PLATAFORMAS, plataformaActual, "elegirPlataforma");
  dibujarBotones("filtrosCategoria", ["Todas"].concat(categorias), categoriaActual, "elegirCategoria");
}

function elegirPlataforma(nombre) {
  plataformaActual = nombre;
  dibujarFiltros();
  aplicarFiltros();
}

function elegirCategoria(nombre) {
  categoriaActual = nombre;
  dibujarFiltros();
  aplicarFiltros();
}

async function cargarCategorias() {
  try {
    const respuesta = await fetch(API_CATEGORIAS);
    const datos = await respuesta.json();

    categorias = [];
    datos.forEach(function (categoria) {
      categorias.push(categoria.nombre);
    });
  } catch (error) {
    categorias = [];
  }
  dibujarFiltros();
}

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

function aplicarFiltros() {
  const texto = buscador.value.toLowerCase();

  const filtrados = productos.filter(function (producto) {
    const coincideNombre = producto.nombre.toLowerCase().includes(texto);
    const coincidePlataforma = plataformaActual === "Todas" || producto.plataforma === plataformaActual;
    const coincideCategoria = categoriaActual === "Todas" || producto.categoria === categoriaActual;
    return coincideNombre && coincidePlataforma && coincideCategoria;
  });

  mostrarProductos(filtrados);
}

buscador.addEventListener("input", aplicarFiltros);

function mostrarProductos(lista) {
  contenedor.innerHTML = "";

  if (lista.length === 0) {
    mensaje.textContent = "No se encontraron productos.";
    return;
  }
  mensaje.textContent = lista.length + " productos encontrados";

  lista.forEach(function (producto) {
    const agotado = producto.stock <= 0;

    let textoStock = `<span class="badge rounded-pill text-bg-success">${producto.stock} disponibles</span>`;
    if (agotado) {
      textoStock = '<span class="badge rounded-pill text-bg-dark">Agotado</span>';
    } else if (producto.stock === 1) {
      textoStock = '<span class="badge rounded-pill text-bg-danger">¡Última unidad!</span>';
    } else if (producto.stock <= 3) {
      textoStock = `<span class="badge rounded-pill text-bg-warning">Quedan ${producto.stock}</span>`;
    }

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

    const plataforma = producto.plataforma.toLowerCase();

    let claseTarjeta = "card h-100 shadow-sm tarjeta-producto";
    if (agotado) {
      claseTarjeta += " agotado";
    }

    contenedor.innerHTML += `
      <div class="col">
        <div class="${claseTarjeta}">
          <div class="contenedor-imagen zona-${plataforma}">
            <img src="${producto.imagenUrl}" alt="${producto.nombre}"
                 onerror="this.src='${IMAGEN_RESPALDO}'">
            <span class="badge etiqueta-plataforma plataforma-${plataforma}">${producto.plataforma}</span>
          </div>
          <div class="card-body d-flex flex-column">
            <small class="text-muted">${producto.categoria}</small>
            <h5 class="card-title fw-bold">${producto.nombre}</h5>
            <p class="descripcion-producto">${producto.descripcion}</p>
            <div class="mt-auto">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="precio">${formatoPrecio(producto.precio)}</span>
                ${textoStock}
              </div>
              ${zonaCompra}
            </div>
          </div>
        </div>
      </div>
    `;
  });
}

async function comprar(id) {
  const cantidad = Number(document.getElementById("cantidad-" + id).value);

  if (cantidad < 1) {
    mostrarAviso("Ingresa una cantidad válida.", "warning");
    return;
  }

  try {
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

function mostrarAviso(texto, tipo) {
  aviso.className = "alert alert-" + tipo;
  aviso.textContent = texto;
  aviso.scrollIntoView({ behavior: "smooth" });
}

cargarCategorias();
cargarProductos();
