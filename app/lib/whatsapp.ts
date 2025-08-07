import Twilio from "twilio";
import PDFDocument from "pdfkit";
import { promises as fs } from "fs";
import path from "path";

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

interface PaymentData {
  name: string;
  amount: number;
  contactNo?: string;
  upiId?: string;
  transactionId: string;
  razorpayPaymentId?: string;
  updatedAt?: Date;
  to_user: string;
}

export const sendWhatsAppMessage = async (
  to: string, 
  body: string, 
  mediaUrl?: string[]
) => {
  try {
    const message = await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
      to,
      body,
      ...(mediaUrl && { mediaUrl }),
    });
    return message;
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
    throw error;
  }
};

export const generateReceiptPDF = async (
  payment: PaymentData, 
  transactionId: string
): Promise<{ fileName: string; pdfUrl: string; pdfBuffer: Buffer }> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      bufferPages: true,
      autoFirstPage: true
    });
    
    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', async () => {
      try {
        const pdfBuffer = Buffer.concat(buffers);
        
        // Save file
        const receiptsDir = path.join(process.cwd(), "public", "receipts");
        await fs.mkdir(receiptsDir, { recursive: true });
        const fileName = `receipt-${transactionId}-${Date.now()}.pdf`;
        const filePath = path.join(receiptsDir, fileName);
        
        // Save file asynchronously
        fs.writeFile(filePath, pdfBuffer).catch(err => 
          console.error('Error saving PDF file:', err)
        );
        
        const pdfUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/receipts/${fileName}`;
        
        resolve({ fileName, pdfUrl, pdfBuffer });
      } catch (error) {
        reject(error);
      }
    });
    doc.on('error', reject);

    // Generate PDF content
    doc.fontSize(18).text('ISKCON Payment Receipt', { align: 'center' });
    doc.moveDown(0.5);
    
    const receiptData = [
      `Name: ${payment.name || 'Unknown'}`,
      `Amount: ₹${payment.amount || 0}`,
      `Contact: ${payment.contactNo || 'Not available'}`,
      `UPI ID: ${payment.upiId || 'Not available'}`,
      `Transaction ID: ${payment.transactionId || 'Not available'}`,
      `Razorpay Payment ID: ${payment.razorpayPaymentId || 'Not available'}`,
      `Date: ${payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : 'N/A'}`,
      `Recipient: ${payment.to_user || 'N/A'}`
    ];

    doc.fontSize(11);
    receiptData.forEach(line => {
      doc.text(line);
      doc.moveDown(0.2);
    });

    doc.end();
  });
};