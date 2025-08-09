import { NextResponse, NextRequest } from "next/server";
import connectDb from "@/app/db/connectDb";
import Payment from "@/app/models/Payment";
import { generateReceiptPDF, sendWhatsAppMessage, PaymentData } from "@/app/lib/whatsapp";

interface TwilioFormData {
  From: string;
  Body: string;
  [key: string]: string;
}

interface DirectApiData {
  from?: string;
  message?: string;
  paymentData?: {
    transactionId: string;
    paymentMethod?: string;
  };
}

type RequestBody = TwilioFormData | DirectApiData;

interface VerificationPaymentData {
  transactionId: string;
  paymentMethod?: string;
}

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    console.log("WhatsApp webhook received");

    const contentType = req.headers.get("content-type") || "";
    let body: RequestBody;
    let from: string;
    let messageBody: string;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries()) as TwilioFormData;
      console.log("Twilio Webhook received:", body);

      from = body.From;
      messageBody = body.Body;

      if (messageBody && from) {
        return handleIncomingWhatsAppMessage(from, messageBody);
      }
    } else {
      body = await req.json() as DirectApiData;
      console.log("Direct API call received:", body);

      if (body.paymentData && body.from) {
        from = body.from;
        return handlePaymentVerification(body.paymentData, from);
      } else if (body.from && body.message) {
        from = body.from;
        messageBody = body.message;
        return handleIncomingWhatsAppMessage(from, messageBody);
      }
    }

    return NextResponse.json(
      { success: false, message: "Invalid request format" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error in WhatsApp webhook:", error);
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

async function handlePaymentVerification(paymentData: VerificationPaymentData, from: string) {
  try {
    console.log("Processing payment verification for:", paymentData.transactionId, "from:", from);

    const payment = await Payment.findOne({
      transactionId: paymentData.transactionId,
      done: true,
    }).lean() as PaymentData | null;

    if (!payment) {
      console.error("Payment not found:", paymentData.transactionId);
      return NextResponse.json(
        { success: false, message: `Payment not found for transaction ID: ${paymentData.transactionId}` },
        { status: 404 }
      );
    }

    // Ensure phone number is in correct format
    const normalizedFrom = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
    console.debug("Normalized phone number:", normalizedFrom);

    const { pdfUrl } = await generateReceiptPDF(payment, paymentData.transactionId);
    console.debug("Generated PDF URL:", pdfUrl);

    const receiptMessage = `🎉 Payment Successful!

📄 ISKCON Payment Receipt
👤 Name: ${payment.name}
💰 Amount: ₹${payment.amount.toLocaleString("en-IN")}
📱 Contact: ${payment.contactNo || "Not available"}
🆔 Transaction ID: ${payment.transactionId}
💳 Payment Method: ${paymentData.paymentMethod || payment.method || "Online"}
${payment.upiId ? `📱 UPI ID: ${payment.upiId}` : ""}
📅 Date: ${payment.updatedAt ? new Date(payment.updatedAt).toLocaleString("en-IN") : new Date().toLocaleString("en-IN")}
🏛️ Recipient: ${payment.to_user}

🙏 Thank you for your donation to ISKCON!
Hare Krishna! 🕉️`;

    await sendWhatsAppMessage(normalizedFrom, receiptMessage, [pdfUrl]);
    console.debug("WhatsApp message sent successfully to:", normalizedFrom);

    return NextResponse.json({
      success: true,
      message: "Receipt sent successfully",
      pdfUrl,
      transactionId: paymentData.transactionId,
    });
  } catch (error) {
    console.error("Error in payment verification:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error processing payment verification",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

async function handleIncomingWhatsAppMessage(from: string, messageBody: string) {
  try {
    console.log("Processing incoming WhatsApp message from:", from);

    const transactionIdMatch = messageBody.match(/(?:Transaction ID|TXN|ID)[\s:]*([A-Za-z0-9\-_]+)/i);

    if (!transactionIdMatch) {
      const helpMessage = `🙏 Welcome to ISKCON Payment System!

To get your payment receipt, please send your Transaction ID in this format:
"Transaction ID: YOUR_TRANSACTION_ID"

Or simply send just your Transaction ID.

🔍 Example:
Transaction ID: CASH-abc123-xyz
or
CASH-abc123-xyz

Need help? Contact our support team.
Hare Krishna! 🕉️`;

      const normalizedFrom = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
      await sendWhatsAppMessage(normalizedFrom, helpMessage);
      return NextResponse.json({ success: true, message: "Help message sent" });
    }

    const transactionId = transactionIdMatch[1].trim();
    console.log("Extracted Transaction ID:", transactionId);

    const payment = await Payment.findOne({
      transactionId: transactionId,
      done: true,
    }).lean() as PaymentData | null;

    if (!payment) {
      const notFoundMessage = `❌ Payment Not Found

Sorry, we couldn't find a completed payment with Transaction ID: ${transactionId}

Please check:
✅ Transaction ID is correct
✅ Payment is completed
✅ You're using the correct WhatsApp number

Need help? Contact our support team.
🙏 Hare Krishna!`;

      const normalizedFrom = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
      await sendWhatsAppMessage(normalizedFrom, notFoundMessage);
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found",
        },
        { status: 404 }
      );
    }

    const normalizedFrom = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
    const { pdfUrl } = await generateReceiptPDF(payment, transactionId);

    const receiptMessage = `✅ Receipt Found!

📄 ISKCON Payment Receipt
👤 Name: ${payment.name}
💰 Amount: ₹${payment.amount.toLocaleString("en-IN")}
📱 Contact: ${payment.contactNo || "Not available"}
🆔 Transaction ID: ${payment.transactionId}
💳 Method: ${payment.method === "cash" ? "Cash" : "Online"}
${payment.upiId && payment.upiId !== "Not available" ? `📱 UPI ID: ${payment.upiId}` : ""}
📅 Date: ${payment.updatedAt ? new Date(payment.updatedAt).toLocaleString("en-IN") : "N/A"}
🏛️ Recipient: ${payment.to_user}

🙏 Thank you for your donation to ISKCON!
Hare Krishna! 🕉️`;

    await sendWhatsAppMessage(normalizedFrom, receiptMessage, [pdfUrl]);
    console.debug("WhatsApp message sent successfully to:", normalizedFrom);

    return NextResponse.json({
      success: true,
      message: "Receipt sent successfully",
      transactionId: transactionId,
      pdfUrl,
    });
  } catch (error) {
    console.error("Error processing incoming message:", error);

    try {
      const normalizedFrom = from.startsWith("whatsapp:") ? from : `whatsapp:${from}`;
      await sendWhatsAppMessage(
        normalizedFrom,
        "🔧 Technical Error\n\nSorry, we're experiencing technical difficulties. Please try again later or contact support.\n\n🙏 Hare Krishna!"
      );
    } catch (sendError) {
      console.error("Error sending error message:", sendError);
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error processing message",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}