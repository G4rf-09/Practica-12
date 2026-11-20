// =========================================================
// Panel de administración (CRUD de productos)
// =========================================================

// Productos que llegan de la API
let productos = [];

// Elementos de la página
const tabla = document.getElementById("tablaProductos");
const buscador = document.getElementById("buscador");
const formulario = document.getElementById("formProducto");
const modal = new bootstrap.Modal(document.getElementById("modalProducto"));


// Cierra la sesión y vuelve al login
function cerrarSesion() {
  sessionStorage.removeItem("sesionAdmin");
  window.location.href = "login.html";
}


// =========================================================
// Cargar las categorías en el select del formulario
// =========================================================
async function cargarCategorias() {
  const select = document.getElementById("categoria");

  try {
    const respuesta = await fetch(API_CATEGORIAS);
    const categorias = await respuesta.json();

    select.innerHTML = '<option value="">Seleccione...</option>';
    categorias.forEach(function (categoria) {
      select.innerHTML += `<option>${categoria.nombre}</option>`;
    });
  } catch (error) {
    select.innerHTML = '<option value="">No se pudieron cargar</option>';
  }
}


// =========================================================
// LEER: listar productos (GET)
// =========================================================
async function listarProductos() {
  try {
    const respuesta = await fetch(API_PRODUCTOS);
    productos = await respuesta.json();
    mostrarResumen();
    filtrarTabla();
  } catch (error) {
    tabla.innerHTML = '<tr><td colspan="7" class="text-center text-danger">No se pudieron cargar los productos.</td></tr>';
  }
}


// Calcula los números del resumen
function mostrarResumen() {
  let unidades = 0;
  let agotados = 0;

  productos.forEach(function (producto) {
    unidades += Number(producto.stock);
    if (producto.stock <= 0) {
      agotados++;
    }
  });

  document.getElementById("totalProductos").textContent = productos.length;
  document.getElementById("totalStock").textContent = unidades;
  document.getElementById("totalAgotados").textContent = agotados;
}


// Filtra la tabla con el texto del buscador
function filtrarTabla() {
  const texto = buscador.value.toLowerCase();

  const filtrados = productos.filter(function (producto) {
    return producto.nombre.toLowerCase().includes(texto);
  });

  mostrarTabla(filtrados);
}

buscador.addEventListener("input", filtrarTabla);


// Dibuja las filas de la tabla
function mostrarTabla(lista) {
  tabla.innerHTML = "";

  if (lista.length === 0) {
    tabla.innerHTML = '<tr><td colspan="7" class="text-center text-muted">No hay productos.</td></tr>';
    return;
  }

  lista.forEach(function (producto) {
    // Color del stock: rojo si está agotado, amarillo si quedan pocos
    let claseStock = "text-bg-success";
    if (producto.stock <= 0) {
      claseStock = "text-bg-danger";
    } else if (producto.stock <= 3) {
      claseStock = "text-bg-warning";
    }

    tabla.innerHTML += `
      <tr>
        <td><img src="${producto.imagenUrl}" alt="${producto.nombre}" onerror="this.src='${IMAGEN_RESPALDO}'"></td>
        <td class="fw-semibold">${producto.nombre}</td>
        <td>${producto.categoria}</td>
        <td>${producto.plataforma}</td>
        <td>${formatoPrecio(producto.precio)}</td>
        <td><span class="badge ${claseStock}">${producto.stock}</span></td>
        <td class="text-end text-nowrap">
          <button class="btn btn-outline-primary btn-sm" onclick="abrirModalEditar('${producto.id}')">
            <i class="bi bi-pencil"></i> Editar
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="eliminarProducto('${producto.id}')">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </td>
      </tr>
    `;
  });
}


// =========================================================
// Abrir el modal para crear o editar
// =========================================================
function abrirModalNuevo() {
  formulario.reset();
  document.getElementById("id").value = "";
  document.getElementById("tituloModal").textContent = "Nuevo producto";
  modal.show();
}

function abrirModalEditar(id) {
  const producto = productos.find(function (p) {
    return p.id === id;
  });

  document.getElementById("id").value = producto.id;
  document.getElementById("nombre").value = producto.nombre;
  document.getElementById("categoria").value = producto.categoria;
  document.getElementById("plataforma").value = producto.plataforma;
  document.getElementById("descripcion").value = producto.descripcion;
  document.getElementById("precio").value = producto.precio;
  document.getElementById("stock").value = producto.stock;
  document.getElementById("imagenUrl").value = producto.imagenUrl;

  document.getElementById("tituloModal").textContent = "Editar producto";
  modal.show();
}


// Lee los datos del formulario
function obtenerDatosFormulario() {
  return {
    nombre: document.getElementById("nombre").value,
    categoria: document.getElementById("categoria").value,
    plataforma: document.getElementById("plataforma").value,
    descripcion: document.getElementById("descripcion").value,
    precio: Number(document.getElementById("precio").value),
    stock: Number(document.getElementById("stock").value),
    imagenUrl: document.getElementById("imagenUrl").value
  };
}


// Al guardar: si no hay id es nuevo, si hay id se edita
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const id = document.getElementById("id").value;
  const datos = obtenerDatosFormulario();

  if (id === "") {
    crearProducto(datos);
  } else {
    editarProducto(id, datos);
  }
});


// =========================================================
// CREAR producto (POST)
// =========================================================
async function crearProducto(datos) {
  try {
    await fetch(API_PRODUCTOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    modal.hide();
    listarProductos();
  } catch (error) {
    alert("No se pudo crear el producto.");
  }
}


// =========================================================
// EDITAR producto (PUT)
// =========================================================
async function editarProducto(id, datos) {
  try {
    await fetch(API_PRODUCTOS + "/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    modal.hide();
    listarProductos();
  } catch (error) {
    alert("No se pudo editar el producto.");
  }
}


// =========================================================
// ELIMINAR producto (DELETE)
// =========================================================
async function eliminarProducto(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar este producto?");
  if (!confirmar) {
    return;
  }

  try {
    await fetch(API_PRODUCTOS + "/" + id, { method: "DELETE" });
    listarProductos();
  } catch (error) {
    alert("No se pudo eliminar el producto.");
  }
}


cargarCategorias();
listarProductos();
