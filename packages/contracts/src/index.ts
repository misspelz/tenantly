import { z } from "zod";

export const CreatePropertySchema = z.object({
  name: z.string().trim().min(1),
  address: z.string().trim().min(1),
});

export const PropertySchema = CreatePropertySchema.extend({
  id: z.uuid(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const PaginationMetadataSchema = z.object({
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1).max(100),
  totalItems: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

export const PropertiesListResponseSchema = z.object({
  data: z.array(PropertySchema),
  pagination: PaginationMetadataSchema,
});

export const ApiErrorSchema = z.object({
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    details: z.array(z.unknown()).optional(),
  }),
});

export type CreateProperty = z.infer<typeof CreatePropertySchema>;
export type Property = z.infer<typeof PropertySchema>;
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;
export type PaginationMetadata = z.infer<typeof PaginationMetadataSchema>;
export type PropertiesListResponse = z.infer<typeof PropertiesListResponseSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
