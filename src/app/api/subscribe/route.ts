import { NextResponse } from "next/server";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId = 1, tier = "FOUNDING_MEMBER" } = await req.json();

    const [updatedUser] = await db.update(schema.users)
      .set({
        subscriptionTier: tier,
        trialDaysRemaining: tier === "TRIAL" ? 28 : 365,
      })
      .where(eq(schema.users.id, Number(userId)))
      .returning();

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: tier === "FOUNDING_MEMBER" 
        ? "Congratulations! You are now a Founding Member with 50% off for life ($19.99 AUD/month)." 
        : "Subscription status updated."
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json({ error: "Failed to update subscription" }, { status: 500 });
  }
}
