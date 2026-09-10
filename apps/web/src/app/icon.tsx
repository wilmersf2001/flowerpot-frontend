import { ImageResponse } from "next/og";

/**
 * Favicon generado: cuadrado lima con las "barras" del isotipo de Flowerpot.
 * Reemplaza al `favicon.ico` de arranque de Next. Cuando exista el ícono
 * oficial, cambiar este archivo por un `icon.png` (o `favicon.ico`).
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 3,
          background: "#c8f751",
          borderRadius: 6,
        }}
      >
        {[10, 16, 16, 10].map((h, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              width: 3,
              height: h,
              borderRadius: 2,
              background: "#17190f",
            }}
          />
        ))}
      </div>
    ),
    { ...size },
  );
}
