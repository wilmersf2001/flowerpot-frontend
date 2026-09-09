import Image, { type ImageProps } from "next/image";

/**
 * Imagen de PRUEBA con URL determinista (mismo `seed` -> misma foto).
 *
 * Único punto donde la landing decide de dónde salen las imágenes. Cuando
 * lleguen los assets oficiales de Flowerpot, basta cambiar esta implementación
 * (p. ej. a `/public/marketing/<seed>.jpg`) sin tocar las secciones.
 */
export function PlaceholderImage({
  seed,
  width,
  height,
  alt,
  className,
  priority,
  sizes,
}: {
  seed: string;
  width: number;
  height: number;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: ImageProps["sizes"];
}) {
  const src = `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
    />
  );
}
