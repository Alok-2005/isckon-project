import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/app/db/connectDb"; // Adjust path if needed
import Payment from "@/app/models/Payment";
import { generateReceiptPDF, sendWhatsAppMessage } from "@/app/lib/whatsapp"; // Adjust path if needed
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    const body = await req.json();
    const { name, amount, contactNo, to_user, method = "cash" } = body;

    // Validate inputs
    if (!name || !amount || !contactNo || !to_user) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Validate contact number format
    const contactRegex = /^\+91\d{10}$/;
    if (!contactRegex.test(contactNo)) {
      return NextResponse.json({ success: false, message: "Contact number must be in format +91xxxxxxxxxx" }, { status: 400 });
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ success: false, message: "Invalid amount" }, { status: 400 });
    }

    // Generate unique transaction ID for cash
    const transactionId = `CASH-${uuidv4()}`;
    const oid = `CASH-OID-${Date.now()}`;

    const newPayment = await Payment.create({
      name,
      contactNo,
      amount: amountNum,
      transactionId,
      oid,
      to_user,
      done: true,
      method,
      updatedAt: new Date(),
    });

    // Generate PDF
    const { pdfUrl } = await generateReceiptPDF(newPayment, transactionId);

    // Send WhatsApp message with receipt
    const message = `Payment Successful (Cash)!

ISKCON Payment Receipt
Name: ${name}
Amount: ₹${amountNum.toLocaleString('en-IN')}
Contact: ${contactNo}
Transaction ID: ${transactionId}
Payment Method: Cash
Date: ${new Date().toLocaleString("en-IN")}
Recipient: ${to_user}

Thank you for your donation to ISKCON!`;

    // Send WhatsApp message with PDF attachment
    await sendWhatsAppMessage(
      `whatsapp:${contactNo}`,
      message,
      [pdfUrl]
    );

    return NextResponse.json({ success: true, pdfUrl });
  } catch (error: unknown) {
    console.error("Error generating receipt:", error);
    return NextResponse.json(
      { success: false, message: "Server error", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
