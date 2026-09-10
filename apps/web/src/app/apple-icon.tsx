import { ImageResponse } from "next/og";

/**
 * Ícono para "Agregar a inicio" en iOS. Mismo isotipo que el favicon, a
 * 180×180 y con más aire. Reemplazar por `apple-icon.png` cuando haya arte.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: "#17190f",
        }}
      >
        {[54, 84, 84, 54].map((h, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              width: 14,
              height: h,
              borderRadius: 7,
              background: "#c8f751",
            }}
          />
        ))}
      </div>
    ),
    { ...size },
  );
}
