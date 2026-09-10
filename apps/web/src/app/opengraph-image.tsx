import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

/**
 * Imagen que se ve al compartir el enlace del sitio (WhatsApp, Facebook,
 * LinkedIn, X, Slack…). Generada por código con la dirección "Iron & Lime":
 * grafito casi negro + lima eléctrico.
 *
 * Es una imagen "de sistema" válida para el lanzamiento. Cuando exista el
 * arte definitivo de marca, se reemplaza este archivo por un
 * `opengraph-image.png` (1200×630) y Next lo toma automáticamente.
 *
 * Nota: `next/og` (satori) solo soporta flexbox y un subconjunto de CSS.
 * Nada de `grid`.
 */

export const alt = "Flowerpot — Software de gestión para gimnasios en Perú";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GRAPHITE = "#17190f";
const GRAPHITE_SOFT = "#20231a";
const LIME = "#c8f751";
const FOREGROUND = "#f3f4ec";
const MUTED = "#a7ab9b";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: GRAPHITE,
          padding: "72px 80px",
          borderLeft: `16px solid ${LIME}`,
          fontFamily: "sans-serif",
        }}
      >
        {/* Marca */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: LIME,
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {[22, 34, 34, 22].map((h, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  width: 6,
                  height: h,
                  borderRadius: 3,
                  background: GRAPHITE,
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              fontWeight: 800,
              color: FOREGROUND,
              letterSpacing: -0.5,
            }}
          >
            Flowerpot
          </div>
        </div>

        {/* Titular */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 4,
              color: LIME,
            }}
          >
            Software de gestión para gimnasios · Perú
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.05,
              color: FOREGROUND,
              letterSpacing: -2,
            }}
          >
            Tu gimnasio en su mejor forma
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: MUTED,
              lineHeight: 1.35,
            }}
          >
            Socios, membresías, cobros y control de acceso en una sola
            plataforma. Multi-sede, datos cifrados y soporte 24/7.
          </div>
        </div>

        {/* Pie */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: MUTED,
            borderTop: `2px solid ${GRAPHITE_SOFT}`,
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", color: FOREGROUND }}>
            {SITE_URL.replace(/^https?:\/\//, "")}
          </div>
          <div style={{ display: "flex" }}>14 días gratis · sin tarjeta</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
