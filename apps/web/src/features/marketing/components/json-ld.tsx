/**
 * Inserta uno o varios bloques de datos estructurados (schema.org) como
 * `<script type="application/ld+json">`. Server Component: el JSON se
 * renderiza en el HTML inicial, que es lo que leen Google y los bots.
 *
 * El `.replace(/</g, "\\u003c")` neutraliza cualquier `<` dentro de los datos
 * (defensa anti-XSS recomendada por la doc de Next para JSON-LD).
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Record<string, unknown>[];
}) {
  const blocks = Array.isArray(data) ? data : [data];

  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
