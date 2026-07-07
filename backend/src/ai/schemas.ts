import { z } from 'zod';
import { Impact } from '@prisma/client';

/** Expected JSON shape from OpenAI — matches product spec */
export const aiAnalysisSchema = z.object({
  company: z.string().min(1),
  eventType: z.string().min(1),
  impact: z.nativeEnum(Impact),
  confidence: z.number().int().min(0).max(100),
  expectedMove: z.string().min(1),
  holdingPeriod: z.string().min(1),
  summary: z.string().min(1),
  reason: z.string().min(1),
});

export type AiAnalysisResult = z.infer<typeof aiAnalysisSchema>;
