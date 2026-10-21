# Toolbox Digital para Auditores — incrustación en un iframe

Esta carpeta es una aplicación web estática (HTML + CSS + JS, sin dependencias ni compilación) y está
preparada para mostrarse dentro de un `iframe` de otra página (SharePoint, WordPress, intranet, portal
del cliente, etc.).

---

## 1. Qué se hizo para que funcione dentro de un iframe

| Cambio | Motivo |
| --- | --- |
| `.htaccess`, `web.config`, `_headers` | Los navegadores bloquean el incrustado cuando el servidor envía `X-Frame-Options` o `frame-ancestors`. Estas cabeceras **no se pueden poner desde el HTML**, hay que configurarlas en el servidor. |
| `script.js`: sin atributos `onclick` en línea | Con `Content-Security-Policy: script-src 'self'` los manejadores en línea se bloquean y las tarjetas dejan de responder. Ahora la navegación usa `data-goto` + un delegado de eventos. |
| `script.js`: avisos `postMessage` al anfitrión | La página informa en qué vista está el usuario y cuál es la altura del contenido, para que el `iframe` pueda ajustarse y evitar barras de desplazamiento dobles. |
| `script.js`: acepta órdenes del anfitrión | La página anfitriona puede abrir una vista concreta (`toolbox:select`) o comprobar que la página está viva (`toolbox:ping` → `pong`). |
| `styles.css`: `minmax(min(270px, 100%), 1fr)` | Evita el desbordamiento horizontal cuando el `iframe` es más estrecho que 270 px. |
| `styles.css`: media query de 480 px | Reduce márgenes y paddings en `iframes` estrechos (columna lateral, móvil embebido). |
| `styles.css`: el fondo de `body` se propaga al lienzo y **no** se fuerza `min-height` en `body` | El `iframe` se ve completo (sin franjas blancas) y, al no forzar la altura del `body`, el autoajuste puede **encoger** el `iframe` cuando el contenido es más corto que el `iframe`. |
| `styles.css`: contornos `:focus-visible` y animación del panel | Navegación con teclado dentro del `iframe` (accesibilidad). |
| HTML: `<noscript>` | Si el navegador tiene JavaScript bloqueado dentro del `iframe`, el usuario ve un aviso en lugar de una página en blanco. |

Los archivos que deben publicarse son los de siempre (`Toolbox Digital para Auditores.html`, `styles.css`,
`script.js`, `logos/`). Los archivos de configuración (`_headers`, `web.config`) y la carpeta `dev/` son
auxiliares.

---

## 2. Requisito del servidor (lo único que no depende del código)

El servidor **no debe** enviar cabeceras que prohíban el incrustado. Lo ideal es:

```
Content-Security-Policy: frame-ancestors *
X-Frame-Options: (sin valor o ausente)
```

Cuando existe `frame-ancestors`, los navegadores modernos **ignoran** `X-Frame-Options`, por lo que basta
con la primera cabecera. Ya está preparada en los tres archivos de configuración incluidos:

| Hosting | Archivo | Notas |
| --- | --- | --- |
| Apache | `.htaccess` | Requiere `AllowOverride All` (o `FileInfo`) en la carpeta y `mod_headers` y `mod_mime` habilitados. |
| IIS / Windows Server | `web.config` | Requiere el módulo de IIS instalado en el sitio. |
| Netlify / Cloudflare Pages | `_headers` | Se publica tal cual en la raíz del proyecto. |
| Otros (Vercel, nginx, S3…) | — | Añadir la cabecera en la configuración del servidor o en `vercel.json`. |

Si el servidor ya define una política CSP propia, **añade** sus directivas a la cabecera en lugar de
sustituirla, por ejemplo:

```
Content-Security-Policy: frame-ancestors *; default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'
```

Verificación rápida (debe verse `frame-ancestors` y no debe verse `X-Frame-Options`):

```bash
curl -I https://tu-sitio/CGRD/Toolbox%20Digital%20para%20Auditores.html
```

---

## 3. Cómo incrustarla

El nombre del archivo tiene espacios: en el `src` hay que codificarlos (`%20`) o usar rutas relativas.

```html
<iframe id="toolbox"
        src="https://tu-sitio/CGRD/Toolbox%20Digital%20para%20Auditores.html"
        title="Toolbox Digital para Auditores"
        style="width:100%;height:640px;border:0;border-radius:12px"
        loading="lazy"
        referrerpolicy="strict-origin-when-cross-origin"></iframe>
```

### Ajuste automático de la altura (sin doble barra de desplazamiento)

```html
<script>
  const frame = document.getElementById('toolbox');

  window.addEventListener('message', (e) => {
    const d = e.data;
    // Acepta solo mensajes de la herramienta y verifica el origen si hace falta.
    if (!d || d.source !== 'toolbox') return;
    if (d.type === 'resize') frame.style.height = d.height + 'px';
    if (d.type === 'panel') console.log('Vista activa:', d.id);
  });
</script>
```

Si la página anfitriona es de otro dominio, valida siempre `e.origin` antes de usar el mensaje:

```js
if (e.origin !== 'https://tu-sitio') return;
```

### Opciones de `sandbox`

Si se usa `sandbox`, deben incluirse los permisos que necesita la página:

```html
<iframe sandbox="allow-scripts allow-same-origin allow-popups" src="..."></iframe>
```

* `allow-popups` es **imprescindible** para que los enlaces “Acceder” (que usan `target="_blank"`) abran
  una pestaña nueva.
* `allow-same-origin` solo es necesario si la página anfitriona quiere leer el contenido del `iframe`
  con `contentDocument`; se puede omitir si solo se usan los avisos `postMessage`.

---

## 4. Contrato de mensajes (`postMessage`)

Todos los mensajes llevan `source: "toolbox"` para poder distinguirlos de otros.

### De la herramienta hacia la página anfitriona

| Mensaje | Datos | Cuándo se envía |
| --- | --- | --- |
| `{type:"ready"}` | `{id}` | Cuando el documento termina de cargar. |
| `{type:"panel"}` | `{id, title}` | Cada vez que cambia la vista (por clic, teclado u orden externa). |
| `{type:"resize"}` | `{height}` | Cuando cambia el alto del contenido (cambio de vista, redimensionado, carga de imágenes). |
| `{type:"pong"}` | `{id}` | Respuesta a `toolbox:ping`. |

### De la página anfitriona hacia la herramienta

| Mensaje | Efecto |
| --- | --- |
| `{type:"toolbox:select", id:"plan"}` | Abre la vista indicada (`home`, `plan`, `campo`, `soporte`). |
| `{type:"toolbox:ping"}` | Devuelve `{type:"pong", id}` con la vista activa. |

```js
frame.contentWindow.postMessage({ type: 'toolbox:select', id: 'campo' }, '*');
```

---

## 5. Prueba local

Los `iframe` con rutas relativas funcionan abriéndolos con doble clic, pero para probar los mensajes es
mejor servir la carpeta por HTTP:

```bash
# Con Python
python -m http.server 8000

# O con Node
npx serve .
```

Luego abrir `http://localhost:8000/dev/embed-demo.html`: es una página anfitriona de ejemplo que incrusta
la herramienta, ajusta el alto automáticamente, permite cambiar de vista con los botones y muestra los
avisos que recibe.

---

## 6. Problemas frecuentes

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| El `iframe` sale en blanco y la consola dice *“Refused to frame … because an X-Frame-Options header is set”* | El servidor bloquea el incrustado. | Revisar la sección 2 y `curl -I` sobre la URL real. |
| *“Content Security Policy: frame-ancestors …”* | La CSP del servidor prohíbe el incrustado. | Ajustar la cabecera `frame-ancestors` (se permiten varios orígenes separados por espacios). |
| El `iframe` aparece pero vacío | JavaScript bloqueado por la CSP del servidor (`script-src 'self'`). | El código ya no usa manejadores en línea; si sigue vacío, revisar `script-src` y que `script.js` se sirva como `text/javascript`. |
| Los enlaces “Acceder” no hacen nada | Falta `allow-popups` en `sandbox`. | Añadir `allow-popups` o quitar el atributo `sandbox`. |
| Aparecen dos barras de desplazamiento. | El `iframe` tiene altura fija y el contenido es más alto. | Usar el ajuste automático con el aviso `resize` (sección 3). |
| El contenido se ve cortado en columnas estrechas. | Anchos menores de 270 px. | Ya está corregido con `minmax(min(270px, 100%), 1fr)` y la media query de 480 px. |
