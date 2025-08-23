import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/app/db/connectDb";
import Payment from "@/app/models/Payment";

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const body = await req.json();
    const { name, amount, contactNo, to_user, purpose } = body;

    // Validate inputs
    if (!name || !amount || !contactNo || !to_user || !purpose) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const contactRegex = /^\+91\d{10}$/;
    if (!contactRegex.test(contactNo)) {
      return NextResponse.json({ success: false, message: "Contact number must be in format +91xxxxxxxxxx" }, { status: 400 });
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
    }

    // Generate unique cash receipt ID
    const cashReceiptId = `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // ✅ Create payment record first (same as online payments)
    const newPayment = await Payment.create({
      name,
      contactNo,
      purpose,
      amount: amountNum,
      to_user,
      transactionId: cashReceiptId,
      done: true, // Mark as completed for cash
      method: "cash",
      updatedAt: new Date(),
    });

    console.log("Cash payment created:", cashReceiptId);

    // ✅ Call existing whatsapp/verify route (same format as Twilio webhook)
    const webhookPayload = {
      From: `whatsapp:${contactNo}`,
      To: "whatsapp:+14155238886",
      Body: `Transaction ID: ${cashReceiptId}`, // This triggers the PDF generation
    };

    const response = await fetch("https://iskconprojectbackend.onrender.com/api/whatsapp/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webhookPayload),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      return NextResponse.json({
        success: true,
        message: "Cash receipt generated and PDF sent via WhatsApp successfully!",
        receiptId: cashReceiptId,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message || "Failed to send cash receipt",
      }, { status: response.status });
    }

  } catch (error) {
    console.error("Error generating cash receipt:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
