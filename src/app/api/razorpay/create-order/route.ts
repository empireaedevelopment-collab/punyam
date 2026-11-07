import Razorpay from "razorpay";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const { amount, bookingId, currency = "INR" } = await request.json();

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay needs paise (multiply by 100)
      currency,
      receipt: `booking_${bookingId}`,
      notes: {
        booking_id: bookingId,
      },
    });

    return Response.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (err: any) {
    console.error("Razorpay order creation failed:", err);
    return Response.json({ error: err.message || "Failed to create payment order" }, { status: 500 });
  }
}
