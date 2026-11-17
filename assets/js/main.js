/* Domina Franches · umbral 18+, cabecera, brasas, revelados, inclinación 3D, visor y formulario → WhatsApp
   (las escenas 3D con Three.js están en tres.js) */
(function () {
  'use strict';

  var WA_NUM = '34688373190';                       // +34 688 37 31 90
  var WA_SALUDO = 'Hola, Domina Franches. Te escribo desde tu web.';
  var raiz = document.documentElement;
  var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function guarda(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function waURL(texto) { return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(texto); }

  /* ---------- enlaces de WhatsApp con saludo ya escrito ---------- */
  document.querySelectorAll('.js-wa').forEach(function (a) { a.href = waURL(WA_SALUDO); });

  /* ---------- umbral 18+ ---------- */
  var umbral = document.getElementById('umbral');
  if (umbral && !raiz.classList.contains('umbral-ok')) {
    var entrar = document.getElementById('umbral-entrar');
    entrar.focus({ preventScroll: true });
    // si el candado 3D no ha arrancado en 2,5 s (sin WebGL, CDN caído…), logo plano centrado
    setTimeout(function () {
      if (!umbral.classList.contains('con-3d')) umbral.classList.add('plano');
    }, 2500);
    // Una sola apertura: el candado se abre (0–1,3 s), la portada empieza a entrar a los 0,85 s
    // mientras la entrada se funde (0,85–1,55 s) y a los 1,6 s la entrada desaparece.
    entrar.addEventListener('click', function () {
      if (umbral.classList.contains('abriendo')) return;          // un segundo clic no hace nada
      guarda('df-umbral', '1');
      document.dispatchEvent(new CustomEvent('umbral:entrar'));   // tres.js abre el candado
      umbral.classList.add('abriendo');
      setTimeout(function () {
        document.dispatchEvent(new CustomEvent('umbral:revela')); // arranca la portada
      }, reducido ? 0 : 850);
      setTimeout(function () {
        raiz.classList.add('umbral-ok');
        document.dispatchEvent(new CustomEvent('umbral:fuera'));
      }, reducido ? 0 : 1600);
    });
  }

  /* ---------- cabecera: fondo al bajar y menú móvil ---------- */
  var cab = document.getElementById('cab');
  var menu = document.getElementById('menu');
  var flota = document.getElementById('wa-flota');
  var portada = document.getElementById('inicio');
  var progreso = document.getElementById('progreso');
  var charlado = false;
  try { charlado = sessionStorage.getItem('df-charla') === '1'; } catch (e) {}
  function alBajar() {
    var y = window.scrollY;
    cab.classList.toggle('cab--solida', y > 40);
    var verFlota = y > portada.offsetHeight * 0.7;
    flota.classList.toggle('visible', verFlota);
    var alto = document.documentElement.scrollHeight - innerHeight;
    progreso.style.setProperty('--p', alto > 0 ? Math.min(1, y / alto).toFixed(4) : 0);
    // bocadillo «¿Hablamos?» una sola vez por visita
    if (verFlota && !charlado) {
      charlado = true;
      try { sessionStorage.setItem('df-charla', '1'); } catch (e) {}
      setTimeout(function () { flota.classList.add('charla'); }, 2500);
      setTimeout(function () { flota.classList.remove('charla'); }, 8000);
    }
  }
  window.addEventListener('scroll', alBajar, { passive: true });
  alBajar();
  function cerrarMenu() { cab.classList.remove('cab--abierta'); menu.setAttribute('aria-expanded', 'false'); }
  menu.addEventListener('click', function () {
    var abierto = cab.classList.toggle('cab--abierta');
    menu.setAttribute('aria-expanded', String(abierto));
  });
  document.querySelectorAll('#nav a').forEach(function (a) { a.addEventListener('click', cerrarMenu); });

  /* ---------- portada: nombre letra a letra; arranca al pasar el umbral ---------- */
  var titulo = document.querySelector('.portada__t');
  if (titulo) {
    var nodo = titulo.lastChild;                     // el texto «Franches» tras «Domina»
    if (nodo && nodo.nodeType === 3 && nodo.textContent.trim()) {
      var pal = document.createElement('span'); pal.className = 'palabra';
      pal.setAttribute('aria-label', nodo.textContent.trim());
      nodo.textContent.trim().split('').forEach(function (l, i) {
        var s = document.createElement('span'); s.className = 'letra'; s.textContent = l;
        s.setAttribute('aria-hidden', 'true'); s.style.setProperty('--i', i); pal.appendChild(s);
      });
      titulo.replaceChild(pal, nodo);
      titulo.setAttribute('aria-label', 'Domina Franches');
    }
  }
  // visita repetida (sin umbral): esperar a que se pinte el estado inicial para que haya transición;
  // viniendo del umbral, la portada ya está pintada detrás y se arranca en el acto
  if (raiz.classList.contains('umbral-ok')) {
    requestAnimationFrame(function () { requestAnimationFrame(function () { portada.classList.add('lista'); }); });
  } else {
    document.addEventListener('umbral:revela', function () { portada.classList.add('lista'); }, { once: true });
  }

  /* ---------- cita palabra a palabra ---------- */
  var cita = document.getElementById('cita');
  if (cita) {
    var k = 0;
    Array.prototype.slice.call(cita.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (t) {
          if (!t) return;
          if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
          var s = document.createElement('span'); s.className = 'pal'; s.textContent = t;
          s.style.setProperty('--i', k++); frag.appendChild(s);
        });
        cita.replaceChild(frag, n);
      } else {
        var w = document.createElement('span'); w.className = 'pal'; w.style.setProperty('--i', k++);
        cita.replaceChild(w, n); w.appendChild(n);
      }
    });
  }

  /* ---------- fotos que se descubren como una cortina ---------- */
  document.querySelectorAll('.rejilla__item, .interludio__foto, .protocolo__foto').forEach(function (el) {
    el.classList.add('cortina');
  });

  /* ---------- menú: sección activa ---------- */
  if ('IntersectionObserver' in window) {
    var enlaces = {};
    document.querySelectorAll('#nav a').forEach(function (a) { enlaces[a.getAttribute('href').slice(1)] = a; });
    var espia = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        var a = enlaces[e.target.id];
        if (a) a.classList.toggle('activo', e.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(enlaces).forEach(function (id) { var s = document.getElementById(id); if (s) espia.observe(s); });
  }

  /* ---------- revelados ---------- */
  var revelas = document.querySelectorAll('.revela');
  if ('IntersectionObserver' in window && !reducido) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('dentro'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revelas.forEach(function (el) { io.observe(el); });
  } else {
    revelas.forEach(function (el) { el.classList.add('dentro'); });
  }

  /* ---------- brasas en la portada (leen el color del tono activo) ---------- */
  var lienzo = document.getElementById('brasas');
  if (lienzo && !reducido) {
    var ctx = lienzo.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, chispas = [], rgb = '229,6,28', visible = true;
    function leeColor() { rgb = getComputedStyle(raiz).getPropertyValue('--acento-rgb').trim() || rgb; }
    function mide() {
      W = lienzo.clientWidth; H = lienzo.clientHeight;
      lienzo.width = W * dpr; lienzo.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function nueva(inicio) {
      return {
        x: Math.random() * W, y: inicio ? Math.random() * H : H + 10,
        r: Math.random() * 1.8 + 0.5, v: Math.random() * 0.45 + 0.15,
        d: Math.random() * Math.PI * 2, a: Math.random() * 0.5 + 0.25
      };
    }
    mide(); leeColor();
    var n = W < 700 ? 26 : 48;
    for (var i = 0; i < n; i++) chispas.push(nueva(true));
    window.addEventListener('resize', mide);
    new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(lienzo);
    (function anima() {
      if (visible) {
        ctx.clearRect(0, 0, W, H);
        chispas.forEach(function (c, k) {
          c.y -= c.v; c.d += 0.012; c.x += Math.sin(c.d) * 0.35;
          var vida = Math.max(0, Math.min(1, c.y / H));
          ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + rgb + ',' + (c.a * vida).toFixed(3) + ')';
          ctx.shadowColor = 'rgba(' + rgb + ',.9)'; ctx.shadowBlur = 8;
          ctx.fill();
          if (c.y < -10) chispas[k] = nueva(false);
        });
      }
      requestAnimationFrame(anima);
    })();
  }

  /* ---------- inclinación 3D de tarjetas y fotos (solo con ratón) ---------- */
  if (!reducido && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.inclina').forEach(function (el) {
      var esCarta = el.classList.contains('carta') || el.classList.contains('rejilla__item');
      var max = esCarta ? 10 : 6;
      if (esCarta) { var b = document.createElement('span'); b.className = 'brillo'; el.appendChild(b); }
      var raf = null;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.classList.remove('soltando'); el.classList.add('inclinando');
          el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * max).toFixed(2) + 'deg) rotateY(' +
            ((px - 0.5) * max).toFixed(2) + 'deg) translateZ(' + (esCarta ? 18 : 10) + 'px)';
          el.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
          el.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        });
      });
      el.addEventListener('pointerleave', function () {
        if (raf) cancelAnimationFrame(raf);
        el.classList.remove('inclinando'); el.classList.add('soltando');
        el.style.transform = '';
      });
    });
  }

  /* ---------- visor de la galería ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.rejilla__item'));
  var visor = document.getElementById('visor');
  var vImg = document.getElementById('visor-img');
  var vCont = document.getElementById('visor-cont');
  var actual = 0, previo = null;
  function muestra(i) {
    actual = (i + items.length) % items.length;
    var a = items[actual];
    vImg.src = a.getAttribute('href');
    vImg.alt = a.querySelector('img').alt;
    var pie = a.querySelector('.rejilla__pie');
    vCont.textContent = (actual + 1) + ' / ' + items.length + (pie ? ' · ' + pie.textContent : '');
  }
  function abre(i) {
    previo = document.activeElement;
    muestra(i); visor.hidden = false; document.body.style.overflow = 'hidden';
    document.getElementById('visor-cerrar').focus();
  }
  function cierra() {
    visor.hidden = true; document.body.style.overflow = ''; vImg.removeAttribute('src');
    if (previo) previo.focus();
  }
  items.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); abre(i); });
  });
  document.getElementById('visor-cerrar').addEventListener('click', cierra);
  document.getElementById('visor-ant').addEventListener('click', function () { muestra(actual - 1); });
  document.getElementById('visor-sig').addEventListener('click', function () { muestra(actual + 1); });
  visor.addEventListener('click', function (e) { if (e.target === visor) cierra(); });
  document.addEventListener('keydown', function (e) {
    if (visor.hidden) return;
    if (e.key === 'Escape') cierra();
    else if (e.key === 'ArrowLeft') muestra(actual - 1);
    else if (e.key === 'ArrowRight') muestra(actual + 1);
  });
  var x0 = null;
  visor.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  visor.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 45) muestra(actual + (dx < 0 ? 1 : -1));
  });

  /* ---------- formulario → mensaje de WhatsApp ---------- */
  var PRACTICAS = ['Spanking', 'Disciplina inglesa', 'Flagelación', 'Cera', 'Castidad', 'Control del orgasmo',
    'Ataduras', 'Momificación', 'Privación sensorial', 'Humillación', 'Feminización', 'Juegos de rol',
    'Medical', 'Pony / doggy training', 'Fetichismo de pies', 'Trampling', 'Face-sitting', 'Smoking fetish',
    'CBT', 'Ballbusting', 'Strap-on', 'Iniciación', 'Findom'];
  var chips = document.getElementById('chips');
  PRACTICAS.forEach(function (p) {
    var l = document.createElement('label');
    l.innerHTML = '<input type="checkbox" name="practicas"><span></span>';
    l.querySelector('input').value = p;
    l.querySelector('span').textContent = p;
    chips.appendChild(l);
  });

  var form = document.getElementById('form-wa');
  var err = document.getElementById('form-error');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var alias = (d.get('alias') || '').trim();
    var edad = parseInt(d.get('edad'), 10);
    var falta = [];
    if (!alias) falta.push('tu alias');
    if (!(edad >= 18 && edad <= 99)) falta.push('tu edad (mayor de 18)');
    if (!d.get('experiencia')) falta.push('tu experiencia');
    if (!d.get('modalidad')) falta.push('la modalidad');
    if (!d.get('mayor')) falta.push('confirmar que eres mayor de edad');
    if (falta.length) {
      err.textContent = 'Te falta: ' + falta.join(', ') + '.';
      err.hidden = false; err.scrollIntoView({ block: 'center', behavior: reducido ? 'auto' : 'smooth' });
      return;
    }
    err.hidden = true;
    var practicas = d.getAll('practicas');
    var lineas = [
      'Hola, Domina Franches. Te escribo desde tu web.',
      '',
      '• Alias: ' + alias,
      '• Edad: ' + edad,
      '• Experiencia: ' + d.get('experiencia'),
      '• Modalidad: ' + d.get('modalidad')
    ];
    if (practicas.length) lineas.push('• Me atrae: ' + practicas.join(', '));
    var lim = (d.get('limites') || '').trim();
    if (lim) lineas.push('• Mis límites: ' + lim);
    var cuando = (d.get('cuando') || '').trim();
    if (cuando) lineas.push('• Disponibilidad: ' + cuando);
    lineas.push('', 'Quedo a la espera de tus instrucciones.');
    window.open(waURL(lineas.join('\n')), '_blank', 'noopener');
  });

  var anio = document.getElementById('anio');
  if (anio) anio.textContent = new Date().getFullYear();
})();
