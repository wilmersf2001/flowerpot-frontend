"use client";

import { useEffect, useRef } from "react";

/**
 * Fondo del login: una red de líneas irregulares (quebradas, como rayos) por
 * la que viajan pulsos de energía. Responde al cursor: las líneas cercanas se
 * encienden, un arco eléctrico une el puntero con los nodos más próximos y el
 * clic dispara una ráfaga. Respeta `prefers-reduced-motion` (dibuja estático).
 */

type Pt = { x: number; y: number };
type Edge = {
  a: number;
  b: number;
  pts: Pt[];
  cum: number[];
  len: number;
  /** Desplazamientos normalizados (estables entre resizes). */
  jitter: number[];
};
type Pulse = {
  edge: Edge;
  forward: boolean;
  d: number;
  speed: number;
  hops: number;
};
type Ring = { x: number; y: number; r: number; life: number };

// PRNG determinista: la red se ve igual en cada carga y en cada resize.
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NODE_COUNT = 22;
const TRAIL = 110;

export function LoginBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rand = mulberry32(20260);

    // Nodos en coordenadas normalizadas, con algo de orden para no amontonarse.
    const norm: Pt[] = [];
    while (norm.length < NODE_COUNT) {
      const p = { x: rand(), y: rand() };
      if (norm.every((q) => Math.hypot(q.x - p.x, q.y - p.y) > 0.13)) norm.push(p);
    }

    // Aristas: cada nodo con sus 2 vecinos más cercanos (sin duplicar).
    const pairs = new Set<string>();
    const edgePairs: [number, number][] = [];
    norm.forEach((p, i) => {
      norm
        .map((q, j) => ({ j, d: Math.hypot(q.x - p.x, q.y - p.y) }))
        .filter((o) => o.j !== i)
        .sort((m, n) => m.d - n.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!pairs.has(key)) {
            pairs.add(key);
            edgePairs.push([i, j]);
          }
        });
    });

    const jitters = edgePairs.map(() =>
      Array.from({ length: 6 }, () => rand() - 0.5),
    );

    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes: Pt[] = [];
    let edges: Edge[] = [];
    let adj: { edge: Edge; forward: boolean }[][] = [];

    const build = () => {
      nodes = norm.map((p) => ({ x: p.x * w, y: p.y * h }));
      edges = edgePairs.map(([a, b], k) => {
        const A = nodes[a]!;
        const B = nodes[b]!;
        const dx = B.x - A.x;
        const dy = B.y - A.y;
        const L = Math.hypot(dx, dy) || 1;
        const nx = -dy / L;
        const ny = dx / L;
        const jitter = jitters[k]!;
        const segs = 4 + (k % 3);
        const pts: Pt[] = [A];
        for (let i = 1; i < segs; i++) {
          const t = i / segs;
          const off = jitter[i]! * L * 0.32;
          pts.push({ x: A.x + dx * t + nx * off, y: A.y + dy * t + ny * off });
        }
        pts.push(B);
        const cum = [0];
        for (let i = 1; i < pts.length; i++) {
          cum.push(
            cum[i - 1]! +
              Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y),
          );
        }
        return { a, b, pts, cum, len: cum[cum.length - 1]!, jitter };
      });
      adj = nodes.map(() => []);
      edges.forEach((e) => {
        adj[e.a]!.push({ edge: e, forward: true });
        adj[e.b]!.push({ edge: e, forward: false });
      });
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    // Color de marca desde el tema (cambia entre claro/oscuro).
    let color = "#a3e635";
    const readColor = () => {
      const v = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary")
        .trim();
      if (v) color = v;
    };
    readColor();
    const mo = new MutationObserver(readColor);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme", "style"],
    });

    const pointer = { x: -9999, y: -9999, active: false };
    const flash: number[] = nodes.map(() => 0);
    const pulses: Pulse[] = [];
    const rings: Ring[] = [];

    const spawn = (edge: Edge, forward: boolean, hops = 3): void => {
      pulses.push({
        edge,
        forward,
        d: 0,
        speed: 260 + rand() * 260,
        hops,
      });
    };
    const spawnRandom = () => {
      const e = edges[Math.floor(rand() * edges.length)];
      if (e) spawn(e, rand() > 0.5, 2 + Math.floor(rand() * 4));
    };

    const nearestNodes = (x: number, y: number, n: number) =>
      nodes
        .map((p, i) => ({ i, d: Math.hypot(p.x - x, p.y - y) }))
        .sort((m, k) => m.d - k.d)
        .slice(0, n);

    // Recorre el tramo [d0, d1] de una arista (en el sentido dado) y lo traza.
    const strokeSpan = (e: Edge, forward: boolean, d0: number, d1: number) => {
      const lo = Math.max(0, Math.min(d0, d1));
      const hi = Math.min(e.len, Math.max(d0, d1));
      if (hi <= lo) return null;
      const pts = e.pts;
      const cum = e.cum;
      const at = (s: number): Pt => {
        const dist = forward ? s : e.len - s;
        let i = 1;
        while (i < cum.length - 1 && cum[i]! < dist) i++;
        const t = (dist - cum[i - 1]!) / (cum[i]! - cum[i - 1]! || 1);
        return {
          x: pts[i - 1]!.x + (pts[i]!.x - pts[i - 1]!.x) * t,
          y: pts[i - 1]!.y + (pts[i]!.y - pts[i - 1]!.y) * t,
        };
      };
      const head = at(hi);
      ctx.beginPath();
      const start = at(lo);
      ctx.moveTo(start.x, start.y);
      // vértices intermedios
      const mids: number[] = [];
      cum.forEach((c) => {
        const s = forward ? c : e.len - c;
        if (s > lo && s < hi) mids.push(s);
      });
      mids.sort((m, k) => m - k);
      mids.forEach((s) => {
        const p = at(s);
        ctx.lineTo(p.x, p.y);
      });
      ctx.lineTo(head.x, head.y);
      ctx.stroke();
      return head;
    };

    // Arco eléctrico (rayo) con vértices aleatorios entre dos puntos.
    const bolt = (x1: number, y1: number, x2: number, y2: number, amp: number) => {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const L = Math.hypot(dx, dy) || 1;
      const nx = -dy / L;
      const ny = dx / L;
      const n = Math.max(3, Math.round(L / 28));
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const o = (Math.random() - 0.5) * amp;
        ctx.lineTo(x1 + dx * t + nx * o, y1 + dy * t + ny * o);
      }
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    let raf = 0;
    let last = performance.now();
    let spawnIn = 0;

    // Estado del login (lo emite el formulario): carga continua de rayos
    // desde la tarjeta mientras se autentica, y destello al entrar.
    let busy = false;
    let successFx = 0;
    let boltTimer = 0;
    let boltTargets: number[] = [];
    const cardCenter = (): Pt | null => {
      const card = document.querySelector(".login-card");
      if (!card) return null;
      const c = card.getBoundingClientRect();
      const r = canvas.getBoundingClientRect();
      return { x: c.left + c.width / 2 - r.left, y: c.top + c.height / 2 - r.top };
    };
    const onState = (ev: Event) => {
      const state = (ev as CustomEvent<string>).detail;
      busy = state === "loading";
      if (state === "loading") boltTimer = 0;
      if (state === "success" && !reduced) {
        successFx = 1;
        const c = cardCenter();
        if (c) {
          for (let k = 0; k < 3; k++) rings.push({ x: c.x, y: c.y, r: k * -90, life: 1 });
        }
        nodes.forEach((_, i) => {
          flash[i] = 1;
          adj[i]!.forEach(({ edge, forward }) => spawn(edge, forward, 4));
        });
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;

      // 1) Red base: tenue, más viva cerca del cursor.
      ctx.shadowBlur = 0;
      ctx.lineWidth = 1;
      for (const e of edges) {
        let near = 0;
        if (pointer.active) {
          for (const p of e.pts) {
            const d = Math.hypot(p.x - pointer.x, p.y - pointer.y);
            near = Math.max(near, 1 - d / 220);
          }
        }
        ctx.globalAlpha = 0.1 + Math.max(0, near) * 0.5;
        ctx.beginPath();
        e.pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.stroke();
      }

      // 2) Nodos (con destello cuando un pulso llega).
      nodes.forEach((p, i) => {
        flash[i] = Math.max(0, (flash[i] ?? 0) - dt * 2.2);
        const f = flash[i] ?? 0;
        let near = 0;
        if (pointer.active) {
          near = Math.max(0, 1 - Math.hypot(p.x - pointer.x, p.y - pointer.y) / 200);
        }
        ctx.globalAlpha = 0.25 + f * 0.75 + near * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 + f * 3 + near * 2, 0, Math.PI * 2);
        ctx.fill();
        if (f > 0.05) {
          ctx.globalAlpha = f * 0.35;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6 + (1 - f) * 22, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      if (!reduced) {
        // 3) Pulsos viajando por la red.
        spawnIn -= dt;
        if (spawnIn <= 0 && pulses.length < (busy ? 34 : 14)) {
          spawnRandom();
          spawnIn = busy ? 0.05 + rand() * 0.08 : 0.35 + rand() * 0.6;
        }
        ctx.shadowColor = color;
        for (let i = pulses.length - 1; i >= 0; i--) {
          const p = pulses[i]!;
          p.d += p.speed * dt;
          ctx.shadowBlur = 14;
          ctx.lineWidth = 2.2;
          ctx.globalAlpha = 0.95;
          const head = strokeSpan(p.edge, p.forward, p.d - TRAIL, p.d);
          // cola más tenue y fina
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = 0.35;
          strokeSpan(p.edge, p.forward, p.d - TRAIL * 2.2, p.d - TRAIL);
          if (head) {
            ctx.shadowBlur = 16;
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.arc(head.x, head.y, 2.6, 0, Math.PI * 2);
            ctx.fill();
          }
          if (p.d - TRAIL * 2.2 >= p.edge.len) {
            pulses.splice(i, 1);
            continue;
          }
          if (p.d >= p.edge.len && p.hops >= 0) {
            const nodeIdx = p.forward ? p.edge.b : p.edge.a;
            flash[nodeIdx] = 1;
            if (p.hops > 0) {
              const opts = adj[nodeIdx]!.filter((o) => o.edge !== p.edge);
              const pick = opts[Math.floor(rand() * opts.length)];
              if (pick) spawn(pick.edge, pick.forward, p.hops - 1);
            }
            p.hops = -1; // ya encadenó; solo termina de desvanecer su cola
          }
        }

        // 4) Arco eléctrico del cursor a los nodos cercanos.
        if (pointer.active) {
          ctx.shadowColor = color;
          const targets = nearestNodes(pointer.x, pointer.y, 3);
          targets.forEach(({ i, d }, k) => {
            if (d > 340) return;
            const strength = 1 - d / 340;
            ctx.shadowBlur = 12;
            ctx.lineWidth = 1.4 + strength;
            ctx.globalAlpha = (0.25 + strength * 0.65) * (k === 0 ? 1 : 0.6);
            bolt(pointer.x, pointer.y, nodes[i]!.x, nodes[i]!.y, 26 + d * 0.12);
            if (d < 120) flash[i] = Math.max(flash[i] ?? 0, 0.6);
          });
        }

        // 4b) Carga: rayos desde la tarjeta hacia nodos que cambian rápido.
        if (busy) {
          const c = cardCenter();
          if (c) {
            boltTimer -= dt;
            if (boltTimer <= 0 || boltTargets.length === 0) {
              boltTargets = Array.from({ length: 5 }, () =>
                Math.floor(rand() * nodes.length),
              );
              boltTimer = 0.14;
              boltTargets.forEach((i) => (flash[i] = 1));
            }
            ctx.shadowColor = color;
            boltTargets.forEach((i, k) => {
              const n = nodes[i]!;
              ctx.shadowBlur = 22;
              ctx.lineWidth = k === 0 ? 3 : 1.8;
              ctx.globalAlpha = k === 0 ? 1 : 0.75;
              bolt(c.x, c.y, n.x, n.y, 60);
            });
          }
        }

        // Destello de éxito: la pantalla se "carga" y se desvanece.
        if (successFx > 0) {
          successFx = Math.max(0, successFx - dt * 1.6);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = successFx * 0.22;
          ctx.fillRect(0, 0, w, h);
        }

        // 5) Ondas del clic.
        for (let i = rings.length - 1; i >= 0; i--) {
          const r = rings[i]!;
          r.life -= dt * 1.4;
          r.r += dt * 520;
          if (r.life <= 0) {
            rings.splice(i, 1);
            continue;
          }
          if (r.r <= 0) continue;
          ctx.shadowBlur = 10;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = r.life * 0.6;
          ctx.beginPath();
          ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };

    const onMove = (ev: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = ev.clientX - rect.left;
      pointer.y = ev.clientY - rect.top;
      pointer.active = true;
    };
    const onLeave = () => {
      pointer.active = false;
    };
    const onClick = (ev: PointerEvent) => {
      if (reduced) return;
      const rect = canvas.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      rings.push({ x, y, r: 0, life: 1 });
      nearestNodes(x, y, 4).forEach(({ i }) => {
        flash[i] = 1;
        adj[i]!.forEach(({ edge, forward }) => spawn(edge, forward, 3));
      });
    };

    resize();
    flash.length = nodes.length;
    flash.fill(0);
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerdown", onClick);
    window.addEventListener("login:state", onState);
    document.addEventListener("pointerleave", onLeave);

    if (reduced) {
      frame(performance.now());
      cancelAnimationFrame(raf);
    } else {
      for (let i = 0; i < 5; i++) spawnRandom();
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      mo.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("login:state", onState);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 size-full"
    />
  );
}
