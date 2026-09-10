/**
 * Contenido de la página /seguridad.
 *
 * ⚠️ DATOS DE PRUEBA (MOCK) en lo que toca a afirmaciones concretas
 * (respaldos, retención, tipo de cifrado, auditoría). Antes de publicar hay
 * que confirmar cada punto con quien implementa el backend y con legal, y
 * bajar el tono de lo que todavía no esté 100% implementado.
 *
 * Objetivo de la página: explicar en cristiano por qué los datos del gimnasio
 * están seguros, con un contraste claro frente a "cuaderno / Excel / WhatsApp".
 * El concepto central es el AISLAMIENTO POR GIMNASIO (multi-tenant).
 */
import {
  DatabaseZap,
  FileLock2,
  KeyRound,
  Lock,
  ScrollText,
  Users,
} from "lucide-react";
import type { SecurityPoint } from "./marketing.types";

export const SECURITY_INTRO = {
  eyebrow: "Seguridad",
  title: "Tu gimnasio vive en su propio espacio cerrado",
  description:
    "La información de tus socios, tus cobros y tus reportes es tu activo más valioso. Acá te explicamos, sin tecnicismos, cómo la cuidamos y por qué ningún otro gimnasio puede verla.",
} as const;

/**
 * Bloque estrella: el aislamiento entre gimnasios (tenants) contado con una
 * analogía y tres pasos concretos.
 */
export const ISOLATION = {
  eyebrow: "Aislamiento por gimnasio",
  title: "Cada gimnasio es un inquilino con su propia llave",
  analogyTitle: "La forma fácil de entenderlo",
  analogy:
    "Imagina un edificio de departamentos. Todos comparten la estructura, el ascensor y la seguridad de la puerta principal, pero cada departamento tiene su propia llave y nadie entra al tuyo. En Flowerpot, tu gimnasio es tu departamento: los datos viven adentro y solo tu equipo tiene la llave.",
  steps: [
    {
      title: "Tu espacio se crea aislado desde el día uno",
      description:
        "Al abrir tu cuenta, Flowerpot genera un espacio de datos propio para tu gimnasio (lo llamamos 'tenant'). No es una carpeta dentro de un montón compartido: es tu compartimento.",
    },
    {
      title: "Cada consulta lleva la marca de tu gimnasio",
      description:
        "Cuando recepción busca un socio o tú abres un reporte, el sistema exige internamente el identificador de tu gimnasio. Una consulta sin esa marca no devuelve nada: es imposible que te aparezca un socio de otro negocio.",
    },
    {
      title: "Ni por error ni a propósito se cruzan los datos",
      description:
        "El aislamiento no depende de que un programador se acuerde de filtrar. Está en la capa de acceso a datos: aunque alguien se equivoque escribiendo una consulta, el otro gimnasio sigue sin ser visible.",
    },
  ],
  // Diagrama en CSS dentro del componente (tres cajas que no se tocan).
  // 📸 IMAGEN RECOMENDADA (opcional, a futuro): una ilustración isométrica de
  // 3 "casilleros de gimnasio" cerrados con candado, cada uno con un logo
  // distinto, sin nada conectándolos. Formato ~1200×900, fondo grafito,
  // acento lima. Sustituye o acompaña al diagrama CSS.
} as const;

/** Capas de protección, además del aislamiento. */
export const SECURITY_LAYERS: SecurityPoint[] = [
  {
    icon: Lock,
    title: "Cifrado en tránsito",
    description:
      "Todo viaja por HTTPS. Entre el navegador de tu recepción y Flowerpot nadie puede leer lo que pasa: ni en el wifi del local, ni en el camino.",
  },
  {
    icon: FileLock2,
    title: "Cifrado en reposo",
    description:
      "Los datos guardados están cifrados en disco. Si alguien accediera al almacenamiento físico, encontraría texto ilegible, no tu padrón de socios.",
  },
  {
    icon: DatabaseZap,
    title: "Respaldos automáticos diarios",
    description:
      "Copias de seguridad todos los días, con historial. Si algo se borra por error o hay un incidente, se restaura sin depender de que alguien 'tenga el último Excel'.",
  },
  {
    icon: KeyRound,
    title: "Roles y permisos por sede",
    description:
      "Cada persona ve solo lo suyo. Recepción registra accesos sin ver finanzas; el encargado ve su local; el dueño ve todo el grupo.",
  },
  {
    icon: ScrollText,
    title: "Registro de actividad",
    description:
      "Las acciones sensibles quedan registradas: quién cambió un plan, quién anuló un pago y cuándo. Si algo no cuadra, se puede rastrear.",
  },
  {
    icon: Users,
    title: "Acceso de soporte controlado",
    description:
      "El equipo de Flowerpot solo entra a tu cuenta con tu permiso, para resolver un caso puntual, y ese ingreso también queda registrado.",
  },
];

/**
 * Tabla de contraste. `cuaderno` reúne la realidad de cuaderno + Excel +
 * grupo de WhatsApp; `flowerpot` la respuesta del sistema.
 */
export const CONTRAST = {
  eyebrow: "El contraste",
  title: "Cómo se ve la diferencia en el día a día",
  columns: {
    before: "Cuaderno, Excel y WhatsApp",
    after: "Con Flowerpot",
  },
  rows: [
    {
      question: "¿Quién puede ver los pagos de los socios?",
      before:
        "Cualquiera que abra el cuaderno o el archivo. No hay forma de limitarlo.",
      after:
        "Solo los roles que tú autorices. Recepción puede no tener acceso a finanzas.",
    },
    {
      question: "¿Qué pasa si se pierde el cuaderno o se malogra la laptop?",
      before: "Se pierde la información. No hay copia.",
      after:
        "Nada: hay respaldos diarios y los datos están en la nube, no en un equipo.",
    },
    {
      question: "¿Puedes saber quién cambió o borró un dato?",
      before: "No. Si alguien 'arregla' una cifra, no queda rastro.",
      after: "Sí. Las acciones sensibles quedan registradas con usuario y fecha.",
    },
    {
      question: "¿Un empleado que se va se puede llevar la base de socios?",
      before:
        "Sí: copia el Excel o le saca fotos al cuaderno y no te enteras.",
      after:
        "Le quitas el acceso y listo. La exportación masiva está restringida por rol.",
    },
    {
      question: "¿La información de tus socios está cifrada?",
      before: "No. Está en texto plano en un archivo o en papel.",
      after: "Sí, en tránsito y en reposo.",
    },
    {
      question: "¿Se puede mezclar tu información con la de otro gimnasio?",
      before: "No aplica, pero tampoco tienes con quién compararte ni consolidar.",
      after:
        "No. Cada gimnasio está aislado; ni por error los datos se cruzan.",
    },
  ],
} as const;

export const OWNERSHIP = {
  eyebrow: "Tus datos, tuyos",
  title: "Sin candados: si te vas, te vas con todo",
  points: [
    "Puedes exportar tu información (socios, pagos, historial de accesos) cuando quieras, en formatos estándar.",
    "No cobramos por exportar ni ponemos trabas para cerrar la cuenta.",
    "Flowerpot no vende ni comparte los datos de tus socios con terceros.",
  ],
} as const;

export const SECURITY_CTA = {
  title: "¿Te quedó alguna duda sobre seguridad?",
  description:
    "Están respondidas a detalle en las preguntas frecuentes, o escríbenos por el chat y lo vemos contigo.",
  primaryCta: "Ver preguntas de seguridad",
  primaryHref: "/preguntas-frecuentes#seguridad-datos",
  secondaryCta: "Empezar prueba gratis",
  secondaryHref: "/#planes",
} as const;
