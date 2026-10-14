// Categorías y herramientas: [nombre, descripción, [tags], url?, logo?]
const T = [
  {
    id: "plan", i: "🏛️", n: "Sistemas gob",
    d: "Sistemas oficiales del Estado dominicano para consultar información financiera, presupuestaria, de compras y de personal.",
    tip: "Cita siempre el sistema, el módulo y la fecha de consulta como evidencia de auditoría.",
    t: [
      ["SIGEF", "Sistema Integrado de Gestión Financiera: ejecución presupuestaria, ingresos y gastos del Estado.", ["Presupuesto", "Ejecución", "Libramientos"], "https://sigef.hacienda.gob.do", "logos/sigef.png"],
      ["SECP", "Sistema Electrónico de Contrataciones Públicas: procesos de compras y contrataciones del Estado.", ["Compras", "Licitaciones", "Contratos"], "https://secp.gob.do", "logos/secp.ico"],
      ["SASP", "Sistema de Administración de Servidores Públicos: gestión de nómina y datos del personal del Estado.", ["Nómina", "Personal", "Cargos"], "https://sasp.map.gob.do", "logos/sasp.png"],
      ["DIGECOG", "Dirección General de Contabilidad Gubernamental: estados financieros y normativa contable del sector público.", ["Contabilidad", "Estados financieros", "Normativa"], "https://www.digecog.gob.do", "logos/digecog-icon.png"]
    ]
  },
  {
    id: "campo", i: "🛠️", n: "Herramientas Digitales",
    d: "Herramientas para validar documentos, consultar datos abiertos y gestionar la documentación institucional.",
    tip: "Verifica la validez de los documentos firmados antes de incorporarlos como evidencia.",
    t: [
      ["ValidaFirma", "Validador de documentos con firma digital emitido por el INDOTEL.", ["Firma digital", "Validación", "Autenticidad"], "https://validafirma.indotel.gob.do", "logos/validafirma.svg"],
      ["Datos.gov", "Portal Nacional de Datos Abiertos del Gobierno dominicano.", ["Datos abiertos", "Estadísticas", "Transparencia"], "https://datos.gov.do/dataset/?groups=gestion-publica", "logos/datos.svg"],
      ["TRANSDOC", "Sistema de Gestión y Transparencia Documental: manejo de los documentos y comunicaciones que se reciben, gestionan y responden en la institución.", ["Documentos", "Comunicaciones", "Trazabilidad"]]
    ]
  }
];

// Contactos de soporte: [nombre, emoji]
const S = [["Soporte TeamMate", "🛠️"], ["Soporte TI CGRD", "🔑"], ["Solicitud de Capacitaciones", "🎓"]];

// Muestra el panel indicado y resalta su pestaña
function show(id) {
  document.querySelectorAll(".panel").forEach(p => p.classList.toggle("on", p.id === "p-" + id));
  document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", String(b.dataset.id === id)));
  window.scrollTo({ top: 0 });
}

// Crea una pestaña en el menú lateral
function tab(id, label) {
  const b = document.createElement("button");
  b.className = "tab";
  b.dataset.id = id;
  b.setAttribute("role", "tab");
  b.textContent = label;
  b.onclick = () => show(id);
  document.getElementById("tabs").appendChild(b);
}

// Crea un panel de contenido en el contenedor principal
function panel(id, html) {
  const s = document.createElement("section");
  s.className = "panel";
  s.id = "p-" + id;
  s.innerHTML = html;
  document.getElementById("main").appendChild(s);
}

// Inicio: tarjetas por categoría más soporte
tab("home", "Inicio");
panel("home",
  '<p class="intro">Elige un tema para ver las herramientas disponibles.</p><div class="grid">' +
  T.map(x => `<button class="card tile" onclick="show('${x.id}')"><span class="ico">${x.i}</span><h3>${x.n}</h3><p>${x.d}</p><div class="meta"><span>${x.t.length} herramientas</span><a>Ver →</a></div></button>`).join("") +
  `<button class="card tile" onclick="show('soporte')"><span class="ico">🙋</span><h3>Soporte y contactos</h3><p>¿Dudas o necesitas acceso? Aquí está a quién acudir.</p><div class="meta"><span>${S.length} contactos</span><a>Ver →</a></div></button></div>`);

// Un panel por categoría con sus herramientas
T.forEach(x => {
  tab(x.id, x.i + " " + x.n);
  panel(x.id,
    `<p class="intro">${x.d}</p><div class="grid">` +
    x.t.map(([n, d, tags, url, logo]) =>
      `<article class="card"><div class="card-head">${logo ? `<img class="logo" src="${logo}" alt="">` : ""}<h3>${n}</h3></div><p>${d}</p>` +
      `<div class="chips">${tags.map(g => `<span class="chip">${g}</span>`).join("")}</div>` +
      `<div class="meta meta-end">${url ? `<a href="${url}" target="_blank" rel="noopener noreferrer">Acceder</a>` : "<span>Enlace pendiente</span>"}</div></article>`
    ).join("") +
    `</div><div class="tip">💡 <b>Buena práctica:</b> ${x.tip}</div>`);
});

// Panel de soporte y contactos
tab("soporte", "🙋 Soporte");
panel("soporte",
  '<p class="intro">Contacta al equipo correspondiente según tu necesidad.</p><div class="grid">' +
  S.map(([n, e]) => `<article class="card"><span class="ico">${e}</span><h3>${n}</h3><p>[nombre / área]</p><div class="meta"><span>[correo / extensión]</span><span>[horario]</span></div></article>`).join("") +
  "</div>");

// Vista inicial
show("home");
