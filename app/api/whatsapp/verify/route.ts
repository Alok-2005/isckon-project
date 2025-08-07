import { NextResponse } from "next/server";
import connectDb from "@/app/db/connectDb";
import Payment from "@/app/models/Payment";
import { generateReceiptPDF, sendWhatsAppMessage } from "@/app/lib/whatsapp";

// Define the expected PaymentDocument structure
interface PaymentDocument {
  _id?: string;
  name: string;
  contactNo: string;
  amount: number;
  transactionId: string;
  oid?: string;
  to_user: string;
  done: boolean;
  upiId?: string;
  razorpayPaymentId?: string;
  updatedAt?: Date;
}

export async function POST(req: Request) {
  await connectDb();

  const timeoutId = setTimeout(() => {
    console.error("Request timed out after 12 seconds");
  }, 12000);

  try {
    const startTime = Date.now();
    let from: string;
    let message: string;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = await req.formData();
      const params = Object.fromEntries(body.entries()) as Record<string, FormDataEntryValue>;
      console.log("Twilio Webhook Body:", JSON.stringify(params, null, 2));

      from = typeof params["From"] === "string" ? params["From"] : "";
      message = typeof params["Body"] === "string" ? params["Body"] : "";
    } else {
      const body: { from: string; message: string } = await req.json();
      console.log("JSON POST Body:", JSON.stringify(body, null, 2));
      from = body.from;
      message = body.message;
    }

    if (!from || !message) {
      console.error("Missing from or message in request");
      await sendWhatsAppMessage(
        from || "whatsapp:+1234567890",
        "Invalid request. Please provide a valid message."
      );
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, message: "Missing from or message" },
        { status: 400 }
      );
    }

    const transactionIdMatch = message.match(/Transaction ID:\s*([^\n\r]+)/i);
    if (!transactionIdMatch) {
      console.error("No Transaction ID found in message:", message);
      await sendWhatsAppMessage(
        from,
        "Invalid message format. Please include the Transaction ID."
      );
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, message: "Invalid message format" },
        { status: 400 }
      );
    }

    const transactionId = transactionIdMatch[1].trim();
    console.log(
      "Extracted Transaction ID:",
      transactionId,
      `Time: ${Date.now() - startTime}ms`
    );

    const payment = (await Payment.findOne(
      { transactionId, done: true },
      "name amount contactNo upiId transactionId razorpayPaymentId updatedAt to_user"
    ).lean()) as PaymentDocument | null;

    if (!payment) {
      console.error("Payment not found or not completed:", transactionId);
      await sendWhatsAppMessage(
        from,
        "Payment not found or not completed. Please check your Transaction ID."
      );
      clearTimeout(timeoutId);
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    console.log("Payment Found:", `Time: ${Date.now() - startTime}ms`);

    // Generate PDF and get URL
    const {  pdfUrl } = await generateReceiptPDF(payment, transactionId);
    console.log("PDF Generated:", `Time: ${Date.now() - startTime}ms`);

    // Send WhatsApp message with PDF
    const messagePromise = sendWhatsAppMessage(
      from,
      "Thank you for your payment to ISKCON! Here is your receipt.",
      [pdfUrl]
    );

    clearTimeout(timeoutId);
    const totalTime = Date.now() - startTime;
    console.log(`Total processing time: ${totalTime}ms`);

    const response = NextResponse.json({
      success: true,
      message: "Receipt sent",
      pdfUrl,
      processingTime: totalTime,
    });

    // Handle message sending result asynchronously
    messagePromise
      .then(() => console.log("PDF Sent to:", from))
      .catch((err) => console.error("Error sending WhatsApp message:", err));

    return response;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      console.error("Error in WhatsApp webhook:", error.message, error.stack);

      sendWhatsAppMessage(
        req.headers.get("from") || "whatsapp:+1234567890",
        "An error occurred. Please try again later."
      ).catch((sendError) =>
        console.error("Error sending error message:", sendError)
      );

      return NextResponse.json(
        { success: false, message: "Server error", error: error.message },
        { status: 500 }
      );
    } else {
      console.error("Unknown error in WhatsApp webhook:", error);
      return NextResponse.json(
        { success: false, message: "Server error", error: String(error) },
        { status: 500 }
      );
    }
  }
}
