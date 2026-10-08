import { z } from "zod";
import { boundedText } from "@/features/_shared/form-schema";
import {
  INHERIT_LAYOUT,
  TEMPLATE_BODY_MAX,
  TEMPLATE_TITLE_MAX,
} from "./documents.constants";
import type {
  DocumentTemplate,
  UpdateDocumentTemplateInput,
} from "./documents.types";

/** Variables `{{nombre}}` que aparecen en un texto, sin repetidas. */
export function usedVariables(body: string): string[] {
  const found = new Set<string>();
  for (const match of body.matchAll(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g)) {
    found.add(match[1]!);
  }
  return [...found];
}

/**
 * Espeja `UpdateDocumentTemplateRequest`: el cuerpo solo admite las variables
 * del documento (un typo como `{{membr_name}}` saldría literal en el PDF).
 * Es una fábrica porque la lista de variables depende del tipo de documento.
 */
export function createTemplateFormSchema(allowedKeys: readonly string[]) {
  const allowed = new Set(allowedKeys);
  return z.object({
    title: boundedText("El título", { max: TEMPLATE_TITLE_MAX }),
    layout: z.string(),
    body: z
      .string()
      .trim()
      .min(1, "El texto es obligatorio.")
      .max(TEMPLATE_BODY_MAX, `Máximo ${TEMPLATE_BODY_MAX} caracteres.`)
      .superRefine((value, ctx) => {
        const unknown = usedVariables(value).filter((key) => !allowed.has(key));
        if (unknown.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Variables no válidas: ${unknown
              .map((key) => `{{${key}}}`)
              .join(", ")}.`,
          });
        }
      }),
  });
}

export type DocumentTemplateForm = z.infer<
  ReturnType<typeof createTemplateFormSchema>
>;

/** Campos que el backend puede devolver como error de validación. */
export const TEMPLATE_FORM_FIELDS = [
  "title",
  "layout",
  "body",
] as const satisfies readonly (keyof DocumentTemplateForm)[];

export function templateToForm(template: DocumentTemplate): DocumentTemplateForm {
  return {
    title: template.title,
    layout: template.layout ?? INHERIT_LAYOUT,
    body: template.body,
  };
}

export function toUpdateTemplateInput(
  form: DocumentTemplateForm,
): UpdateDocumentTemplateInput {
  return {
    title: form.title,
    body: form.body,
    layout: form.layout === INHERIT_LAYOUT ? null : form.layout,
  };
}
