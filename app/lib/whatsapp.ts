import Twilio from "twilio";
import PDFDocument from "pdfkit";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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
    try {
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        autoFirstPage: true,
        font: 'Helvetica' // Use built-in font
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

      // Generate PDF content with better styling
      doc.fontSize(20).font('Helvetica-Bold').text('ISKCON Payment Receipt', { align: 'center' });
      doc.moveDown(0.5);
      
      // Add a line separator
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(1);
    
      const receiptData = [
        { label: 'Name', value: payment.name || 'Unknown' },
        { label: 'Amount', value: `₹${(payment.amount || 0).toLocaleString('en-IN')}` },
        { label: 'Contact', value: payment.contactNo || 'Not available' },
        { label: 'UPI ID', value: payment.upiId || 'Not available' },
        { label: 'Transaction ID', value: payment.transactionId || 'Not available' },
        { label: 'Razorpay Payment ID', value: payment.razorpayPaymentId || 'Not available' },
        { label: 'Date', value: payment.updatedAt ? new Date(payment.updatedAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN') },
        { label: 'Recipient', value: payment.to_user || 'N/A' }
      ];

      doc.fontSize(12).font('Helvetica');
      receiptData.forEach(item => {
        doc.font('Helvetica-Bold').text(`${item.label}: `, { continued: true });
        doc.font('Helvetica').text(item.value);
        doc.moveDown(0.3);
      });
      
      doc.moveDown(1);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown(0.5);
      doc.fontSize(10).text('Thank you for your donation to ISKCON!', { align: 'center' });
      doc.text('Hare Krishna!', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};