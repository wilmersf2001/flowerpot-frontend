import { NextResponse } from "next/server";
import { z } from "zod";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/session";

/**
 * BFF de login del panel central.
 *
 * Recibe las credenciales del formulario, llama a `POST /admin/login` de la API
 * y, si todo va bien, guarda el token de Sanctum en una cookie httpOnly. El
 * token nunca llega al navegador.
 */

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido." }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message: "Datos inválidos.",
        errors: parsed.error.flatten().fieldErrors,
      },
      { status: 422 },
    );
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json(
      { message: "API no configurada (falta API_INTERNAL_URL)." },
      { status: 500 },
    );
  }

  let apiRes: Response;
  try {
    apiRes = await fetch(`${apiUrl}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "No se pudo conectar con el servidor." },
      { status: 502 },
    );
  }

  const body = (await apiRes.json().catch(() => null)) as {
    message?: string;
    errors?: Record<string, string[]>;
    data?: { token?: string };
  } | null;

  if (!apiRes.ok) {
    return NextResponse.json(
      {
        message: body?.message ?? "No se pudo iniciar sesión.",
        errors: body?.errors,
      },
      { status: apiRes.status },
    );
  }

  const token = body?.data?.token;
  if (!token) {
    return NextResponse.json(
      { message: "Respuesta de login inesperada." },
      { status: 502 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return response;
}
