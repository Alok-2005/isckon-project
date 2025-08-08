import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/app/db/connectDb";
import Payment from "@/app/models/Payment";
import { generateReceiptPDF, sendWhatsAppMessage } from "@/app/lib/whatsapp";
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

    console.log("Cash payment created:", newPayment.transactionId);

    try {
      // Generate PDF receipt
      const { pdfUrl } = await generateReceiptPDF(newPayment, transactionId);

      // Send WhatsApp message with receipt
      const receiptMessage = `✅ Cash Payment Received!

📄 ISKCON Payment Receipt
👤 Name: ${name}
💰 Amount: ₹${amountNum.toLocaleString('en-IN')}
📱 Contact: ${contactNo}
🆔 Transaction ID: ${transactionId}
💳 Payment Method: Cash
📅 Date: ${new Date().toLocaleString("en-IN")}
🏛️ Recipient: ${to_user}

🙏 Thank you for your donation to ISKCON!
Your receipt is attached above.
Hare Krishna! 🕉️

💬 Save this Transaction ID to request receipt again:
${transactionId}`;

      // Send WhatsApp message with PDF attachment
      await sendWhatsAppMessage(
        `whatsapp:${contactNo}`,
        receiptMessage,
        [pdfUrl]
      );

      console.log("WhatsApp message sent successfully to:", contactNo);

      return NextResponse.json({ 
        success: true, 
        message: "Cash receipt generated and sent via WhatsApp successfully!",
        transactionId,
        pdfUrl 
      });

    } catch (whatsappError) {
      console.error("Error sending WhatsApp message:", whatsappError);
      
      // Still return success since payment was created, just note the delivery failure
      return NextResponse.json({ 
        success: true, 
        message: "Cash receipt generated but WhatsApp delivery failed",
        transactionId,
        note: "Receipt was created but could not be sent via WhatsApp. Please check Twilio configuration.",
        error: whatsappError instanceof Error ? whatsappError.message : String(whatsappError)
      });
    }

  } catch (error) {
    console.error("Error generating receipt:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Server error", 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}