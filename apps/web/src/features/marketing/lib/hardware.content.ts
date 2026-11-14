/**
 * Contenido de la sección "Hardware compatible" de la landing.
 *
 * FUENTE DE VERDAD: el documento interno de hardware homologado del sistema de
 * check-in (actualizado 2026-11-14). Aquí solo va lo que está HOMOLOGADO o
 * IMPLEMENTADO. No agregar torniquetes, RFID/NFC, lectores de DNI, app con GPS
 * ni otros modelos ZKTeco hasta que existan y estén homologados.
 *
 * Datos internos que NO se publican a propósito: número de serie del equipo de
 * homologación, versiones de firmware y de algoritmos, puertos y endpoints.
 *
 * 📸 Fotos: dejar los archivos en `apps/web/public/hardware/` y poner la ruta en
 * `image` (p. ej. "/hardware/zkteco-speedface-v4l.webp"). 800×600, fondo liso,
 * WebP. Sin `image` se pinta un icono (nunca imagen rota). La foto del
 * SpeedFace-V4L conviene sacarla de la ficha oficial de ZKTeco o de una foto
 * propia del equipo instalado.
 *
 * ⚠️ Pendiente de negocio: aclarar el alcance real de "cubierto" (¿suministro,
 * alquiler, garantía, visita presencial o remota?). `COVERAGE` es genérico.
 */
import {
  Cable,
  ClipboardCheck,
  QrCode,
  ScanFace,
  type LucideIcon,
} from "lucide-react";

export interface HardwareItem {
  icon: LucideIcon;
  /** Etiqueta corta sobre el título, p. ej. "Homologado". */
  badge?: string;
  title: string;
  /** Marca y modelo concretos. */
  model?: string;
  description: string;
  /** Qué hace, en lenguaje de gimnasio. */
  highlights: string[];
  /** Ruta bajo `/public`. Opcional. */
  image?: string;
  imageAlt?: string;
}

export const HARDWARE_SECTION = {
  eyebrow: "Hardware",
  title: "Control de acceso probado, no prometido",
  description:
    "Trabajamos con un biométrico homologado y probado en el sistema, con cualquier lector QR y con registro manual en recepción. Todos aplican las mismas reglas de membresía.",
} as const;

export const HARDWARE_ITEMS: HardwareItem[] = [
  {
    icon: ScanFace,
    badge: "Homologado",
    title: "Biométrico facial, huella y palma",
    model: "ZKTeco SpeedFace-V4L",
    description:
      "Reconocimiento facial, de huella digital y de palma en un solo equipo. Probado y certificado con Flowerpot.",
    highlights: [
      "Marcaciones en tiempo real",
      "Alta, cambio y baja de socios sincronizados",
      "Estado en línea o desconectado a la vista",
      "Si se cae el internet, guarda las marcaciones y las envía al reconectar",
      "Funciona sin abrir puertos en el router del gimnasio",
    ],
  },
  {
    icon: QrCode,
    badge: "Compatible",
    title: "Lector de código QR",
    model: "Cualquier lector USB o Bluetooth",
    description:
      "Cada socio tiene su QR único. Lo escanea en la entrada y el sistema valida su membresía al instante.",
    highlights: [
      "Funciona con marcas como Zebra, Honeywell o Datalogic",
      "Sin instalar nada para el socio",
      "Ideal para empezar sin inversión en biométricos",
    ],
  },
  {
    icon: ClipboardCheck,
    badge: "Incluido",
    title: "Registro en recepción",
    model: "Desde el panel del gimnasio",
    description:
      "Recepción busca al socio por nombre, DNI o ID y registra su entrada con un clic.",
    highlights: [
      "Respaldo cuando falla un equipo o el socio olvida su QR",
      "Solo para usuarios con permiso",
      "Queda registrado como entrada manual",
    ],
  },
];

/** Reglas que aplica el sistema sin importar por dónde entre el socio. */
export const ACCESS_RULES = {
  title: "Lo mismo en cualquier puerta",
  description: "Entre por biométrico, QR o recepción, el sistema valida siempre:",
  rules: [
    "Que el socio esté activo",
    "Que su membresía esté vigente y pagada",
    "Que su plan le dé acceso a esa sede",
    "Una sola asistencia por día",
  ],
} as const;

/**
 * Bloque "nosotros nos encargamos". Aplica a los equipos homologados: el
 * gimnasio no tiene que saber de redes ni de configuración.
 */
export const COVERAGE = {
  icon: Cable,
  eyebrow: "Instalación incluida",
  title: "Los equipos homologados los conectamos y configuramos nosotros",
  description:
    "No tienes que hacer nada técnico: nuestro equipo conecta el equipo a tu cuenta, lo asigna a tu sede y lo deja funcionando.",
  steps: [
    "Nos dices qué equipo tienes o vas a comprar.",
    "Verificamos que sea compatible antes de que inviertas.",
    "Lo conectamos y configuramos a tu cuenta y a tu sede.",
    "Probamos el ingreso contigo y te dejamos operando.",
  ],
  footnote:
    "¿Tienes otro modelo? Cada equipo se homologa individualmente antes de usarse. Escríbenos y lo evaluamos.",
  cta: {
    label: "Consultar compatibilidad",
    href: "/preguntas-frecuentes#accesos-hardware",
  },
} as const;
