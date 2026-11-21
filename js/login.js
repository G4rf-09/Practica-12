const CORREO_ADMIN = "admin@gmail.com";
const CONTRASENA_ADMIN = "admin123";

if (sessionStorage.getItem("sesionAdmin") === "activa") {
  window.location.href = "admin.html";
}

document.getElementById("formLogin").addEventListener("submit", function (evento) {
  evento.preventDefault();

  const correo = document.getElementById("correo").value.trim();
  const contrasena = document.getElementById("contrasena").value;

  if (correo === CORREO_ADMIN && contrasena === CONTRASENA_ADMIN) {
    sessionStorage.setItem("sesionAdmin", "activa");
    window.location.href = "admin.html";
  } else {
    document.getElementById("error").classList.remove("d-none");
  }
});
