import { MOTTO_WORDS } from "../lib/marketing.content";

/**
 * Cinta de lema que corre sin parar entre el hero y el producto. Se duplica la
 * lista para que el bucle (-50%) sea continuo; pausa al pasar el cursor.
 */
export function MottoTicker() {
  const items = [...MOTTO_WORDS, ...MOTTO_WORDS];
  return (
    <div
      className="fp-marquee-wrap overflow-hidden border-b border-border bg-primary py-3 text-primary-foreground"
      aria-hidden
    >
      <div className="fp-marquee flex w-max items-center">
        {items.map((word, i) => (
          <span
            key={i}
            className="display-heading flex items-center text-xl sm:text-2xl"
          >
            <span className="px-6">{word}</span>
            <span className="text-base opacity-60">▲</span>
          </span>
        ))}
      </div>
    </div>
  );
}
