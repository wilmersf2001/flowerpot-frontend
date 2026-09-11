import { z } from "zod";
import { boundedText } from "@/features/_shared/form-schema";
import type { CreateUserInput, UpdateUserInput, UserRow } from "./users.types";

/**
 * Formulario de usuario (alta y edición). En alta la contraseña es
 * obligatoria; en edición, dejarla vacía significa "no cambiarla" -por eso el
 * schema depende de `isEdit` en vez de ser una constante.
 */
export function userFormSchema(isEdit: boolean) {
  return z
    .object({
      name: boundedText("El nombre", { max: 120 }),
      email: z
        .string()
        .trim()
        .min(1, "El email es obligatorio.")
        .email("Ingresa un email válido."),
      password: z.string(),
      password_confirmation: z.string(),
    })
    .superRefine((values, ctx) => {
      const changingPassword = !isEdit || values.password.length > 0;
      if (!changingPassword) return;
      if (values.password.length < 8) {
        ctx.addIssue({
          code: "custom",
          path: ["password"],
          message: "La contraseña debe tener al menos 8 caracteres.",
        });
      }
      if (values.password !== values.password_confirmation) {
        ctx.addIssue({
          code: "custom",
          path: ["password_confirmation"],
          message: "Las contraseñas no coinciden.",
        });
      }
    });
}

export type UserForm = z.infer<ReturnType<typeof userFormSchema>>;

export const userFormDefaults: UserForm = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
};

/** Campos que el backend puede devolver como error de validación. */
export const USER_FORM_FIELDS = [
  "name",
  "email",
  "password",
  "password_confirmation",
] as const satisfies readonly (keyof UserForm)[];

/** Prellena el formulario con los datos de un usuario existente (modo edición). */
export function userToForm(user: UserRow): UserForm {
  return {
    name: user.name,
    email: user.email,
    password: "",
    password_confirmation: "",
  };
}

/** Convierte el formulario validado al cuerpo de `POST /users`. */
export function toCreateUserInput(form: UserForm): CreateUserInput {
  return {
    name: form.name,
    email: form.email,
    password: form.password,
    password_confirmation: form.password_confirmation,
  };
}

/**
 * Convierte el formulario validado al cuerpo de `PUT /users/{user}`. Omite
 * la contraseña si el usuario no la tocó.
 */
export function toUpdateUserInput(form: UserForm): UpdateUserInput {
  return {
    name: form.name,
    email: form.email,
    ...(form.password
      ? {
          password: form.password,
          password_confirmation: form.password_confirmation,
        }
      : {}),
  };
}
