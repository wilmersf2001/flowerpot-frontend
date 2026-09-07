"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@repo/api-client";
import { toast } from "@repo/ui/toast";
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/dialog";
import { useCreateTenant } from "../lib/tenants.hooks";
import { createTenantSchema, type CreateTenantForm } from "../lib/tenants.schema";
import type { CreateTenantResult } from "../lib/tenants.types";

/** Diálogo "Nuevo gimnasio". Controlado por el padre. */
export function TenantFormDialog({
  open,
  onOpenChangeAction,
  onCreatedAction,
}: {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  /** Se llama con las credenciales del admin tras crear el gimnasio. */
  onCreatedAction: (result: CreateTenantResult) => void;
}) {
  const createTenant = useCreateTenant();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateTenantForm>({
    resolver: zodResolver(createTenantSchema),
    defaultValues: { id: "" },
  });

  // Cada vez que se abre, empieza limpio.
  useEffect(() => {
    if (open) reset({ id: "" });
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await createTenant.mutateAsync(values);
      toast.success(`Gimnasio "${values.id}" creado.`);
      onOpenChangeAction(false);
      onCreatedAction(result);
    } catch (err) {
      if (err instanceof ApiError && err.isValidationError && err.errors?.id?.[0]) {
        setError("id", { message: err.errors.id[0] });
        return;
      }
      const message =
        err instanceof ApiError ? err.message : "No se pudo crear el gimnasio.";
      setError("id", { message });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nuevo gimnasio</DialogTitle>
          <DialogDescription>
            El identificador será el subdominio del gimnasio y no se puede
            cambiar después.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tenant-id">Identificador</Label>
            <Input
              id="tenant-id"
              placeholder="gymfit"
              autoComplete="off"
              autoFocus
              aria-invalid={errors.id ? true : undefined}
              {...register("id")}
            />
            {errors.id ? (
              <p className="text-xs text-destructive">{errors.id.message}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Letras, números, guion y guion bajo.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChangeAction(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando…" : "Crear gimnasio"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
