/* Domina Franches · escenas 3D (Three.js r160 desde jsDelivr, ver importmap en index.html)
   1. Umbral 18+: candado negro lacado con su sello rojo y dos cadenas. Al pulsar «Entrar»
      el arco se abre, las cadenas caen y el candado vuela hacia la cámara.
   2. Contacto: medalla con el sello, girando despacio.
   Si WebGL no está disponible no pasa nada: se queda el logo plano en SVG. */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const ROJO = 0xe5061c;
const ROJO_CSS = '#e5061c';
const reducido = matchMedia('(prefers-reduced-motion: reduce)').matches;
// rectángulo redondeado en un contexto 2D
function rr(g, x, y, w, h, r) {
  g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
// el logo: candado rojo con la F calada (igual que el símbolo #logo-nucleo del HTML, caja de 200 × 200)
function candado(g, hueco) {
  g.save();
  g.strokeStyle = g.fillStyle = ROJO_CSS;
  g.lineWidth = 15; g.lineCap = 'butt';
  g.beginPath(); g.moveTo(63, 94); g.lineTo(63, 66); g.arc(100, 66, 37, Math.PI, 0); g.lineTo(137, 94); g.stroke();
  g.beginPath(); rr(g, 30, 86, 140, 108, 22); g.fill();
  g.globalAlpha = 0.5; g.lineWidth = 3; g.strokeStyle = hueco;
  g.beginPath(); rr(g, 41, 97, 118, 86, 13); g.stroke(); g.globalAlpha = 1;
  g.fillStyle = hueco; g.font = 'italic 700 92px "Bodoni Moda", Didot, Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.fillText('F', 100, 172);
  g.restore();
}

const suave = (x) => x * x * (3 - 2 * x);
const salida = (x) => 1 - Math.pow(1 - x, 3);
const entrada = (x) => x * x * x;
const tramo = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));

async function fuentes() {
  try {
    await Promise.all([
      document.fonts.load('italic 700 96px "Bodoni Moda"'),
      document.fonts.load('700 12px "Manrope"'),
    ]);
  } catch (e) { /* sin fuentes web: Georgia */ }
}

/** Dibuja el sello en un canvas y lo devuelve como textura. */
function sello(px, { fondo = null, anillo = true } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = px;
  const g = c.getContext('2d');
  if (fondo) { g.fillStyle = fondo; g.fillRect(0, 0, px, px); }
  g.scale(px / 200, px / 200);
  g.fillStyle = g.strokeStyle = ROJO_CSS;
  if (anillo) {                       // aro + texto circular (medalla)
    g.lineWidth = 2.4; g.beginPath(); g.arc(100, 100, 96, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.2; g.beginPath(); g.arc(100, 100, 72, 0, Math.PI * 2); g.stroke();
    const letras = [...'DOMINA FRANCHES ✦ MURCIA ✦ DÓMINA NATURAL ✦ '];
    g.font = '700 12px Manrope, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    letras.forEach((l, i) => {
      const a = -Math.PI / 2 + (i / letras.length) * Math.PI * 2;
      g.save(); g.translate(100 + Math.cos(a) * 84, 100 + Math.sin(a) * 84); g.rotate(a + Math.PI / 2);
      g.fillText(l, 0, 0); g.restore();
    });
    // el candado del logo en el centro
    g.translate(100, 100); g.scale(0.6, 0.6); g.translate(-100, -108);
    candado(g, fondo || '#0a0607');
  } else {                            // placa del candado 3D: doble aro y una F grande
    g.lineWidth = 6; g.beginPath(); g.arc(100, 100, 93, 0, Math.PI * 2); g.stroke();
    g.lineWidth = 1.6; g.beginPath(); g.arc(100, 100, 82, 0, Math.PI * 2); g.stroke();
    g.font = 'italic 700 132px "Bodoni Moda", Didot, Georgia, serif';
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    g.fillText('F', 100, 146);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function renderer(canvas) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  r.toneMapping = THREE.ACESFilmicToneMapping;
  r.toneMappingExposure = 1.05;
  r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}

function entorno(r, escena) {
  const pm = new THREE.PMREMGenerator(r);
  escena.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  pm.dispose();
}

const materiales = () => ({
  laca: new THREE.MeshPhysicalMaterial({ color: 0x0d0a0b, metalness: 0.35, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 0.9 }),
  acero: new THREE.MeshStandardMaterial({ color: 0xe2e2e8, metalness: 1, roughness: 0.16, envMapIntensity: 1.25 }),
  hierro: new THREE.MeshStandardMaterial({ color: 0x8e8e96, metalness: 1, roughness: 0.3, envMapIntensity: 1 }),
  rojo: new THREE.MeshStandardMaterial({ color: ROJO, metalness: 0.8, roughness: 0.28, emissive: 0x2a0004 }),
});

/** Cadena de eslabones entre dos puntos. */
function cadena(desde, hasta, mat) {
  const g = new THREE.Group();
  const dir = new THREE.Vector3().subVectors(hasta, desde);
  const largo = dir.length(); dir.normalize();
  const geo = new THREE.TorusGeometry(0.2, 0.062, 12, 32);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const paso = 0.5;
  for (let i = 0; i * paso <= largo; i++) {
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(desde).addScaledVector(dir, i * paso);
    m.quaternion.copy(q);
    if (i % 2) m.rotateY(Math.PI / 2);   // eslabones alternos, cruzados
    m.scale.set(1, 1.55, 1);
    g.add(m);
  }
  return g;
}

/* =================== 1. Umbral: candado =================== */
async function umbral() {
  const raiz = document.documentElement;
  const caja = document.getElementById('umbral');
  const canvas = document.getElementById('umbral-3d');
  if (!caja || !canvas || raiz.classList.contains('umbral-ok')) return;

  let r;
  try { r = renderer(canvas); } catch (e) { return; }
  await fuentes();
  if (raiz.classList.contains('umbral-ok')) { r.dispose(); return; }

  const escena = new THREE.Scene();
  entorno(r, escena);
  const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  cam.position.set(0, 0, 12);

  escena.add(new THREE.AmbientLight(0xffffff, 0.12));
  const clave = new THREE.DirectionalLight(0xffffff, 1.5); clave.position.set(3, 6, 8); escena.add(clave);
  const rojaI = new THREE.PointLight(ROJO, 90, 30, 2); rojaI.position.set(-5, 0.5, 4); escena.add(rojaI);
  const rojaD = new THREE.PointLight(ROJO, 70, 30, 2); rojaD.position.set(5, 3, -2); escena.add(rojaD);

  const M = materiales();
  const candado = new THREE.Group(); escena.add(candado);

  // cuerpo lacado, placa con el sello y bocallave
  candado.add(new THREE.Mesh(new RoundedBoxGeometry(2.4, 2.0, 0.8, 6, 0.22), M.laca));
  const tex = sello(1024, { anillo: false });
  const placa = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshStandardMaterial({
    map: tex, transparent: true, metalness: 0.6, roughness: 0.25,
    emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.6,
  }));
  placa.position.set(0, 0.2, 0.405); candado.add(placa);
  const aro = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.15, 40), M.acero);
  aro.position.set(0, -0.72, 0.406); candado.add(aro);
  const negro = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const hueco = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), negro);
  hueco.position.set(0, -0.72, 0.405); candado.add(hueco);
  const ranura = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.2), negro);
  ranura.position.set(0, -0.83, 0.406); candado.add(ranura);
  // filete rojo alrededor de la cara
  const filete = new THREE.Mesh(new RoundedBoxGeometry(2.46, 2.06, 0.18, 4, 0.08), M.rojo);
  filete.position.z = 0.0; filete.scale.set(1, 1, 1); candado.add(filete);

  // arco de acero: gira sobre la pata derecha
  const pivote = new THREE.Group(); pivote.position.set(0.72, 1.0, 0); candado.add(pivote);
  const arco = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.14, 24, 72, Math.PI), M.acero);
  arco.position.set(-0.72, 0.85, 0); pivote.add(arco);
  const pataGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.0, 24);
  const pataI = new THREE.Mesh(pataGeo, M.acero); pataI.position.set(-1.44, 0.35, 0); pivote.add(pataI);
  const pataD = new THREE.Mesh(pataGeo, M.acero); pataD.position.set(0, 0.35, 0); pivote.add(pataD);

  // dos cadenas que bajan hasta el arco
  const enganche = new THREE.Vector3(0, 2.42, 0);
  const cadenas = [
    cadena(enganche, new THREE.Vector3(-5.5, 9.5, -1.5), M.hierro),
    cadena(enganche, new THREE.Vector3(5.5, 9.5, -1.5), M.hierro),
  ];
  cadenas.forEach((c) => candado.add(c));

  // chispas rojas
  const N = 140, pos = new Float32Array(N * 3), vel = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 16; pos[i * 3 + 1] = (Math.random() - 0.5) * 10; pos[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    vel[i] = 0.004 + Math.random() * 0.012;
  }
  const pgeo = new THREE.BufferGeometry(); pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const chispas = new THREE.Points(pgeo, new THREE.PointsMaterial({ color: 0xff2a3a, size: 0.05, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, depthWrite: false }));
  escena.add(chispas);

  // encuadre: el candado ocupa el hueco que deja el texto de abajo
  const cajaTexto = document.getElementById('umbral-caja');
  const base = { y: 0 };
  function medir() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    r.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
    const vh = 2 * cam.position.z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const vw = vh * cam.aspect;
    const arriba = Math.max(0.32, cajaTexto.getBoundingClientRect().top / h - 0.03);   // hasta dónde puede bajar
    const s = Math.min(1, (vh * (arriba - 0.05) * 0.9) / 3.6, (vw * 0.62) / 2.6);
    candado.scale.setScalar(s);
    const centro = 0.05 + (arriba - 0.05) / 2;            // centro del hueco, en fracción de alto
    base.y = vh * (0.5 - centro) - 0.78 * s;              // 0.78: el arco sube el centro visual
  }

  // si el 3D llega tarde (ya se puso el logo plano o ya se pulsó «Entrar»), no se monta encima
  if (caja.classList.contains('plano') || caja.classList.contains('abriendo')) { r.dispose(); return; }
  medir();
  caja.classList.add('con-3d');          // el candado aparece con un fundido; el texto no se mueve
  addEventListener('resize', medir);

  const reloj = new THREE.Clock();
  let abre = null, vivo = true;
  document.addEventListener('umbral:entrar', () => { abre = reloj.getElapsedTime(); }, { once: true });
  document.addEventListener('umbral:fuera', () => {
    vivo = false;
    removeEventListener('resize', medir);
    setTimeout(() => { r.dispose(); r.forceContextLoss(); }, 50);
  }, { once: true });

  function cuadro() {
    if (!vivo) return;
    const t = reloj.getElapsedTime();
    const giro = reducido ? 0.25 : Math.sin(t * 0.55) * 0.32;
    if (abre === null) {
      candado.rotation.y = giro;
      candado.rotation.x = reducido ? 0 : Math.sin(t * 0.4) * 0.04;
      candado.position.set(0, base.y + (reducido ? 0 : Math.sin(t * 1.1) * 0.06), 0);
      cadenas.forEach((c, i) => { c.rotation.z = reducido ? 0 : Math.sin(t * 0.9 + i) * 0.015; });
    } else {
      const a = t - abre;
      // 1) el arco salta y gira
      pivote.position.y = 1.0 + 0.55 * salida(tramo(a, 0, 0.28));
      pivote.rotation.y = -1.3 * suave(tramo(a, 0.22, 0.6));
      // 2) las cadenas caen hacia fuera
      cadenas.forEach((c, i) => {
        const u = Math.max(0, a - 0.3);
        c.position.y = -6 * u * u;
        c.rotation.z = (i ? -1 : 1) * 0.5 * entrada(tramo(a, 0.3, 1.2));
      });
      // 3) golpe de luz y el candado vuela hacia la cámara
      rojaI.intensity = 90 + 260 * Math.sin(Math.PI * tramo(a, 0.15, 0.7));
      const v = entrada(tramo(a, 0.45, 1.3));   // termina cuando la entrada ya se está fundiendo
      candado.rotation.y = giro + v * Math.PI * 1.2;
      candado.position.set(0, base.y * (1 - v), v * 10.5);
    }
    if (!reducido) {
      for (let i = 0; i < N; i++) {
        pos[i * 3 + 1] += vel[i];
        if (pos[i * 3 + 1] > 5) pos[i * 3 + 1] = -5;
      }
      pgeo.attributes.position.needsUpdate = true;
    }
    r.render(escena, cam);
    requestAnimationFrame(cuadro);
  }
  cuadro();
}

/* =================== 2. Contacto: medalla =================== */
async function medalla() {
  const caja = document.getElementById('medallon-caja');
  const canvas = document.getElementById('medallon');
  if (!caja || !canvas) return;

  let r;
  try { r = renderer(canvas); } catch (e) { return; }
  await fuentes();

  const escena = new THREE.Scene();
  entorno(r, escena);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  cam.position.set(0, 0, 9.5);
  escena.add(new THREE.AmbientLight(0xffffff, 0.15));
  const clave = new THREE.DirectionalLight(0xffffff, 1.4); clave.position.set(2, 4, 6); escena.add(clave);
  const roja = new THREE.PointLight(ROJO, 60, 20, 2); roja.position.set(-3.5, -1, 3); escena.add(roja);

  const M = materiales();
  const tex = sello(1024, { fondo: '#0c0809', anillo: true });
  const cara = new THREE.MeshPhysicalMaterial({
    map: tex, metalness: 0.45, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.1,
    emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.4,
  });
  const grupo = new THREE.Group(); escena.add(grupo);
  // el cilindro se gira para que su tapa mire a la cámara; la textura se corrige para leerse derecha
  const moneda = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.22, 128, 1), [M.rojo, cara, cara]);
  moneda.rotation.x = Math.PI / 2;
  tex.center.set(0.5, 0.5); tex.rotation = Math.PI / 2;
  grupo.add(moneda);
  const canto = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.11, 24, 128), M.rojo);
  grupo.add(canto);

  function medir() {
    const s = canvas.clientWidth || 280;
    r.setSize(s, s, false);
  }
  medir();
  addEventListener('resize', medir);
  caja.classList.add('con-3d');

  let visible = false;
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(canvas);
  const reloj = new THREE.Clock();
  function cuadro() {
    if (visible || reducido) {
      const t = reloj.getElapsedTime();
      grupo.rotation.y = reducido ? -0.35 : Math.sin(t * 0.6) * 0.75;
      grupo.rotation.x = reducido ? 0.08 : Math.sin(t * 0.45) * 0.12;
      grupo.position.y = reducido ? 0 : Math.sin(t * 1.2) * 0.06;
      r.render(escena, cam);
    }
    if (!reducido) requestAnimationFrame(cuadro);
  }
  cuadro();
}

umbral();
medalla();
