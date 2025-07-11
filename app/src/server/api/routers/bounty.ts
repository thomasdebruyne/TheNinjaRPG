import { nanoid } from "nanoid";
import { and, eq, sql, gte, desc, inArray } from "drizzle-orm";
import { bounty, bountySignup, userData } from "@/drizzle/schema";
import {
  BOUNTY_MAX_HUNTERS,
  RANKS_RESTRICTED_FROM_PVP,
  BOUNTY_MIN_AMOUNT,
} from "@/drizzle/constants";
import {
  createBountySchema,
  signupBountySchema,
  resignBountySchema,
  retractBountySchema,
  bountyBoardFilterSchema,
  collectBountySchema,
} from "@/validators/bounty";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { baseServerResponse, errorResponse } from "../trpc";
import { fetchUser } from "@/routers/profile";

export const bountyRouter = createTRPCRouter({
  // Get open bounty board
  board: protectedProcedure
    .input(bountyBoardFilterSchema)
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 30;
      const offset = (input.cursor ?? 0) * limit;
      const userId = ctx.userId;

      // Get open bounties with target user info and calculate claims
      const results = await ctx.drizzle.query.bounty.findMany({
        where: inArray(bounty.status, ["OPEN", "CLAIMED"]),
        columns: {
          id: true,
          amountRyo: true,
          createdAt: true,
          status: true,
          collectedAt: true,
          claimedAt: true,
          targetUserId: true,
          claimedByUserId: true,
          creatorUserId: true, // Always include, will be filtered below
        },
        with: {
          target: {
            columns: {
              username: true,
              avatar: true,
              level: true,
              rank: true,
              isOutlaw: true,
            },
          },
          hunters: {
            columns: {
              hunterUserId: true,
            },
          },
        },
        orderBy: desc(bounty.createdAt),
        limit,
        offset,
      });

      // Transform results to include claim counts and user signup status
      const transformedResults = results.map((bountyItem) => ({
        ...bountyItem,
        // Only include creatorUserId if the current user created this bounty
        creatorUserId:
          bountyItem.creatorUserId === userId ? bountyItem.creatorUserId : undefined,
        huntersCount: bountyItem.hunters.length,
        youSignedUp: bountyItem.hunters.some((h) => h.hunterUserId === userId),
        targetUser: bountyItem.target,
      }));

      const nextCursor = results.length < limit ? null : (input.cursor ?? 0) + 1;
      return { data: transformedResults, nextCursor };
    }),

  create: protectedProcedure
    .input(createBountySchema)
    .output(baseServerResponse)
    .mutation(async ({ ctx, input }) => {
      const { targetUserId, amountRyo } = input;
      // Guards
      if (targetUserId === ctx.userId) return errorResponse("Cannot bounty yourself");
      // Query
      const [creator, target] = await Promise.all([
        fetchUser(ctx.drizzle, ctx.userId),
        fetchUser(ctx.drizzle, targetUserId),
      ]);
      // Guards
      if (!creator || !target) return errorResponse("User not found");
      if (RANKS_RESTRICTED_FROM_PVP.includes(target.rank))
        return errorResponse("Target too low rank for PvP");
      if (amountRyo < BOUNTY_MIN_AMOUNT)
        return errorResponse(
          `Bounty amount too low. Must be at least ${BOUNTY_MIN_AMOUNT.toLocaleString()} Ryo`,
        );
      if (creator.money < amountRyo) return errorResponse("Not enough ryo");
      // Mutation 1
      const result = await ctx.drizzle
        .update(userData)
        .set({ money: sql`${userData.money} - ${amountRyo}` })
        .where(and(eq(userData.userId, ctx.userId), gte(userData.money, amountRyo)));
      if (result?.rowsAffected === 0) return errorResponse("Not enough ryo");
      // Mutation 2
      await ctx.drizzle.insert(bounty).values({
        id: nanoid(),
        targetUserId,
        creatorUserId: ctx.userId,
        amountRyo,
        status: "OPEN",
        createdAt: new Date(),
      });
      return { success: true, message: "Bounty created" };
    }),

  signup: protectedProcedure
    .input(signupBountySchema)
    .output(baseServerResponse)
    .mutation(async ({ ctx, input }) => {
      // Query
      const { bountyId } = input;
      const [curBounty, curSignups, userSignups] = await Promise.all([
        ctx.drizzle.query.bounty.findFirst({
          where: eq(bounty.id, bountyId),
        }),
        ctx.drizzle.query.bountySignup.findMany({
          where: eq(bountySignup.bountyId, bountyId),
        }),
        ctx.drizzle.query.bountySignup.findFirst({
          where: eq(bountySignup.hunterUserId, ctx.userId),
        }),
      ]);
      // Guards
      if (!curBounty) return errorResponse("Bounty not found");
      if (curBounty.status !== "OPEN") return errorResponse("Bounty closed");
      if (curBounty.creatorUserId === ctx.userId)
        return errorResponse("Cannot track your own bounty");
      if (curBounty.targetUserId === ctx.userId)
        return errorResponse("Cannot track your own bounty");
      const hunter = await fetchUser(ctx.drizzle, ctx.userId);
      if (!hunter) return errorResponse("User not found");
      if (RANKS_RESTRICTED_FROM_PVP.includes(hunter.rank))
        return errorResponse("Your rank cannot engage in PvP");
      if (curSignups?.find((c) => c.hunterUserId === ctx.userId))
        return errorResponse("Already sign up");
      if (curSignups && curSignups.length >= BOUNTY_MAX_HUNTERS)
        return errorResponse("Maximum hunters signed up already");
      if (userSignups) return errorResponse("Already tracking a bounty.");
      // Sign up for the bounty hunt
      await ctx.drizzle.insert(bountySignup).values({
        id: nanoid(),
        bountyId,
        hunterUserId: ctx.userId,
        createdAt: new Date(),
      });
      return { success: true, message: "Tracking this bounty" };
    }),

  resign: protectedProcedure
    .input(resignBountySchema)
    .output(baseServerResponse)
    .mutation(async ({ ctx, input }) => {
      // Query
      const claim = await ctx.drizzle.query.bountySignup.findFirst({
        where: eq(bountySignup.id, input.claimId),
      });
      if (!claim) return errorResponse("Claim not found");
      if (claim.hunterUserId !== ctx.userId) return errorResponse("Not your claim");
      const curBounty = await ctx.drizzle.query.bounty.findFirst({
        where: eq(bounty.id, claim.bountyId),
      });
      if (!curBounty || curBounty.status !== "OPEN")
        return errorResponse("Bounty closed");
      await ctx.drizzle.delete(bountySignup).where(eq(bountySignup.id, claim.id));
      return { success: true, message: "Claim withdrawn" };
    }),

  collect: protectedProcedure
    .input(collectBountySchema)
    .output(baseServerResponse)
    .mutation(async ({ ctx, input }) => {
      const { bountyId } = input;

      // Find the bounty and hunter signup
      const [curBounty, hunterSignup] = await Promise.all([
        ctx.drizzle.query.bounty.findFirst({
          where: eq(bounty.id, bountyId),
        }),
        ctx.drizzle.query.bountySignup.findFirst({
          where: and(
            eq(bountySignup.bountyId, bountyId),
            eq(bountySignup.hunterUserId, ctx.userId),
          ),
        }),
      ]);

      // Guards
      if (!curBounty) return errorResponse("Bounty not found");
      if (curBounty.claimedByUserId !== ctx.userId)
        return errorResponse("Not your bounty");
      if (curBounty.collectedAt) return errorResponse("Bounty already collected");
      if (!hunterSignup) return errorResponse("Not signed up for this bounty");

      // Execute all mutations in parallel
      await Promise.all([
        // Update bounty as claimed
        ctx.drizzle
          .update(bounty)
          .set({ collectedAt: new Date() })
          .where(eq(bounty.id, bountyId)),
        // Update hunter signup as fulfilled
        ctx.drizzle.delete(bountySignup).where(eq(bountySignup.bountyId, bountyId)),
        // Award the bounty money to the hunter
        ctx.drizzle
          .update(userData)
          .set({ money: sql`${userData.money} + ${curBounty.amountRyo}` })
          .where(eq(userData.userId, ctx.userId)),
      ]);

      return { success: true, message: "Bounty claimed successfully" };
    }),

  retract: protectedProcedure
    .input(retractBountySchema)
    .output(baseServerResponse)
    .mutation(async ({ ctx, input }) => {
      // Query
      const curBounty = await ctx.drizzle.query.bounty.findFirst({
        where: eq(bounty.id, input.bountyId),
      });
      // Guards
      if (!curBounty) return errorResponse("Bounty not found");
      if (curBounty.creatorUserId !== ctx.userId)
        return errorResponse("Not your bounty");
      if (curBounty.status !== "OPEN") return errorResponse("Bounty not open");
      // First disable the bounty and check the result
      const result = await ctx.drizzle
        .update(bounty)
        .set({ status: "CANCELLED" })
        .where(
          and(
            eq(bounty.id, input.bountyId),
            eq(bounty.creatorUserId, ctx.userId),
            eq(bounty.status, "OPEN"),
          ),
        );
      if (result?.rowsAffected === 0) return errorResponse("Bounty not found");
      // Execute mutations in parallel
      await Promise.all([
        // Remove all hunter signups for this bounty
        ctx.drizzle
          .delete(bountySignup)
          .where(eq(bountySignup.bountyId, input.bountyId)),
        // Refund the bounty amount to the creator
        ctx.drizzle
          .update(userData)
          .set({ money: sql`${userData.money} + ${curBounty.amountRyo}` })
          .where(eq(userData.userId, ctx.userId)),
      ]);
      return { success: true, message: "Bounty retracted successfully" };
    }),

  // Get user's tracked bounties for map display
  getTrackedBounties: protectedProcedure.query(async ({ ctx }) => {
    // Get bounties the user is tracking
    const trackedBounties = await ctx.drizzle.query.bountySignup.findMany({
      where: eq(bountySignup.hunterUserId, ctx.userId),
      with: {
        bounty: {
          columns: {
            id: true,
            status: true,
            amountRyo: true,
            collectedAt: true,
            claimedAt: true,
          },
          with: {
            target: {
              columns: {
                userId: true,
                username: true,
                avatar: true,
                avatarLight: true,
                sector: true,
              },
            },
          },
        },
      },
    });

    // Transform to map format
    const bountyHighlights = trackedBounties
      .filter((tb) => tb.bounty.status === "OPEN" && tb.bounty.target)
      .map((tb) => {
        const target = tb.bounty.target;
        return {
          userId: target.userId,
          sector: target.sector,
          avatar: target.avatar,
          avatarLight: target.avatarLight,
          username: target.username,
          bountyAmount: tb.bounty.amountRyo,
        };
      });

    return bountyHighlights;
  }),
});
