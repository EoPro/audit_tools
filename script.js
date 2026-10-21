// Categorías y herramientas que se muestran en los paneles de navegación.
const T = [
  {
    id: "plan", i: "🏛️", n: "Sistemas gob", d: "Sistemas oficiales del Estado dominicano para consultar información financiera, presupuestaria, de compras y de personal.", tip: "Cita siempre el sistema, el módulo y la fecha de consulta como evidencia de auditoría.", t: [
      ["SIGEF", "Sistema Integrado de Gestión Financiera: ejecución presupuestaria, ingresos y gastos del Estado.", ["Presupuesto", "Ejecución", "Libramientos"], "https://sigef.hacienda.gob.do", "logos/sigef.png"],
      ["SECP", "Sistema Electrónico de Contrataciones Públicas: procesos de compras y contrataciones del Estado.", ["Compras", "Licitaciones", "Contratos"], "https://secp.gob.do", "logos/secp.ico"],
      ["SASP", "Sistema de Administración de Servidores Públicos: gestión de nómina y datos del personal del Estado.", ["Nómina", "Personal", "Cargos"], "https://sasp.map.gob.do", "logos/sasp.png"],
      ["DIGECOG", "Dirección General de Contabilidad Gubernamental: estados financieros y normativa contable del sector público.", ["Contabilidad", "Estados financieros", "Normativa"], "https://www.digecog.gob.do", "logos/digecog-icon.png"]
    ]
  },
  {
    id: "campo", i: "🛠️", n: "Herramientas Digitales", d: "Herramientas para validar documentos, consultar datos abiertos y gestionar la documentación institucional.", tip: "Verifica la validez de los documentos firmados antes de incorporarlos como evidencia.", t: [
      ["ValidaFirma", "Validador de documentos con firma digital emitido por el INDOTEL.", ["Firma digital", "Validación", "Autenticidad"], "https://validafirma.indotel.gob.do", "logos/validafirma.svg"],
      ["Datos.gov", "Portal Nacional de Datos Abiertos del Gobierno dominicano.", ["Datos abiertos", "Estadísticas", "Transparencia"], "https://datos.gov.do/dataset/?groups=gestion-publica", "logos/datos.svg"],
      ["TRANSDOC", "Sistema de Gestión y Transparencia Documental: manejo de los documentos y comunicaciones que se reciben, gestionan y responden en la institución.", ["Documentos", "Comunicaciones", "Trazabilidad"]]
    ]
  }
];
const S = [["Soporte TeamMate", "🛠️"], ["Soporte TI CGRD", "🔑"], ["Solicitud de Capacitaciones", "🎓"]];
const tabs = document.getElementById("tabs"), main = document.getElementById("main");

// Vista visible y nombre corto de cada vista (se usa en el título y en los avisos al anfitrión).
let active = "home";
const VIEWS = { home: "Inicio", soporte: "Soporte" };
T.forEach(x => { VIEWS[x.id] = x.n; });

// ----------------------------------------------------------------------------
// Integración con un iframe anfitrión
// ----------------------------------------------------------------------------
// Esta página está pensada para incrustarse en otra página (SharePoint, WordPress,
// intranet, etc.). Los avisos "postMessage" permiten que la página anfitriona
// sepa en qué vista está el usuario y ajuste la altura del iframe para evitar
// barras de desplazamiento dobles. Solo se envían si la página está incrustada.

// Envía un aviso al sitio anfitrión.
function post(type, data) {
  if (window.parent === window) return;
  try {
    window.parent.postMessage(Object.assign({ source: "toolbox", type: type }, data || {}), "*");
  } catch (e) {
    // Si el navegador bloquea postMessage, la página sigue funcionando con normalidad.
  }
}

// Comunica la altura del contenido para que el iframe pueda redimensionarse.
// Se mide el body (no el documentElement) porque su altura es la del contenido:
// así el iframe puede encogerse cuando el contenido es más corto.
function reportSize() {
  const body = document.body;
  const height = Math.max(body.scrollHeight, body.offsetHeight);
  post("resize", { height: height });
}

// Activa el panel solicitado y actualiza el estado accesible de las pestañas.
function show(id) {
  const target = document.getElementById("p-" + id);
  if (!target) return;
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("on", p.id === "p-" + id));
  document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", String(b.dataset.id === id)));
  active = id;
  document.title = id === "home" ? "Toolbox Digital para Auditores" : VIEWS[id] + " · Toolbox Digital para Auditores";
  window.scrollTo({ top: 0 });
  post("panel", { id: id, title: VIEWS[id] });
  reportSize();
}

// Crea una pestaña y la conecta con el panel correspondiente.
function tab(id, label) {
  const b = document.createElement("button");
  b.className = "tab"; b.id = "tab-" + id; b.dataset.id = id;
  b.setAttribute("role", "tab"); b.setAttribute("aria-controls", "p-" + id);
  b.textContent = label;
  b.addEventListener("click", () => show(id));
  tabs.appendChild(b);
}

// Crea un panel oculto que se mostrará al seleccionar su pestaña.
function panel(id, html) {
  const s = document.createElement("section");
  s.className = "panel"; s.id = "p-" + id;
  s.setAttribute("role", "tabpanel"); s.setAttribute("aria-labelledby", "tab-" + id);
  s.innerHTML = html; main.appendChild(s);
}

// Las tarjetas que cambian de vista usan el atributo data-goto y un único
// delegado de eventos: así no hay manejadores en línea (onclick="...") y la
// página sigue funcionando con políticas estrictas de Content-Security-Policy.
main.addEventListener("click", (e) => {
  const el = e.target instanceof Element ? e.target.closest("[data-goto]") : null;
  if (el) show(el.dataset.goto);
});

// Navegación con teclado entre pestañas (patrón ARIA de tablist).
tabs.addEventListener("keydown", (e) => {
  if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft", "Home", "End"].includes(e.key)) return;
  const list = Array.from(tabs.querySelectorAll(".tab"));
  const i = list.indexOf(document.activeElement);
  if (i < 0) return;
  e.preventDefault();
  let next;
  if (e.key === "Home") next = list[0];
  else if (e.key === "End") next = list[list.length - 1];
  else next = list[(i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : list.length - 1)) % list.length];
  next.focus();
  show(next.dataset.id);
});

// Construye la página de inicio con accesos rápidos a cada categoría.
tab("home", "Inicio");
panel("home", '<p class="intro">Elige un tema para ver las herramientas disponibles.</p><div class="grid">' +
  T.map(x => `<button class="card tile" data-goto="${x.id}"><span class="ico">${x.i}</span><h3>${x.n}</h3><p>${x.d}</p><div class="meta"><span>${x.t.length} herramientas</span><a>Ver →</a></div></button>`).join("") +
  `<button class="card tile" data-goto="soporte"><span class="ico">🙋</span><h3>Soporte y contactos</h3><p>¿Dudas o necesitas acceso? Aquí está a quién acudir.</p><div class="meta"><span>${S.length} contactos</span><a>Ver →</a></div></button></div>`);

// Genera un panel por categoría con sus herramientas y recomendaciones.
T.forEach(x => {
  tab(x.id, x.i + " " + x.n);
  panel(x.id, `<p class="intro">${x.d}</p><div class="grid">` + x.t.map(t => `<article class="card"><div class="card-head">${t[4] ? `<img class="logo" src="${t[4]}" alt="">` : ""}<h3>${t[0]}</h3></div><p>${t[1]}</p><div class="chips">${t[2].map(c => `<span class="chip">${c}</span>`).join("")}</div><div class="meta meta-end">${t[3] ? `<a href="${t[3]}" target="_blank" rel="noopener noreferrer">Acceder</a>` : `<span>Enlace pendiente</span>`}</div></article>`).join("") + `</div><div class="tip">💡 <b>Buena práctica:</b> ${x.tip}</div>`);
});

// Agrega el panel de contactos de soporte y deja seleccionada la página inicial.
tab("soporte", "🙋 Soporte");
panel("soporte", '<p class="intro">Contacta al equipo correspondiente según tu necesidad.</p><div class="grid">' +
  S.map(s => `<article class="card"><span class="ico">${s[1]}</span><h3>${s[0]}</h3><p>[nombre / área]</p><div class="meta"><span>[correo / extensión]</span><span>[horario]</span></div></article>`).join("") + '</div>');

// Órdenes que puede enviar el sitio anfitrión (por ejemplo, para abrir una vista concreta).
window.addEventListener("message", (e) => {
  const d = e.data;
  if (!d || typeof d !== "object" || d.source === "toolbox") return;
  if (d.type === "toolbox:select" && d.id) show(String(d.id));
  if (d.type === "toolbox:ping") post("pong", { id: active });
});

// Mantiene al anfitrión al día con el tamaño del contenido.
window.addEventListener("resize", reportSize);
window.addEventListener("load", () => { post("ready", { id: active }); reportSize(); });
if (typeof ResizeObserver !== "undefined") new ResizeObserver(reportSize).observe(document.body);

show("home");
