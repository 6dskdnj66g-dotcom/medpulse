import { z } from 'zod';

export const MedicalQueryRequestSchema = z.object({
  question: z
    .string()
    .min(5, 'السؤال قصير جداً')
    .max(500, 'السؤال طويل جداً')
    .trim(),
  englishQuery: z.string().min(3).max(300).optional(),
  studyTypes: z.array(z.string()).optional(),
  minYear: z.number().int().min(2000).max(2030).optional(),
  forceRefresh: z.boolean().optional().default(false),
});

export type MedicalQueryRequest = z.infer<typeof MedicalQueryRequestSchema>;