import { NextResponse, NextRequest } from "next/server";
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
  method?: string;
}

export async function POST(req: NextRequest) {
  await connectDb();

  try {
    console.log("WhatsApp webhook received");
    
    // Check content type to handle both Twilio webhooks and direct API calls
    const contentType = req.headers.get("content-type") || "";
    let body: any;
    let from: string;
    let messageBody: string;

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Twilio webhook format
      const formData = await req.formData();
      body = Object.fromEntries(formData.entries());
      console.log("Twilio Webhook received:", body);

      from = body.From as string;
      messageBody = body.Body as string;

      // Handle incoming WhatsApp message from Twilio
      if (messageBody && from) {
        return handleIncomingWhatsAppMessage(from, messageBody);
      }
    } else {
      // Direct API call (JSON format) - for payment verification
      body = await req.json();
      console.log("Direct API call received:", body);

      // Handle direct API calls for payment verification
      if (body.paymentData || (body.from && body.message)) {
        from = body.from;
        messageBody = body.message;
        
        // If it's a payment verification call, process it directly
        if (body.paymentData) {
          return handlePaymentVerification(body.paymentData, from);
        } else {
          return handleIncomingWhatsAppMessage(from, messageBody);
        }
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
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

async function handlePaymentVerification(paymentData: any, from: string) {
  try {
    console.log("Processing payment verification for:", paymentData.transactionId);

    // Find the payment in database
    const payment = await Payment.findOne({ 
      transactionId: paymentData.transactionId,
      done: true 
    }).lean() as PaymentDocument | null;

    if (!payment) {
      console.error("Payment not found:", paymentData.transactionId);
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Generate PDF receipt
    const { pdfUrl } = await generateReceiptPDF(payment, payment.transactionId);

    // Send WhatsApp message with receipt
    const receiptMessage = `🎉 Payment Successful!

📄 ISKCON Payment Receipt
👤 Name: ${payment.name}
💰 Amount: ₹${payment.amount.toLocaleString('en-IN')}
📱 Contact: ${payment.contactNo}
🆔 Transaction ID: ${payment.transactionId}
💳 Payment Method: ${paymentData.paymentMethod || 'Online'}
${payment.upiId ? `📱 UPI ID: ${payment.upiId}` : ''}
📅 Date: ${payment.updatedAt ? new Date(payment.updatedAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN')}
🏛️ Recipient: ${payment.to_user}

🙏 Thank you for your donation to ISKCON!
Hare Krishna! 🕉️`;

    await sendWhatsAppMessage(from, receiptMessage, [pdfUrl]);

    return NextResponse.json({
      success: true,
      message: "Receipt sent successfully",
      pdfUrl
    });

  } catch (error) {
    console.error("Error in payment verification:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Error processing payment verification",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

async function handleIncomingWhatsAppMessage(from: string, messageBody: string) {
  try {
    console.log("Processing incoming WhatsApp message from:", from);
    
    // Extract transaction ID from message
    const transactionIdMatch = messageBody.match(/(?:Transaction ID|TXN|ID)[\s:]*([A-Za-z0-9\-_]+)/i);
    
    if (!transactionIdMatch) {
      // Send help message
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

      await sendWhatsAppMessage(from, helpMessage);
      return NextResponse.json({ success: true, message: "Help message sent" });
    }

    const transactionId = transactionIdMatch[1].trim();
    console.log("Extracted Transaction ID:", transactionId);

    // Find payment in database
    const payment = await Payment.findOne({
      transactionId: transactionId,
      done: true
    }).lean() as PaymentDocument | null;

    if (!payment) {
      const notFoundMessage = `❌ Payment Not Found

Sorry, we couldn't find a completed payment with Transaction ID: ${transactionId}

Please check:
✅ Transaction ID is correct
✅ Payment is completed
✅ You're using the correct WhatsApp number

Need help? Contact our support team.
🙏 Hare Krishna!`;

      await sendWhatsAppMessage(from, notFoundMessage);
      return NextResponse.json({ 
        success: false, 
        message: "Payment not found" 
      }, { status: 404 });
    }

    // Generate PDF receipt
    const { pdfUrl } = await generateReceiptPDF(payment, transactionId);

    // Send receipt
    const receiptMessage = `✅ Receipt Found!

📄 ISKCON Payment Receipt
👤 Name: ${payment.name}
💰 Amount: ₹${payment.amount.toLocaleString('en-IN')}
📱 Contact: ${payment.contactNo}
🆔 Transaction ID: ${payment.transactionId}
💳 Method: ${payment.method === 'cash' ? 'Cash' : 'Online'}
${payment.upiId && payment.upiId !== 'Not available' ? `📱 UPI ID: ${payment.upiId}` : ''}
📅 Date: ${payment.updatedAt ? new Date(payment.updatedAt).toLocaleString('en-IN') : 'N/A'}
🏛️ Recipient: ${payment.to_user}

🙏 Thank you for your donation to ISKCON!
Hare Krishna! 🕉️`;

    await sendWhatsAppMessage(from, receiptMessage, [pdfUrl]);

    return NextResponse.json({
      success: true,
      message: "Receipt sent successfully",
      transactionId: transactionId,
      pdfUrl
    });

  } catch (error) {
    console.error("Error processing incoming message:", error);
    
    // Send error message to user
    try {
      await sendWhatsAppMessage(
        from, 
        "🔧 Technical Error\n\nSorry, we're experiencing technical difficulties. Please try again later or contact support.\n\n🙏 Hare Krishna!"
      );
    } catch (sendError) {
      console.error("Error sending error message:", sendError);
    }

    return NextResponse.json(
      { 
        success: false, 
        message: "Error processing message",
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}