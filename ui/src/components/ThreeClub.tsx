import { useEffect, useRef, useState, useCallback, Component, type ReactNode, type ErrorInfo } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { useAuth } from '../hooks/useAuth';
import { pcApi, bookingApi, profileApi, type Pc } from '../services/api';

const STATUS_CSS: Record<string, string> = {
  free: '', booked: '#eab308', occupied: '#ef4444', maintenance: '#6b7280',
};
const STATUS_RU: Record<string, string> = {
  free: 'Свободно', booked: 'Забронирован', occupied: 'Занят', maintenance: 'На обслуживании',
};
const STATUS_EMISSIVE: Record<string, number> = {
  booked: 0x553f00, occupied: 0x440000, maintenance: 0x1a1a1a,
};

// ── Error boundary ─────────────────────────────────────────────────────────
class SceneErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  componentDidCatch(e: Error, i: ErrorInfo) { console.error('[ThreeClub]', e, i); }
  render() {
    if (this.state.error) {
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                      height:'100vh', background:'#060612', color:'#ef4444', fontFamily:'monospace', padding:32, textAlign:'center' }}>
          <div style={{ fontSize:14, marginBottom:16, color:'#fff' }}>3D SCENE ERROR</div>
          <pre style={{ fontSize:11, color:'#ef4444', maxWidth:600, whiteSpace:'pre-wrap' }}>{this.state.error}</pre>
          <Link to="/" style={{ marginTop:24, color:'#22d3ee', fontSize:12 }}>← На главную</Link>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ════════════════════════════════════════════════════════════════════════
   LAYOUT — exactly mirrors the floor plan image:
   World coords: x = (px-512)/20 , z = (py-480)/20  (plan 1024x960)
   ════════════════════════════════════════════════════════════════════════ */

const ZONES: Record<string, { emissive: number; neon: number; css: string; price: string; specs: string }> = {
  STAGE:    { emissive: 0x003366, neon: 0x0099ff, css: '#0099ff', price: '200 BYN/ч', specs: "i7-12700KF · RTX 4070 Ti · AOC 25\" 240Hz" },
  BOOTCAMP: { emissive: 0x002a11, neon: 0x00cc55, css: '#00cc55', price: '150 BYN/ч', specs: "i7-12700F · RTX 4070 · AOC 25\" 240Hz" },
  STANDART: { emissive: 0x180042, neon: 0xaa44ff, css: '#aa44ff', price: '100 BYN/ч', specs: "i5-12400F · RTX 4060 · AOC 25\" 240Hz" },
};

const HP = Math.PI / 2;

// id, zone, x, z, rotY  — positions traced from the plan image
const PCS: { id: number; z: string; x: number; z3: number; ry: number }[] = [
  // ── STAGE 1-10 — vertical column, lower hall, along left wall ──
  { id: 10, z: 'STAGE', x: -4.6, z3:  6.25, ry: HP },
  { id:  9, z: 'STAGE', x: -4.6, z3:  8.00, ry: HP },
  { id:  8, z: 'STAGE', x: -4.6, z3:  9.60, ry: HP },
  { id:  7, z: 'STAGE', x: -4.6, z3: 11.25, ry: HP },
  { id:  6, z: 'STAGE', x: -4.6, z3: 12.60, ry: HP },
  { id:  5, z: 'STAGE', x: -4.6, z3: 15.50, ry: HP },
  { id:  4, z: 'STAGE', x: -4.6, z3: 17.10, ry: HP },
  { id:  3, z: 'STAGE', x: -4.6, z3: 18.70, ry: HP },
  { id:  2, z: 'STAGE', x: -4.6, z3: 20.30, ry: HP },
  { id:  1, z: 'STAGE', x: -4.6, z3: 21.90, ry: HP },
  // ── BOOTCAMP 11-15 — КРАНШТЕЙНЫ room, horizontal row ──
  { id: 11, z: 'BOOTCAMP', x: -10.05, z3: 8.7, ry: Math.PI },
  { id: 12, z: 'BOOTCAMP', x: -12.00, z3: 8.7, ry: Math.PI },
  { id: 13, z: 'BOOTCAMP', x: -13.95, z3: 8.7, ry: Math.PI },
  { id: 14, z: 'BOOTCAMP', x: -15.90, z3: 8.7, ry: Math.PI },
  { id: 15, z: 'BOOTCAMP', x: -17.85, z3: 8.7, ry: Math.PI },
  // ── STANDART 16-45 — top hall, 3 columns of 2 groups ──
  // column A (x=-16.25): 25..21 top, 20..16 bottom
  { id: 25, z: 'STANDART', x: -16.25, z3: -21.85, ry: -HP },
  { id: 24, z: 'STANDART', x: -16.25, z3: -20.10, ry: -HP },
  { id: 23, z: 'STANDART', x: -16.25, z3: -18.35, ry: -HP },
  { id: 22, z: 'STANDART', x: -16.25, z3: -16.60, ry: -HP },
  { id: 21, z: 'STANDART', x: -16.25, z3: -14.85, ry: -HP },
  { id: 20, z: 'STANDART', x: -16.25, z3: -11.35, ry: -HP },
  { id: 19, z: 'STANDART', x: -16.25, z3:  -9.55, ry: -HP },
  { id: 18, z: 'STANDART', x: -16.25, z3:  -7.85, ry: -HP },
  { id: 17, z: 'STANDART', x: -16.25, z3:  -6.05, ry: -HP },
  { id: 16, z: 'STANDART', x: -16.25, z3:  -4.30, ry: -HP },
  // column B (x=-13.7): 35..31 top, 30..26 bottom — back-to-back with A
  { id: 35, z: 'STANDART', x: -13.7, z3: -21.85, ry: HP },
  { id: 34, z: 'STANDART', x: -13.7, z3: -20.10, ry: HP },
  { id: 33, z: 'STANDART', x: -13.7, z3: -18.35, ry: HP },
  { id: 32, z: 'STANDART', x: -13.7, z3: -16.60, ry: HP },
  { id: 31, z: 'STANDART', x: -13.7, z3: -14.85, ry: HP },
  { id: 30, z: 'STANDART', x: -13.7, z3: -11.35, ry: HP },
  { id: 29, z: 'STANDART', x: -13.7, z3:  -9.55, ry: HP },
  { id: 28, z: 'STANDART', x: -13.7, z3:  -7.85, ry: HP },
  { id: 27, z: 'STANDART', x: -13.7, z3:  -6.05, ry: HP },
  { id: 26, z: 'STANDART', x: -13.7, z3:  -4.30, ry: HP },
  // column C (x=-7.45): 45..41 top, 40..36 bottom
  { id: 45, z: 'STANDART', x: -7.45, z3: -21.85, ry: HP },
  { id: 44, z: 'STANDART', x: -7.45, z3: -20.10, ry: HP },
  { id: 43, z: 'STANDART', x: -7.45, z3: -18.35, ry: HP },
  { id: 42, z: 'STANDART', x: -7.45, z3: -16.60, ry: HP },
  { id: 41, z: 'STANDART', x: -7.45, z3: -14.85, ry: HP },
  { id: 40, z: 'STANDART', x: -7.45, z3: -11.35, ry: HP },
  { id: 39, z: 'STANDART', x: -7.45, z3:  -9.55, ry: HP },
  { id: 38, z: 'STANDART', x: -7.45, z3:  -7.85, ry: HP },
  { id: 37, z: 'STANDART', x: -7.45, z3:  -6.05, ry: HP },
  { id: 36, z: 'STANDART', x: -7.45, z3:  -4.30, ry: HP },
];

// Walls: [centerX, centerZ, width, depth]
const WALLS: number[][] = [
  // ── perimeter ──
  [-5.35, -23.5, 28.4, .4],     // top
  [ 8.7, -13.55,  .4, 20.3],    // top hall right
  [11.15, -3.6,  5.3,  .4],     // step wall (left of entrance door)
  [16.05, -3.6,   .7,  .4],     // step wall (right stub)
  [16.2,   9.7,   .4, 27.0],    // right
  [ 4.2,  23.0, 24.5,  .4],     // bottom
  [-7.85, 14.35,  .4, 17.7],    // lower-left perimeter
  [-13.6, 10.0, 11.9,  .4],     // кранштейны bottom
  [-19.4, -6.75,  .4, 33.9],    // left
  // ── top hall bottom (z=-3.65) with corridor gap ──
  [-15.5, -3.65, 7.8, .4],
  [ 0.175,-3.65,17.05,.4],
  // ── TV2/TV3 block ──
  [-11.6, -2.40, .4, 2.45],
  [-11.6,  1.70, .4, 3.0],
  [-11.6,  4.95, .4, 1.1],
  [-15.5,  1.50, 7.8, .4],      // TV2/TV3 divider
  // ── кранштейны top (z=5.5) with door gap ──
  [-15.0,  5.5, 8.8, .4],
  [-8.2,   5.5, 1.2, .4],
  // ── middle strip rooms (TV1 / storage / admin) ──
  [-8.35, -1.075, .4, 5.15],
  [-3.85, -1.075, .4, 5.15],
  [ 2.4,  -1.075, .4, 5.15],
  [ 7.4,  -1.075, .4, 5.15],
  [-6.7,   1.5, 3.3, .4],
  [-1.4,   1.5, 4.9, .4],
  // ── WS / STAFF block ──
  [10.4,  5.375, .4, 7.25],
  [13.3,  1.75, 5.8, .4],
  [13.3,  3.25, 5.8, .4],
  [13.3,  5.00, 5.8, .4],
  [13.3,  9.00, 5.8, .4],
  // ── bar / kitchen ──
  [10.9, 13.25, .4, 8.5],
  [10.9, 20.50, .4, 5.0],
  [13.55,18.00, 5.3, .4],
];

// Lounge tables (white rounded shapes in plan)
const TABLES: number[][] = [
  [1.55, 7.25],[1.55,11.75],[1.55,16.0],[1.55,20.25],
  [6.00, 7.25],[6.00,11.75],[6.00,16.0],[6.00,20.25],
];

// Room labels: [text, x, z, color, size]
const ROOM_LABELS: [string, number, number, string][] = [
  ['КАМЕРА ХРАНЕНИЯ', -0.7, -1.0, '#8899bb'],
  ['СТОЙКА АДМИНИСТРАТОРА', 4.9, -1.0, '#ffcc44'],
  ['WS', 13.3, 2.45, '#8899bb'],
  ['WS', 13.3, 4.15, '#8899bb'],
  ['STAFF', 13.3, 7.0, '#8899bb'],
  ['БАР', 13.5, 13.5, '#ff66aa'],
  ['КУХНЯ', 13.5, 20.5, '#8899bb'],
  ['КРАНШТЕЙНЫ', -13.6, 7.3, '#00cc55'],
];

// Info panels on the right wall of the top hall (like in the plan legend)
const INFO_PANELS: { title: string; cz: number; color: string; lines: string[] }[] = [
  { title: 'STAGE',    cz: -20.1, color: '#0099ff', lines: ['1–10 PC', "AOC 240GZ 25', RTX 4070TI", 'INTEL I7-12700KF', '', 'HyperX девайсы'] },
  { title: 'BOOTCAMP', cz: -13.6, color: '#00cc55', lines: ['11–15 PC', "AOC 240GZ 25', RTX 4070", 'INTEL I7-12700F', '', 'HyperX девайсы'] },
  { title: 'STANDART', cz:  -6.75,color: '#aa44ff', lines: ['16–45 PC', "AOC 240GZ 25', RTX 4060", 'INTEL I5-12400F', '', 'HyperX девайсы'] },
];

// ── Inner scene ────────────────────────────────────────────────────────────
function ThreeScene() {
  const { user } = useAuth();
  const mountRef = useRef<HTMLDivElement>(null);
  const css2dRef = useRef<HTMLDivElement>(null);
  const [initErr, setInitErr] = useState<string | null>(null);

  // ── Live data from API ──
  const [pcMap,   setPcMap]   = useState<Record<number, Pc>>({});
  const [balance, setBalance] = useState<number | null>(null);
  const [selNum,  setSelNum]  = useState<number | null>(null);
  const [hours,   setHours]   = useState(1);
  const [busy,    setBusy]    = useState(false);
  const [msg,     setMsg]     = useState<{ ok: boolean; text: string } | null>(null);

  const applyRef  = useRef<((data: Pc[]) => void) | null>(null);
  const statusRef = useRef<Record<number, string>>({});

  const loadPcs = useCallback(async () => {
    try {
      const data = await pcApi.getAll();
      const m: Record<number, Pc> = {};
      data.forEach(p => { m[p.number] = p; statusRef.current[p.number] = p.status; });
      setPcMap(m);
      applyRef.current?.(data);
    } catch { /* API offline — keep last known state */ }
  }, []);

  useEffect(() => {
    loadPcs();
    const t = setInterval(loadPcs, 15000);
    return () => clearInterval(t);
  }, [loadPcs]);

  useEffect(() => {
    if (user) profileApi.get().then(p => setBalance(p.balance)).catch(() => {});
    else setBalance(null);
  }, [user]);

  const closeModal = () => { setSelNum(null); setMsg(null); setHours(1); setBusy(false); };

  const confirmBooking = async () => {
    const pc = selNum != null ? pcMap[selNum] : null;
    if (!pc) return;
    setBusy(true); setMsg(null);
    try {
      await bookingApi.create(pc.id, new Date().toISOString(), hours);
      setMsg({ ok: true, text: 'Бронирование успешно! ПК закреплён за вами.' });
      await loadPcs();
      profileApi.get().then(p => setBalance(p.balance)).catch(() => {});
    } catch (e: unknown) {
      const t = e instanceof Error ? e.message : 'Ошибка бронирования';
      setMsg({ ok: false, text: t.includes('Insufficient') ? 'Недостаточно средств на балансе' : t });
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const mount   = mountRef.current;
    const css2dEl = css2dRef.current;
    if (!mount || !css2dEl) return;

    let frameId = 0;

    try {
      const W = Math.max(mount.clientWidth,  window.innerWidth);
      const H = Math.max(mount.clientHeight, window.innerHeight);
      const RH = 7; // ceiling height

      // ── Scene / camera / renderers ───────────────────────────────────────
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x020310);
      scene.fog = new THREE.FogExp2(0x020310, 0.011);

      const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 300);
      camera.position.set(-2, 34, 40);

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W, H);
      mount.appendChild(renderer.domElement);

      const css2r = new CSS2DRenderer();
      css2r.setSize(W, H);
      Object.assign(css2r.domElement.style, { position:'absolute', top:'0', left:'0', pointerEvents:'none', width:'100%', height:'100%' });
      css2dEl.appendChild(css2r.domElement);

      const ctrl = new OrbitControls(camera, renderer.domElement);
      ctrl.enableDamping = true;
      ctrl.maxPolarAngle = Math.PI * 0.48;
      ctrl.minDistance = 6;
      ctrl.maxDistance = 90;
      ctrl.target.set(-2, 0, 0);

      // ── Lighting ─────────────────────────────────────────────────────────
      scene.add(new THREE.AmbientLight(0x8890b0, 1.3));
      const sun = new THREE.DirectionalLight(0xffffff, 1.2);
      sun.position.set(10, 40, 15); scene.add(sun);

      const lStage = new THREE.PointLight(0x0066ff, 10, 30); lStage.position.set(-4.5, 5, 14);  scene.add(lStage);
      const lBoot  = new THREE.PointLight(0x00cc55,  8, 24); lBoot.position.set(-13.5, 5, 8);   scene.add(lBoot);
      const lStd   = new THREE.PointLight(0xaa44ff, 10, 34); lStd.position.set(-12, 5, -12);    scene.add(lStd);
      const lBar   = new THREE.PointLight(0xff44aa,  8, 22); lBar.position.set(13, 5, 13.5);    scene.add(lBar);
      const lHall  = new THREE.PointLight(0x2255ff,  6, 28); lHall.position.set(4, 5, 12);      scene.add(lHall);

      // ── Floor / ceiling / grid ───────────────────────────────────────────
      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(36.4, 47.4),
        new THREE.MeshStandardMaterial({ color: 0x0a0a14, roughness: .85, metalness: .25 }),
      );
      floor.rotation.x = -HP; floor.position.set(-1.6, 0, -0.25); scene.add(floor);

      const grid = new THREE.GridHelper(72, 72, 0x14305a, 0x0a1228);
      grid.position.y = 0.02; scene.add(grid);

      const ceil = new THREE.Mesh(
        new THREE.PlaneGeometry(36.4, 47.4),
        new THREE.MeshStandardMaterial({ color: 0x050510, roughness: .95 }),
      );
      ceil.rotation.x = HP; ceil.position.set(-1.6, RH, -0.25); scene.add(ceil);

      // ── Zone floor tints ─────────────────────────────────────────────────
      const tints: number[][] = [
        [-12.0, -13.5, 14.0, 19.5, 0x08001a],  // STANDART top hall
        [-13.6,   7.7, 11.4,  4.2, 0x001008],  // КРАНШТЕЙНЫ
        [ -5.8,  14.0,  3.6, 17.0, 0x000a1e],  // STAGE strip
        [ 13.5,  13.5,  5.0,  8.6, 0x14000d],  // bar
      ];
      tints.forEach(([x, z, w, d, c]) => {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ color: c, roughness: .9 }));
        m.rotation.x = -HP; m.position.set(x, 0.03, z); scene.add(m);
      });

      // ── Walls ────────────────────────────────────────────────────────────
      const mWall = new THREE.MeshStandardMaterial({ color: 0x10101e, roughness: .9, metalness: .1 });
      WALLS.forEach(([cx, cz, w, d]) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, RH, d), mWall);
        m.position.set(cx, RH / 2, cz);
        scene.add(m);
      });
      // wall top edge glow strips (perimeter accents)
      const edges: number[][] = [
        [-5.35, -23.45, 28.4, 0x00d4ff], [-19.35, -6.75, 33.9, 0xaa44ff],
        [16.15, 9.7, 27.0, 0xff44aa],    [4.2, 22.95, 24.5, 0x0099ff],
      ];
      edges.forEach(([cx, cz, len, col], i) => {
        const vert = i === 1 || i === 2;
        const g = new THREE.BoxGeometry(vert ? .12 : len, .12, vert ? len : .12);
        const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 2.2 }));
        m.position.set(cx, RH - .2, cz); scene.add(m);
      });

      // ── CYBERX sign (top wall) ───────────────────────────────────────────
      const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256;
      const cx2 = cv.getContext('2d')!;
      cx2.font = "bold 84px 'Courier New',monospace"; cx2.textAlign = 'center'; cx2.textBaseline = 'middle';
      for (let i = 5; i >= 1; i--) {
        cx2.shadowColor = '#00d4ff'; cx2.shadowBlur = i * 16;
        cx2.globalAlpha = i === 1 ? 1 : .3;
        cx2.fillStyle = i === 1 ? '#fff' : '#00d4ff';
        cx2.fillText('CYBERX ГОМЕЛЬ', 512, 128);
      }
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(14, 3.5),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true }),
      );
      sign.position.set(-5.35, 5.1, -23.25); scene.add(sign);
      const signLight = new THREE.PointLight(0x00d4ff, 5, 18);
      signLight.position.set(-5.35, 5, -22); scene.add(signLight);

      // ── Info panels on right wall (like plan legend) ─────────────────────
      INFO_PANELS.forEach(p => {
        const c = document.createElement('canvas'); c.width = 640; c.height = 400;
        const g = c.getContext('2d')!;
        g.fillStyle = '#05050f'; g.fillRect(0, 0, 640, 400);
        g.strokeStyle = p.color; g.lineWidth = 6; g.strokeRect(8, 8, 624, 384);
        g.textAlign = 'center';
        g.shadowColor = p.color; g.shadowBlur = 24;
        g.fillStyle = p.color; g.font = "bold 56px 'Courier New',monospace";
        g.fillText(p.title, 320, 96);
        g.shadowBlur = 0; g.fillStyle = '#ccd5e8'; g.font = "26px 'Courier New',monospace";
        p.lines.forEach((ln, i) => g.fillText(ln, 320, 170 + i * 44));
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(5.6, 3.5),
          new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true }),
        );
        mesh.position.set(8.42, 3.4, p.cz);
        mesh.rotation.y = -HP;
        scene.add(mesh);
        const pl = new THREE.PointLight(new THREE.Color(p.color).getHex(), 2.5, 8);
        pl.position.set(7.6, 3.4, p.cz); scene.add(pl);
      });

      // ── Neon ceiling tubes ───────────────────────────────────────────────
      const neonTube = (x: number, z: number, len: number, horizontal: boolean, col: number) => {
        const geo = new THREE.CylinderGeometry(.05, .05, len, 8);
        const mat = new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 3 });
        const m = new THREE.Mesh(geo, mat);
        m.rotation.z = horizontal ? HP : 0;
        if (!horizontal) m.rotation.x = HP;
        m.position.set(x, RH - .3, z);
        scene.add(m);
        const l = new THREE.PointLight(col, 3, 10); l.position.set(x, RH - 1, z); scene.add(l);
      };
      neonTube(-12, -13, 12, true,  0xaa44ff);   // STANDART hall
      neonTube(-13.6, 7.7, 9, true, 0x00cc55);   // кранштейны
      neonTube(-5.3, 14, 14, false, 0x0099ff);   // stage strip
      neonTube(4, 12, 18, false,    0x2255ff);   // lounge
      neonTube(13.5, 13.5, 7, false,0xff44aa);   // bar

      // ── Particles ────────────────────────────────────────────────────────
      const NP = 450;
      const pG = new THREE.BufferGeometry();
      const pP = new Float32Array(NP * 3), pV = new Float32Array(NP);
      for (let i = 0; i < NP; i++) {
        pP[i*3] = -20 + Math.random() * 36;
        pP[i*3+1] = Math.random() * RH;
        pP[i*3+2] = -24 + Math.random() * 47;
        pV[i] = .008 + Math.random() * .014;
      }
      pG.setAttribute('position', new THREE.BufferAttribute(pP, 3));
      scene.add(new THREE.Points(pG, new THREE.PointsMaterial({ color: 0x4488ff, size: .09, transparent: true, opacity: .55 })));

      // ── Zone CSS2D labels ────────────────────────────────────────────────
      const zoneLabel = (txt: string, x: number, z: number, col: string) => {
        const d = document.createElement('div');
        d.textContent = txt;
        d.style.cssText = `color:${col};font:bold 14px 'Courier New',monospace;letter-spacing:3px;pointer-events:none;text-shadow:0 0 12px ${col}`;
        const o = new CSS2DObject(d); o.position.set(x, 5, z); scene.add(o);
      };
      zoneLabel('STANDART', -12,   -13, '#aa44ff');
      zoneLabel('STAGE',    -4.6,   14, '#0099ff');
      zoneLabel('BOOTCAMP', -13.6,  8.7,'#00cc55');

      // ── Room labels ──────────────────────────────────────────────────────
      ROOM_LABELS.forEach(([txt, x, z, col]) => {
        const d = document.createElement('div');
        d.textContent = txt;
        d.style.cssText = `color:${col};font:bold 9px 'Courier New',monospace;letter-spacing:1.5px;pointer-events:none;opacity:.9;text-shadow:0 0 8px ${col}55;white-space:nowrap`;
        const o = new CSS2DObject(d); o.position.set(x, 2.6, z); scene.add(o);
      });

      // ── TVs (TV1, TV2, TV3) — wall screens ───────────────────────────────
      const tvData: [string, number, number, number][] = [
        ['TV1', -5.65, -1.0, 0], ['TV2', -15.4, -1.6, 0], ['TV3', -15.4, 3.4, 0],
      ];
      const tvMats: THREE.MeshStandardMaterial[] = [];
      tvData.forEach(([name, x, z]) => {
        const mat = new THREE.MeshStandardMaterial({ color: 0x001428, emissive: 0x0066cc, emissiveIntensity: 1.2 });
        tvMats.push(mat);
        const screen = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, .1), mat);
        screen.position.set(x, 2.6, z); scene.add(screen);
        const frame = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.6, .06),
          new THREE.MeshStandardMaterial({ color: 0x0a0a12, metalness: .8, roughness: .3 }));
        frame.position.set(x, 2.6, z - .03); scene.add(frame);
        const d = document.createElement('div');
        d.textContent = name;
        d.style.cssText = `color:#00aaff;font:bold 9px 'Courier New',monospace;letter-spacing:1px;pointer-events:none;text-shadow:0 0 8px #00aaff`;
        const o = new CSS2DObject(d); o.position.set(x, 3.7, z); scene.add(o);
      });

      // ── Admin desk ───────────────────────────────────────────────────────
      const desk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.1, 1.3),
        new THREE.MeshStandardMaterial({ color: 0x12121e, roughness: .4, metalness: .6 }));
      desk.position.set(4.9, .55, -.6); scene.add(desk);
      const deskGlow = new THREE.Mesh(new THREE.BoxGeometry(4.3, .08, 1.4),
        new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xffcc44, emissiveIntensity: 2 }));
      deskGlow.position.set(4.9, 1.12, -.6); scene.add(deskGlow);

      // ── Storage lockers (камера хранения) ────────────────────────────────
      for (let i = 0; i < 5; i++) {
        const lk = new THREE.Mesh(new THREE.BoxGeometry(.85, 2.2, .5),
          new THREE.MeshStandardMaterial({ color: 0x141424, roughness: .6, metalness: .5 }));
        lk.position.set(-2.65 + i * .92, 1.1, -3.25); scene.add(lk);
      }

      // ── Bar counter + stools ─────────────────────────────────────────────
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.15, 6.4),
        new THREE.MeshStandardMaterial({ color: 0x16101e, roughness: .35, metalness: .7 }));
      bar.position.set(11.85, .57, 13.5); scene.add(bar);
      const barGlow = new THREE.Mesh(new THREE.BoxGeometry(1.2, .07, 6.5),
        new THREE.MeshStandardMaterial({ color: 0xff44aa, emissive: 0xff44aa, emissiveIntensity: 2.4 }));
      barGlow.position.set(11.85, 1.18, 13.5); scene.add(barGlow);
      [10.8, 12.2, 13.6, 15.0, 16.4].forEach(z => {
        const stool = new THREE.Mesh(new THREE.CylinderGeometry(.3, .25, .65, 12),
          new THREE.MeshStandardMaterial({ color: 0x1a1424, roughness: .5, metalness: .6 }));
        stool.position.set(13.3, .33, z); scene.add(stool);
      });

      // ── Lounge tables ────────────────────────────────────────────────────
      TABLES.forEach(([x, z]) => {
        const t = new THREE.Mesh(new THREE.BoxGeometry(1.7, .72, 3.0),
          new THREE.MeshStandardMaterial({ color: 0xc8ccdd, emissive: 0x666a88, emissiveIntensity: .25, roughness: .4 }));
        t.position.set(x, .36, z); scene.add(t);
      });

      // ── Entrance (ВХОД) ──────────────────────────────────────────────────
      const door = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 3.4),
        new THREE.MeshStandardMaterial({ color: 0x00ff66, emissive: 0x00ff66, emissiveIntensity: .9, transparent: true, opacity: .3, side: THREE.DoubleSide }));
      door.position.set(14.75, 1.7, -3.6); scene.add(door);
      const doorLight = new THREE.PointLight(0x00ff66, 4, 10);
      doorLight.position.set(14.75, 2.5, -2.8); scene.add(doorLight);
      const dLbl = document.createElement('div');
      dLbl.textContent = 'ВХОД';
      dLbl.style.cssText = `color:#00ff66;font:bold 12px 'Courier New',monospace;letter-spacing:3px;pointer-events:none;text-shadow:0 0 12px #00ff66`;
      const dObj = new CSS2DObject(dLbl); dObj.position.set(14.75, 4, -3.6); scene.add(dObj);

      // ── PC stations ──────────────────────────────────────────────────────
      const hitMeshes: THREE.Mesh[] = [];
      const rgbMats: THREE.MeshStandardMaterial[] = [];
      const monMats: THREE.MeshStandardMaterial[] = [];
      const labelDivs: HTMLDivElement[] = [];
      const numToIdx = new Map<number, number>();

      PCS.forEach((pc, idx) => {
        const zd = ZONES[pc.z];
        const grp = new THREE.Group();
        grp.position.set(pc.x, 0, pc.z3);
        grp.rotation.y = pc.ry;

        const desk2 = new THREE.Mesh(new THREE.BoxGeometry(1.7, .06, 1),
          new THREE.MeshStandardMaterial({ color: 0x111118, roughness: .5, metalness: .7 }));
        desk2.position.y = .8;

        const monMat = new THREE.MeshStandardMaterial({ color: 0x050510, roughness: .3, metalness: .8, emissive: zd.emissive, emissiveIntensity: 1.6 });
        monMats.push(monMat);
        const mon = new THREE.Mesh(new THREE.BoxGeometry(1.3, .74, .06), monMat);
        mon.position.set(0, 1.34, .08);

        const stand = new THREE.Mesh(new THREE.BoxGeometry(.08, .48, .08),
          new THREE.MeshStandardMaterial({ color: 0x1a1a2a }));
        stand.position.set(0, .97, .16);

        const rgbMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1.6 });
        rgbMats.push(rgbMat);
        const rgb = new THREE.Mesh(new THREE.BoxGeometry(1.25, .06, .03), rgbMat);
        rgb.position.set(0, .8, -.48);

        // chair
        const seat = new THREE.Mesh(new THREE.CylinderGeometry(.28, .24, .1, 12),
          new THREE.MeshStandardMaterial({ color: 0x0c0c16, roughness: .6 }));
        seat.position.set(0, .55, -.85);
        const back = new THREE.Mesh(new THREE.BoxGeometry(.5, .62, .08),
          new THREE.MeshStandardMaterial({ color: 0x0c0c16, roughness: .6, emissive: zd.emissive, emissiveIntensity: .3 }));
        back.position.set(0, .95, -1.1);

        const numDiv = document.createElement('div');
        numDiv.textContent = String(pc.id);
        numDiv.style.cssText = `background:rgba(0,4,20,.9);border:1px solid ${zd.css}66;color:${zd.css};padding:1px 5px;font-size:9px;border-radius:3px;pointer-events:none;white-space:nowrap;font-family:'Courier New',monospace;font-weight:bold`;
        labelDivs.push(numDiv);
        const label = new CSS2DObject(numDiv);
        label.position.set(0, 1.85, 0);
        grp.add(label);

        grp.add(desk2, mon, stand, rgb, seat, back);
        scene.add(grp);

        const hit = new THREE.Mesh(new THREE.BoxGeometry(1.9, 2, 2.2),
          new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }));
        hit.position.set(pc.x, 1, pc.z3);
        hit.userData = { idx };
        scene.add(hit);
        hitMeshes.push(hit);
        numToIdx.set(pc.id, idx);
      });

      // ── Live status updates from backend ────────────────────────────────
      applyRef.current = (data: Pc[]) => {
        data.forEach(p => {
          const idx = numToIdx.get(p.number);
          if (idx === undefined) return;
          const zd = ZONES[PCS[idx].z];
          monMats[idx].emissive.setHex(p.status === 'free' ? zd.emissive : (STATUS_EMISSIVE[p.status] ?? zd.emissive));
          const col = p.status === 'free' ? zd.css : (STATUS_CSS[p.status] || zd.css);
          labelDivs[idx].style.color = col;
          labelDivs[idx].style.borderColor = `${col}66`;
        });
      };
      // apply any data already loaded before scene init
      if (Object.keys(statusRef.current).length > 0) {
        pcApi.getAll().then(d => applyRef.current?.(d)).catch(() => {});
      }

      // ── Tooltip ──────────────────────────────────────────────────────────
      const tooltip = document.createElement('div');
      tooltip.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);background:rgba(0,4,18,.97);border:1px solid #00d4ff;color:#00d4ff;padding:7px 16px;font-size:11px;border-radius:6px;display:none;pointer-events:none;z-index:500;font-family:"Courier New",monospace;white-space:nowrap';
      document.body.appendChild(tooltip);

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const getIdx = (e: MouseEvent) => {
        const r = renderer.domElement.getBoundingClientRect();
        mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(mouse, camera);
        const h = raycaster.intersectObjects(hitMeshes);
        return h.length > 0 ? (h[0].object.userData.idx as number) : -1;
      };

      const onMove = (e: MouseEvent) => {
        const i = getIdx(e);
        if (i >= 0) {
          const pc = PCS[i]; const z = ZONES[pc.z];
          const st = statusRef.current[pc.id] ?? 'free';
          tooltip.textContent = `ПК #${pc.id} | ${pc.z} | ${z.specs} | ${z.price} | ${STATUS_RU[st] ?? st}`;
          tooltip.style.display = 'block';
          renderer.domElement.style.cursor = 'pointer';
        } else {
          tooltip.style.display = 'none';
          renderer.domElement.style.cursor = 'grab';
        }
      };

      const onClick = (e: MouseEvent) => {
        const i = getIdx(e);
        if (i < 0) return;
        setSelNum(PCS[i].id);
      };

      renderer.domElement.addEventListener('mousemove', onMove);
      renderer.domElement.addEventListener('click', onClick);

      // ── Animation ────────────────────────────────────────────────────────
      const clock = new THREE.Clock();
      const tick = () => {
        frameId = requestAnimationFrame(tick);
        const t = clock.getElapsedTime();
        lStage.intensity = 9 + Math.sin(t * 1.3) * 2.5;
        lStd.intensity   = 9 + Math.sin(t * 1.7 + 1) * 2.5;
        lBoot.intensity  = 7 + Math.sin(t * 1.1 + 2) * 2;
        lBar.intensity   = 7 + Math.sin(t * 2.1 + 3) * 2;
        rgbMats.forEach((m, i) => {
          const h = ((t * 50 + i * 8) % 360) / 360;
          m.color.setHSL(h, .9, .4); m.emissive.setHSL(h, .9, .4);
        });
        tvMats.forEach((m, i) => { m.emissiveIntensity = 1 + Math.sin(t * 3 + i * 2) * .35; });
        for (let i = 0; i < NP; i++) {
          pP[i*3+1] += pV[i];
          if (pP[i*3+1] > RH) { pP[i*3+1] = 0; pP[i*3] = -20 + Math.random() * 36; pP[i*3+2] = -24 + Math.random() * 47; }
        }
        (pG.attributes['position'] as THREE.BufferAttribute).needsUpdate = true;
        ctrl.update();
        renderer.render(scene, camera);
        css2r.render(scene, camera);
      };
      tick();

      // ── Resize / cleanup ─────────────────────────────────────────────────
      const onResize = () => {
        const w = mount.clientWidth || window.innerWidth;
        const h = mount.clientHeight || window.innerHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h); css2r.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener('resize', onResize);
        renderer.domElement.removeEventListener('mousemove', onMove);
        renderer.domElement.removeEventListener('click', onClick);
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
        if (css2dEl.contains(css2r.domElement)) css2dEl.removeChild(css2r.domElement);
        try { document.body.removeChild(tooltip); } catch { /* already removed */ }
      };

    } catch (err) {
      console.error('[ThreeClub init error]', err);
      setInitErr(err instanceof Error ? err.message : String(err));
      cancelAnimationFrame(frameId);
    }
  }, []);

  if (initErr) {
    return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    height:'100vh', background:'#060612', color:'#fff', fontFamily:'monospace', padding:32, textAlign:'center' }}>
        <div style={{ fontSize:12, color:'#ef4444', marginBottom:12 }}>Ошибка инициализации 3D сцены</div>
        <pre style={{ fontSize:10, color:'#6b7280', maxWidth:600, whiteSpace:'pre-wrap' }}>{initErr}</pre>
        <Link to="/" style={{ marginTop:20, color:'#22d3ee', fontSize:12 }}>← На главную</Link>
      </div>
    );
  }

  const selPc   = selNum != null ? pcMap[selNum] : null;
  const selMeta = selNum != null ? PCS.find(p => p.id === selNum) : null;
  const selZone = selMeta ? ZONES[selMeta.z] : null;
  const price   = selPc ? selPc.hourlyRate * hours : 0;
  const canBook = !!user && !!selPc && selPc.status === 'free' && (balance ?? 0) >= price;

  return (
    <div style={{ position:'relative', width:'100vw', height:'100vh', overflow:'hidden', background:'#020310' }}>
      <div ref={mountRef}  style={{ position:'absolute', inset:0 }} />
      <div ref={css2dRef}  style={{ position:'absolute', inset:0, pointerEvents:'none' }} />
      <Link to="/" style={{ position:'absolute', top:12, left:12, zIndex:500, background:'rgba(2,3,20,.94)', border:'1px solid rgba(100,0,200,.5)', color:'#cc00ff', padding:'6px 14px', fontSize:10, borderRadius:5, textDecoration:'none', fontFamily:"'Courier New',monospace", letterSpacing:'1px' }}>
        ← НАЗАД
      </Link>

      {/* Account HUD */}
      <div style={{ position:'absolute', top:48, left:12, zIndex:500, background:'rgba(2,3,20,.92)', border:'1px solid rgba(0,200,255,.25)', borderRadius:8, padding:'8px 14px', fontFamily:"'Courier New',monospace", fontSize:10, letterSpacing:'1px' }}>
        {user ? (
          <>
            <div style={{ color:'#8899bb', marginBottom:3 }}>{user.username}</div>
            <div style={{ color:'#22d3ee', fontWeight:'bold', fontSize:13 }}>{balance != null ? balance.toFixed(2) : '...'} BYN</div>
          </>
        ) : (
          <Link to="/login" style={{ color:'#eab308', textDecoration:'none' }}>ВОЙТИ ДЛЯ БРОНИ →</Link>
        )}
      </div>

      {/* Legend */}
      <div style={{ position:'absolute', top:12, right:12, zIndex:500, background:'rgba(2,3,20,.92)', border:'1px solid rgba(0,180,255,.25)', borderRadius:8, padding:'10px 14px', fontFamily:"'Courier New',monospace", fontSize:9, letterSpacing:'1px', pointerEvents:'none' }}>
        <div style={{ color:'#0099ff', marginBottom:4 }}>■ STAGE · 1–10 · RTX 4070 Ti</div>
        <div style={{ color:'#00cc55', marginBottom:4 }}>■ BOOTCAMP · 11–15 · RTX 4070</div>
        <div style={{ color:'#aa44ff', marginBottom:8 }}>■ STANDART · 16–45 · RTX 4060</div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,.08)', paddingTop:8 }}>
          <div style={{ color:'#22c55e', marginBottom:3 }}>● Свободно</div>
          <div style={{ color:'#eab308', marginBottom:3 }}>● Забронирован</div>
          <div style={{ color:'#ef4444', marginBottom:3 }}>● Занят</div>
          <div style={{ color:'#6b7280' }}>● Сервис</div>
        </div>
      </div>

      <div style={{ position:'absolute', bottom:14, left:'50%', transform:'translateX(-50%)', background:'rgba(0,3,16,.8)', border:'1px solid rgba(0,200,255,.2)', color:'rgba(0,200,255,.5)', padding:'5px 18px', fontSize:9, borderRadius:16, pointerEvents:'none', letterSpacing:'1px', fontFamily:"'Courier New',monospace", zIndex:200, whiteSpace:'nowrap' }}>
        КОЛЕСО — ZOOM · ТЯГА — ВРАЩЕНИЕ · КЛИК — БРОНЬ
      </div>

      {/* ── Booking modal (live, account-bound) ── */}
      {selNum != null && selMeta && selZone && (
        <div onClick={e => { if (e.target === e.currentTarget) closeModal(); }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,12,.82)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:600, backdropFilter:'blur(5px)' }}>
          <div style={{ background:'rgba(4,4,22,.99)', border:'1px solid #00d4ff', padding:'28px 32px', borderRadius:12, maxWidth:400, width:'92%', fontFamily:"'Courier New',monospace", boxShadow:'0 0 60px rgba(0,200,255,.35)' }}>

            <div style={{ textAlign:'center', marginBottom:18 }}>
              <div style={{ fontSize:18, fontWeight:'bold', color:'#fff', letterSpacing:3, marginBottom:4 }}>ПК #{selNum}</div>
              <div style={{ fontSize:11, color:selZone.css, fontWeight:'bold', letterSpacing:2, marginBottom:6 }}>{selMeta.z}</div>
              <div style={{ fontSize:10, color:'#8899bb' }}>{selZone.specs}</div>
            </div>

            {selPc ? (
              <>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid rgba(255,255,255,.07)', fontSize:11 }}>
                  <span style={{ color:'#8899bb' }}>Статус</span>
                  <span style={{ color: selPc.status === 'free' ? '#22c55e' : (STATUS_CSS[selPc.status] || '#fff'), fontWeight:'bold' }}>
                    {STATUS_RU[selPc.status] ?? selPc.status}
                  </span>
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid rgba(255,255,255,.07)', fontSize:11 }}>
                  <span style={{ color:'#8899bb' }}>Тариф</span>
                  <span style={{ color:'#22d3ee', fontWeight:'bold' }}>{selPc.hourlyRate} BYN/ч</span>
                </div>

                {!user && (
                  <div style={{ textAlign:'center', marginTop:18 }}>
                    <div style={{ fontSize:11, color:'#eab308', marginBottom:12 }}>Для бронирования войдите в аккаунт</div>
                    <Link to="/login" style={{ display:'inline-block', padding:'9px 26px', borderRadius:6, background:'linear-gradient(135deg,#b45309,#eab308)', color:'#000', fontWeight:'bold', fontSize:10, letterSpacing:2, textDecoration:'none', textTransform:'uppercase' }}>
                      Войти
                    </Link>
                  </div>
                )}

                {user && selPc.status !== 'free' && !msg && (
                  <div style={{ textAlign:'center', marginTop:18, fontSize:11, color:'#ef4444' }}>
                    ПК сейчас недоступен для бронирования
                  </div>
                )}

                {user && selPc.status === 'free' && (
                  <>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderTop:'1px solid rgba(255,255,255,.07)', fontSize:11 }}>
                      <span style={{ color:'#8899bb' }}>Длительность</span>
                      <select value={hours} onChange={e => setHours(Number(e.target.value))} disabled={busy}
                        style={{ background:'#0a0a1a', border:'1px solid rgba(0,200,255,.3)', color:'#fff', padding:'4px 10px', borderRadius:5, fontFamily:'inherit', fontSize:11 }}>
                        {[1,2,3,4,6,8].map(h => <option key={h} value={h}>{h} ч</option>)}
                      </select>
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid rgba(255,255,255,.07)', fontSize:12 }}>
                      <span style={{ color:'#8899bb' }}>Итого</span>
                      <span style={{ color:'#00ff88', fontWeight:'bold', fontSize:15 }}>{price.toFixed(2)} BYN</span>
                    </div>
                    {balance != null && (
                      <div style={{ fontSize:10, color: balance >= price ? '#8899bb' : '#ef4444', textAlign:'right', marginBottom:6 }}>
                        Баланс: {balance.toFixed(2)} BYN {balance < price && '— недостаточно'}
                      </div>
                    )}
                  </>
                )}

                {msg && (
                  <div style={{ textAlign:'center', margin:'14px 0 4px', fontSize:11, color: msg.ok ? '#00ff88' : '#ef4444', lineHeight:1.6 }}>
                    {msg.text}
                  </div>
                )}

                <div style={{ display:'flex', gap:10, justifyContent:'center', marginTop:18 }}>
                  {user && selPc.status === 'free' && !msg?.ok && (
                    <button onClick={confirmBooking} disabled={busy || !canBook}
                      style={{ padding:'9px 22px', border:'none', cursor: canBook ? 'pointer' : 'not-allowed', borderRadius:6, fontFamily:'inherit', fontSize:10, textTransform:'uppercase', letterSpacing:1.5, fontWeight:'bold', background: canBook ? 'linear-gradient(135deg,#5500bb,#8800ff)' : '#1a1a2e', color: canBook ? '#fff' : '#555', boxShadow: canBook ? '0 0 16px rgba(130,0,255,.4)' : 'none' }}>
                      {busy ? 'Бронируем...' : 'Забронировать'}
                    </button>
                  )}
                  <button onClick={closeModal}
                    style={{ padding:'9px 22px', background:'transparent', color:'#666', border:'1px solid #333', borderRadius:6, cursor:'pointer', fontFamily:'inherit', fontSize:10, textTransform:'uppercase', letterSpacing:1.5 }}>
                    {msg?.ok ? 'Закрыть' : 'Отмена'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign:'center', fontSize:11, color:'#8899bb', padding:'10px 0' }}>
                Загрузка данных...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Exported wrapper ───────────────────────────────────────────────────────
export function ThreeClub() {
  return (
    <SceneErrorBoundary>
      <ThreeScene />
    </SceneErrorBoundary>
  );
}
