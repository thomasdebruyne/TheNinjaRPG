import { z } from "zod";
import { eq, and, isNotNull, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/api/trpc";
import { baseServerResponse, errorResponse } from "@/api/trpc";
import { canChangeContent } from "@/utils/permissions";
import { generateAndUploadAudio } from "@/libs/replicate";
import { historicalSoundEffect, userData } from "@/drizzle/schema";

export const audioRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        relationId: z.string().optional(),
        prompt: z.string().min(3),
        negativePrompt: z.string().optional(),
        secondsTotal: z.number().min(1).max(30),
      }),
    )
    .output(baseServerResponse.extend({ url: z.string().nullish() }))
    .mutation(async ({ ctx, input }) => {
      // Query
      const user = await ctx.drizzle.query.userData.findFirst({
        where: eq(userData.userId, ctx.userId),
      });
      // Guard
      if (!user) return errorResponse("User not found");
      if (user.isBanned) return errorResponse("You are banned");
      if (!canChangeContent(user.role)) return errorResponse("Not allowed");

      // Generate and upload audio
      const url = await generateAndUploadAudio({
        prompt: input.prompt,
        negativePrompt: input.negativePrompt,
        secondsTotal: input.secondsTotal,
      });
      // Guard
      if (!url) return errorResponse("Failed to upload audio");
      // Final insert (store prompts)
      await ctx.drizzle.insert(historicalSoundEffect).values({
        userId: ctx.userId,
        relationId: input.relationId ?? ctx.userId,
        secondsTotal: input.secondsTotal,
        status: "success",
        done: 1,
        url,
        prompt: input.prompt,
        negativePrompt: input.negativePrompt,
      });
      return { success: true, message: "Audio generated", url };
    }),

  getHistorical: protectedProcedure
    .input(
      z.object({
        relationId: z.string().optional(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Query
      const relationId = input.relationId ?? ctx.userId;
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const rows = await ctx.drizzle
        .select()
        .from(historicalSoundEffect)
        .where(
          and(
            eq(historicalSoundEffect.relationId, relationId),
            eq(historicalSoundEffect.done, 1),
            isNotNull(historicalSoundEffect.url),
          ),
        )
        .orderBy(desc(historicalSoundEffect.id))
        .offset(cursor ? cursor : 0)
        .limit(limit + 1);

      let nextCursor: typeof cursor | undefined = undefined;
      if (rows.length > limit) {
        const nextItem = rows.pop();
        nextCursor = nextItem?.id;
      }
      return { data: rows, nextCursor };
    }),
});
