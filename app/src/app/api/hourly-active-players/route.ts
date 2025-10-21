import { NextResponse } from "next/server";
import { count, gte } from "drizzle-orm";
import { drizzleDB } from "@/server/db";
import { userData } from "@/drizzle/schema";
import { updateGameSetting } from "@/libs/gamesettings";
import { lockWithHourlyTimer, handleEndpointError } from "@/libs/gamesettings";
import { secondsFromNow } from "@/utils/time";
import { cookies } from "next/headers";

const ENDPOINT_NAME = "hourly-active-players";

export async function GET() {
  // disable cache for this server action (https://github.com/vercel/next.js/discussions/50045)
  await cookies();

  // Check timer
  const timerCheck = await lockWithHourlyTimer(drizzleDB, ENDPOINT_NAME);
  if (!timerCheck.isNewHour && timerCheck.response) return timerCheck.response;

  try {
    // Count users active in the last 24 hours (updatedAt within last 24 hours)
    const result = await drizzleDB
      .select({ count: count() })
      .from(userData)
      .where(gte(userData.updatedAt, secondsFromNow(-3600 * 24))); // 24 hours = 3600 * 24 seconds

    const activeCount = result?.[0]?.count ?? 0;

    // Update the game setting with the count
    await updateGameSetting(drizzleDB, ENDPOINT_NAME, activeCount, new Date());

    return NextResponse.json({
      success: true,
      message: `Updated active players count: ${activeCount}`,
      count: activeCount,
    });
  } catch (cause) {
    // Rollback
    await updateGameSetting(drizzleDB, ENDPOINT_NAME, 0, timerCheck.prevTime);
    return handleEndpointError(cause);
  }
}
