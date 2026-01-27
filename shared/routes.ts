
import { z } from 'zod';
import { regions, analysisRequestSchema, insertRegionSchema } from './schema';

export const createRegionInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  description: z.string().optional(),
});

export type CreateRegionInput = z.infer<typeof createRegionInputSchema>;

export const api = {
  regions: {
    list: {
      method: 'GET' as const,
      path: '/api/regions',
      responses: {
        200: z.array(z.custom<typeof regions.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/regions/:id',
      responses: {
        200: z.custom<typeof regions.$inferSelect>(),
        404: z.object({ message: z.string() }),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/regions',
      input: createRegionInputSchema,
      responses: {
        201: z.custom<typeof regions.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/regions/:id',
      responses: {
        204: z.void(),
        404: z.object({ message: z.string() }),
      },
    },
  },
  analysis: {
    run: {
      method: 'POST' as const,
      path: '/api/analyze',
      input: analysisRequestSchema,
      responses: {
        200: z.custom<any>(), // AnalysisResult
        400: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
