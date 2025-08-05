import { z } from "zod";

export const skillTreeFilteringSchema = z.object({
  name: z.string().min(0).max(256).optional(),
  effect: z.array(z.string()).optional(),
  tier: z.number().min(1).max(10).optional(),
  costSkillPoints: z.number().min(1).optional(),
  hidden: z.boolean().optional(),
});

export type SkillTreeFilteringSchema = z.infer<typeof skillTreeFilteringSchema>;
