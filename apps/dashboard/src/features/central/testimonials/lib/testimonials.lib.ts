import { z } from "zod";
import {
  apiClient,
  unwrapEnvelope,
  unwrapPaginated,
} from "@repo/api-client";
import type { Paginated } from "@repo/types";
import {
  boundedText,
  numericText,
  optionalText,
} from "@/features/_shared/form-schema";
import {
  buildListParams,
  type BaseListParams,
} from "@/features/_shared/list-params";

export const TESTIMONIALS_ENDPOINT = "/testimonials";
export const TESTIMONIALS_PER_PAGE = 10;

export interface TestimonialRow {
  id: string;
  author_name: string;
  author_role: string | null;
  author_avatar: string | null;
  gym_name: string | null;
  content: string;
  rating: number;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
}

export interface TestimonialInput {
  author_name: string;
  author_role: string;
  author_avatar: string | null;
  gym_name: string;
  content: string;
  rating: number;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
}

export type TestimonialListParams = BaseListParams;

export const testimonialKeys = {
  all: ["testimonials"] as const,
  lists: () => [...testimonialKeys.all, "list"] as const,
  list: (params: TestimonialListParams) =>
    [...testimonialKeys.lists(), params] as const,
};

const url = (id: string) =>
  `${TESTIMONIALS_ENDPOINT}/${encodeURIComponent(id)}`;

export const testimonialsApi = {
  async list(
    params: TestimonialListParams = {},
  ): Promise<Paginated<TestimonialRow>> {
    const { data } = await apiClient.get<unknown>(TESTIMONIALS_ENDPOINT, {
      params: buildListParams(params, TESTIMONIALS_PER_PAGE),
    });
    return unwrapPaginated<TestimonialRow>(data);
  },
  async create(input: TestimonialInput): Promise<TestimonialRow> {
    const { data } = await apiClient.post<unknown>(TESTIMONIALS_ENDPOINT, input);
    return unwrapEnvelope<TestimonialRow>(data);
  },
  async update(
    id: string,
    input: Partial<TestimonialInput>,
  ): Promise<TestimonialRow> {
    const { data } = await apiClient.put<unknown>(url(id), input);
    return unwrapEnvelope<TestimonialRow>(data);
  },
  async remove(id: string): Promise<void> {
    await apiClient.delete(url(id));
  },
};

/* ------------------------------ formulario ------------------------------- */

export const testimonialFormSchema = z.object({
  author_name: boundedText("El autor", { max: 120 }),
  author_role: optionalText(120),
  author_avatar: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^https?:\/\//i.test(v),
      "Debe ser una URL http(s) o estar vacío.",
    ),
  gym_name: optionalText(120),
  content: boundedText("El testimonio", { max: 1000 }),
  rating: numericText("La calificación", { min: 1, max: 5, decimals: 0 }),
  sort_order: numericText("El orden", { decimals: 0 }),
  is_published: z.boolean(),
  is_featured: z.boolean(),
});

export type TestimonialForm = z.infer<typeof testimonialFormSchema>;

export const testimonialFormDefaults: TestimonialForm = {
  author_name: "",
  author_role: "",
  author_avatar: "",
  gym_name: "",
  content: "",
  rating: "5",
  sort_order: "0",
  is_published: true,
  is_featured: false,
};

export const TESTIMONIAL_FORM_FIELDS = [
  "author_name",
  "author_role",
  "author_avatar",
  "gym_name",
  "content",
  "rating",
  "sort_order",
  "is_published",
  "is_featured",
] as const satisfies readonly (keyof TestimonialForm)[];

export function testimonialToForm(t: TestimonialRow): TestimonialForm {
  return {
    author_name: t.author_name,
    author_role: t.author_role ?? "",
    author_avatar: t.author_avatar ?? "",
    gym_name: t.gym_name ?? "",
    content: t.content,
    rating: String(t.rating),
    sort_order: String(t.sort_order),
    is_published: Boolean(t.is_published),
    is_featured: Boolean(t.is_featured),
  };
}

export function toTestimonialInput(f: TestimonialForm): TestimonialInput {
  return {
    author_name: f.author_name,
    author_role: f.author_role,
    author_avatar: f.author_avatar || null,
    gym_name: f.gym_name,
    content: f.content,
    rating: Number(f.rating),
    sort_order: Number(f.sort_order),
    is_published: f.is_published,
    is_featured: f.is_featured,
  };
}
