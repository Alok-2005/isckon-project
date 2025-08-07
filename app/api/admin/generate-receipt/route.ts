import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/app/db/connectDb"; // Adjust path if needed
import Payment from "@/app/models/Payment";
import { generateReceiptPDF } from "@/app/lib/whatsapp"; // Adjust path if needed

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const body = await req.json();
    const { name, amount, contactNo, to_user, method = "cash" } = body;

    // Validate inputs
    if (!name || !amount || !contactNo || !to_user) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Generate unique transaction ID for cash (e.g., CASH- followed by timestamp)
   // Inside the try block, after validation
const transactionId = `CASH-${Date.now()}`;
const oid = `CASH-OID-${Date.now()}`;  // Generated to avoid any validation hiccups

const newPayment = await Payment.create({
  name,
  contactNo,
  amount: parseFloat(amount),
  transactionId,
  oid,  // Explicitly set
  to_user,
  done: true,
  method,
  updatedAt: new Date(),
});


    // Generate PDF
    const { pdfUrl } = await generateReceiptPDF(newPayment, transactionId);

    // Prepare message for existing WhatsApp route
    const message = `Payment Successful (Cash)!

ISKCON Payment Receipt
Name: ${name}
Amount: ₹${amount}
Contact: ${contactNo}
Transaction ID: ${transactionId}
Payment Method: Cash
Date: ${new Date().toLocaleString("en-IN")}
Recipient: ${to_user}

Thank you for your donation to ISKCON!`;

    // Call existing /api/whatsapp/verify route internally
    const whatsappResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `whatsapp:${contactNo}`,
        message, // Matches the expected format
      }),
    });

    if (!whatsappResponse.ok) {
      throw new Error("Failed to send WhatsApp message");
    }

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error: unknown) {
    console.error("Error generating receipt:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
