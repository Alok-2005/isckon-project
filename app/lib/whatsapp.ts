import Twilio from "twilio";
import jsPDF from "jspdf";
import { promises as fs } from "fs";
import path from "path";

interface TwilioError extends Error {
  code: number;
  status: number;
  moreInfo?: string;
}

interface MessageOptions {
  from: string;
  to: string;
  body?: string;
  mediaUrl?: string[];
}

export const sendWhatsAppMessage = async (
  to: string,
  body: string,
  mediaUrl?: string[]
) => {
  try {
    console.log(`Sending WhatsApp message to: ${to}`);
    console.log(`Message body: ${body.substring(0, 100)}...`);

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured");
    }

    const twilioClient = Twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const messageOptions: MessageOptions = {
      from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
      to,
    };

    if (mediaUrl && mediaUrl.length > 0) {
      messageOptions.mediaUrl = mediaUrl;
      messageOptions.body = body || "";
    } else {
      messageOptions.body = body || "";
    }

    const message = await twilioClient.messages.create(messageOptions);
    console.log(`WhatsApp message sent successfully. SID: ${message.sid}`);
    return message;

  } catch (error) {
    console.error("Error sending WhatsApp message:", error);

    if (error instanceof Error && "code" in error) {
      console.error("Twilio error code:", (error as TwilioError).code);
      console.error("Twilio error message:", error.message);
    }

    throw error;
  }
};

export interface PaymentData {
  name: string;
  amount: number;
  contactNo?: string;
  upiId?: string;
  transactionId?: string;
  razorpayPaymentId?: string;
  updatedAt?: Date;
  to_user: string;
  method?: "cash" | "online";
  purpose?: string;
}

export const generateReceiptPDF = async (
  payment: PaymentData
): Promise<{ fileName: string; pdfUrl: string; pdfBuffer: Buffer }> => {
  try {
    console.log(`Generating PDF for ${payment.method === "cash" ? "cash" : "online"} receipt`);

    // ✅ Use jsPDF instead of PDFKit (no font file dependencies)
    const doc = new jsPDF();
    const isCash = payment.method === "cash";

    // Header
    doc.setFontSize(22);
    doc.text("ISKCON", 105, 25, { align: "center" });
    doc.setFontSize(18);
    doc.text("Payment Receipt", 105, 40, { align: "center" });

    // Header line
    doc.line(20, 50, 190, 50);

    // Receipt details
    doc.setFontSize(12);
    let yPos = 65;
    const lineHeight = 8;

    doc.text(`Name: ${payment.name || "Unknown"}`, 25, yPos);
    yPos += lineHeight;

    doc.text(`Amount: Rs. ${(payment.amount || 0).toLocaleString("en-IN")}`, 25, yPos);
    yPos += lineHeight;

    doc.text(`Purpose: ${payment.purpose || "General Donation"}`, 25, yPos);
    yPos += lineHeight;

    doc.text(`Contact: ${payment.contactNo || "Not available"}`, 25, yPos);
    yPos += lineHeight;

    doc.text(`Payment Method: ${isCash ? "Cash Payment" : "Online Payment"}`, 25, yPos);
    yPos += lineHeight;

    // Show Receipt ID for cash, Transaction ID for online
    if (payment.transactionId) {
      const idLabel = isCash ? "Receipt ID" : "Transaction ID";
      doc.text(`${idLabel}: ${payment.transactionId}`, 25, yPos);
      yPos += lineHeight;
    }

    // Only for online payments
    if (!isCash) {
      if (payment.upiId && payment.upiId !== "Not available") {
        doc.text(`UPI ID: ${payment.upiId}`, 25, yPos);
        yPos += lineHeight;
      }
      if (payment.razorpayPaymentId && payment.razorpayPaymentId !== "Not available") {
        doc.text(`Razorpay Payment ID: ${payment.razorpayPaymentId}`, 25, yPos);
        yPos += lineHeight;
      }
    }

    const dateTime = payment.updatedAt
      ? new Date(payment.updatedAt).toLocaleString("en-IN")
      : new Date().toLocaleString("en-IN");

    doc.text(`Date & Time: ${dateTime}`, 25, yPos);
    yPos += lineHeight;

    doc.text(`Recipient: ${payment.to_user || "N/A"}`, 25, yPos);
    yPos += lineHeight + 5;

    // Footer line
    doc.line(20, yPos, 190, yPos);
    yPos += 15;

    // Footer
    doc.setFontSize(14);
    doc.text("Thank you for your donation to ISKCON!", 105, yPos, { align: "center" });
    yPos += 10;

    doc.setFontSize(11);
    doc.text("Your contribution helps in spreading Krishna Consciousness", 105, yPos, { align: "center" });
    yPos += 10;

    doc.setFontSize(14);
    doc.text("Hare Krishna!", 105, yPos, { align: "center" });
    yPos += 15;

    doc.setFontSize(9);
    doc.text("This is a computer-generated receipt. For queries, contact ISKCON support.", 105, yPos, { align: "center" });
    yPos += 8;

    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 105, yPos, { align: "center" });

    // Convert PDF to buffer
    const pdfArrayBuffer = doc.output('arraybuffer');
    const pdfBuffer = Buffer.from(pdfArrayBuffer);

    console.log(`PDF generated successfully. Size: ${pdfBuffer.length} bytes`);

    // Save PDF file
    const receiptsDir = path.join(process.cwd(), "public", "receipts");
    await fs.mkdir(receiptsDir, { recursive: true });

    const baseName = payment.method === "cash"
      ? `cash-receipt-${Date.now()}`
      : `receipt-${(payment.transactionId || "txn")}-${Date.now()}`;

    const fileName = `${baseName}.pdf`;
    const filePath = path.join(receiptsDir, fileName);

    await fs.writeFile(filePath, pdfBuffer);
    console.log(`PDF saved to: ${filePath}`);

    // Generate PDF URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || "http://localhost:3000";
    const normalizedBase = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
    const pdfUrl = `${normalizedBase}/receipts/${fileName}`;

    console.log(`PDF URL: ${pdfUrl}`);

    return { fileName, pdfUrl, pdfBuffer };

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};