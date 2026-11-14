import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  testimonialKeys,
  testimonialsApi,
  type TestimonialInput,
  type TestimonialListParams,
} from "./testimonials.lib";

export function useTestimonials(params: TestimonialListParams = {}) {
  return useQuery({
    queryKey: testimonialKeys.list(params),
    queryFn: () => testimonialsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

function useInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: testimonialKeys.all });
}

export function useCreateTestimonial() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: TestimonialInput) => testimonialsApi.create(input),
    onSuccess: invalidate,
  });
}

export function useUpdateTestimonial() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<TestimonialInput>;
    }) => testimonialsApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteTestimonial() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => testimonialsApi.remove(id),
    onSuccess: invalidate,
  });
}
