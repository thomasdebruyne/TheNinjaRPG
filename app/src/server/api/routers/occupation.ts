import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure, errorResponse } from "@/server/api/trpc";
import { userData } from "@/drizzle/schema";
import { fetchUser } from "@/server/api/routers/profile";
import { OCCUPATIONS, OCCUPATION_CHANGE_COOLDOWN_DAYS } from "@/drizzle/constants";

export const occupationRouter = createTRPCRouter({
  selectOccupation: protectedProcedure
    .input(z.object({ occupation: z.enum(OCCUPATIONS) }))
    .mutation(async ({ ctx, input }) => {
      // Query
      const user = await fetchUser(ctx.drizzle, ctx.userId);

      // Guard
      if (user.occupation && user.occupationSignupAt) {
        const daysSinceSignup = Math.floor(
          (Date.now() - user.occupationSignupAt.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysSinceSignup < OCCUPATION_CHANGE_COOLDOWN_DAYS) {
          const daysRemaining = OCCUPATION_CHANGE_COOLDOWN_DAYS - daysSinceSignup;
          return errorResponse(
            `You must wait ${daysRemaining} more day(s) before changing occupations`,
          );
        }
      }

      // Update user occupation
      await ctx.drizzle
        .update(userData)
        .set({ occupation: input.occupation, occupationSignupAt: sql`NOW()` })
        .where(eq(userData.userId, ctx.userId));

      return { success: true, message: "Occupation selected successfully!" };
    }),
});
