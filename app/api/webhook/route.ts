import { NextResponse } from "next/server"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// This would be a real Stripe webhook handler in production
export async function POST(req: Request) {
  try {
    const payload = await req.json()

    // Verify Stripe signature (omitted for demo)

    const event = payload

    // Handle subscription events
    if (event.type === "customer.subscription.created" || event.type === "customer.subscription.updated") {
      const subscription = event.data.object
      const userId = subscription.metadata.userId

      if (userId) {
        await updateDoc(doc(db, "users", userId), {
          subscriptionStatus: subscription.status === "active" ? "active" : "inactive",
          subscriptionId: subscription.id,
          subscriptionPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        })
      }
    }

    // Handle subscription cancellation
    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object
      const userId = subscription.metadata.userId

      if (userId) {
        await updateDoc(doc(db, "users", userId), {
          subscriptionStatus: "inactive",
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 400 })
  }
}
