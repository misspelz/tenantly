import { z } from "zod";

export const PropertySchema = z.object({
  id: z.uuid(),
  name: z.string().trim().min(1),
});

export type Property = z.infer<typeof PropertySchema>;
