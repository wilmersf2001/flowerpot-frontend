/**
 * Contenido de la página de Preguntas Frecuentes.
 *
 * ⚠️ DATOS DE PRUEBA (MOCK). Las respuestas son borradores razonables para
 * tener la página completa y el JSON-LD funcionando. Antes de lanzar hay que
 * revisar una por una con negocio/legal y ajustar cifras (precios, SLA,
 * tiempos de migración, métodos de pago reales).
 *
 * Estructura pensada para dos usos con la MISMA fuente:
 *  1. Render de la página (acordeones nativos <details>).
 *  2. `faqPageSchema()` → rich snippet de FAQ en Google.
 * Por eso `answer` es texto plano (sin JSX ni HTML).
 */

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqGroup {
  /** Título del grupo y ancla (#seguridad-datos, etc.). */
  id: string;
  title: string;
  items: FaqItem[];
}

export const FAQ_INTRO = {
  eyebrow: "Preguntas frecuentes",
  title: "Todo lo que suelen preguntarnos antes de empezar",
  description:
    "Si tu duda no está acá, escríbenos por el chat: respondemos en minutos, de verdad.",
} as const;

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: "general",
    title: "General",
    items: [
      {
        question: "¿Qué es Flowerpot exactamente?",
        answer:
          "Flowerpot es un software de gestión para gimnasios en Perú. En una sola plataforma administras socios y membresías, control de acceso, cobros y cierre de caja, asistencia y aforo, reportes de negocio y varias sedes a la vez.",
      },
      {
        question: "¿Necesito instalar algo?",
        answer:
          "No. Flowerpot funciona en el navegador desde cualquier computadora, tablet o celular. Solo necesitas internet. Las actualizaciones son automáticas y no cuestan nada.",
      },
      {
        question: "¿Sirve si tengo un solo local?",
        answer:
          "Sí. El plan de entrada está pensado para gimnasios de una sede. Si más adelante abres otra, cambias de plan sin migrar nada: tu información se mantiene.",
      },
      {
        question: "¿Puedo probarlo antes de pagar?",
        answer:
          "Sí. Todos los planes incluyen 14 días de prueba gratis y no se pide tarjeta para empezar. Si al terminar no quieres continuar, la cuenta simplemente se pausa.",
      },
    ],
  },
  {
    id: "seguridad-datos",
    title: "Seguridad y datos",
    items: [
      {
        question: "¿Los datos de mi gimnasio están separados de los de otros gimnasios?",
        answer:
          "Sí. Cada gimnasio vive en su propio espacio aislado dentro de Flowerpot (arquitectura multi-tenant). Tus socios, cobros y reportes nunca se mezclan con los de otro negocio: cada consulta a la base de datos está atada a tu gimnasio y no puede devolver información de otro.",
      },
      {
        question: "¿Flowerpot puede ver la información de mis socios?",
        answer:
          "El acceso del equipo de Flowerpot está restringido y registrado. Solo se ingresa a una cuenta con tu autorización expresa para resolver un problema de soporte, y queda traza de quién entró y cuándo.",
      },
      {
        question: "¿Cómo se protege la información?",
        answer:
          "Toda la conexión va cifrada por HTTPS y los datos se guardan cifrados en reposo. Hay respaldos automáticos diarios con retención histórica, así que ante cualquier incidente la información se puede restaurar.",
      },
      {
        question: "¿De quién son los datos? ¿Me puedo llevar todo si me voy?",
        answer:
          "Los datos son tuyos. Puedes exportar tu información (socios, pagos, historial) cuando quieras, en formatos estándar. No hay candados ni penalidades por irte.",
      },
      {
        question: "¿Puedo controlar qué ve cada empleado?",
        answer:
          "Sí. Los permisos son por rol y por sede. Recepción puede registrar accesos sin ver finanzas; un encargado ve solo su local; el dueño ve el consolidado de todo el grupo.",
      },
    ],
  },
  {
    id: "precios-planes",
    title: "Precios y planes",
    items: [
      {
        question: "¿Cómo elijo el plan?",
        answer:
          "El plan depende de cuántas sedes y cuántos socios manejas. Puedes empezar en el plan chico y subir cuando lo necesites; el cambio es inmediato y se prorratea.",
      },
      {
        question: "¿Los precios incluyen IGV?",
        answer:
          "Sí. Los precios que se muestran en la página de planes ya incluyen IGV. Emitimos comprobante por cada pago.",
      },
      {
        question: "¿Hay permanencia mínima o costo de instalación?",
        answer:
          "No hay permanencia: el plan es mensual y se cancela cuando quieras. La configuración inicial y la migración de tus datos no tienen costo.",
      },
    ],
  },
  {
    id: "migracion-soporte",
    title: "Migración y soporte",
    items: [
      {
        question: "Hoy uso Excel y cuadernos. ¿Cómo paso a Flowerpot?",
        answer:
          "Nos pasas tu archivo actual (Excel, export de otro sistema, o incluso fotos de tus padrones) y el equipo de onboarding carga a tus socios por ti. En la mayoría de casos quedas operando en un día.",
      },
      {
        question: "¿Qué soporte tengo si algo falla?",
        answer:
          "Soporte por chat, correo y teléfono todos los días del año. En horario pico la primera respuesta llega en menos de 5 minutos. Los planes superiores incluyen un gerente de cuenta dedicado.",
      },
    ],
  },
  {
    id: "accesos-hardware",
    title: "Accesos y hardware",
    items: [
      {
        question: "¿Funciona con torniquetes y lectores de huella?",
        answer:
          "Sí. Flowerpot se integra con control de acceso por QR, huella o torniquete. Solo abre para socios con membresía activa y el resto de intentos queda registrado.",
      },
      {
        question: "¿Puedo cobrar con Yape o tarjeta desde el sistema?",
        answer:
          "Sí. Puedes registrar cobros con Yape, tarjeta o efectivo, y el cierre de caja del día cuadra solo con lo que se registró.",
      },
    ],
  },
];

/** Aplana todos los grupos en una sola lista (para el JSON-LD FAQPage). */
export const FAQ_FLAT: FaqItem[] = FAQ_GROUPS.flatMap((g) => g.items);
