
import Twilio from "twilio";
import PDFDocument from "pdfkit";
import { promises as fs } from "fs";
import path from "path";

// Define TwilioError type
interface TwilioError extends Error {
  code: number;
  status: number;
  moreInfo?: string;
}

// Initialize Twilio client inside function to avoid module-level env issues
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

    const messageOptions = {
      from: process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886",
      to,
      body,
      mediaUrl,
    };

    const message = await twilioClient.messages.create(messageOptions);
   
    console.log(`WhatsApp message sent successfully. SID: ${message.sid}`);
    return message;
   
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
   
    // Log specific Twilio errors
    if (error instanceof Error && 'code' in error) {
      console.error("Twilio error code:", (error as TwilioError).code);
      console.error("Twilio error message:", error.message);
    }
   
    throw error;
  }
};

// Remove unnecessary IPDFDocument interface, use PDFKit.PDFDocument directly

export interface PaymentData {
  name: string;
  amount: number;
  contactNo?: string;
  upiId?: string;
  transactionId: string;
  razorpayPaymentId?: string;
  updatedAt?: Date;
  to_user: string;
  method?: string;
}

export const generateReceiptPDF = async (
  payment: PaymentData,
  transactionId: string
): Promise<{ fileName: string; pdfUrl: string; pdfBuffer: Buffer }> => {
  return new Promise((resolve, reject) => {
    try {
      console.log(`Generating PDF for transaction: ${transactionId}`);
     
      const doc = new PDFDocument({
        size: 'A4',
        bufferPages: true,
        autoFirstPage: true,
        font: 'Helvetica'
      }) as PDFKit.PDFDocument;
   
      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', async () => {
        try {
          const pdfBuffer = Buffer.concat(buffers);
          console.log(`PDF generated successfully. Size: ${pdfBuffer.length} bytes`);
       
          // Ensure receipts directory exists
          const receiptsDir = path.join(process.cwd(), "public", "receipts");
          await fs.mkdir(receiptsDir, { recursive: true });
         
          const fileName = `receipt-${transactionId}-${Date.now()}.pdf`;
          const filePath = path.join(receiptsDir, fileName);
       
          // Save file asynchronously
          await fs.writeFile(filePath, pdfBuffer);
          console.log(`PDF saved to: ${filePath}`);
       
          // Generate URL based on environment
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                          process.env.VERCEL_URL ||
                          'http://localhost:3000';
         
          const pdfUrl = `${baseUrl}/receipts/${fileName}`;
          console.log(`PDF URL: ${pdfUrl}`);
       
          resolve({ fileName, pdfUrl, pdfBuffer });
        } catch (error) {
          console.error("Error saving PDF:", error);
          reject(error);
        }
      });
     
      doc.on('error', (error) => {
        console.error("PDF generation error:", error);
        reject(error);
      });
      // Generate enhanced PDF content
      generatePDFContent(doc, payment, transactionId);
     
    } catch (error) {
      console.error("Error initializing PDF generation:", error);
      reject(error);
    }
  });
};

function generatePDFContent(doc: PDFKit.PDFDocument, payment: PaymentData, transactionId: string) {
  // Header with logo area (you can add logo later)
  doc.fontSize(24).font('Helvetica-Bold')
     .text('🏛️ ISKCON', { align: 'center' });
 
  doc.fontSize(20).font('Helvetica-Bold')
     .text('Payment Receipt', { align: 'center' });
 
  doc.moveDown(0.5);
 
  // Add decorative line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
  // Receipt details in a structured format
  const receiptData = [
    { label: '👤 Name', value: payment.name || 'Unknown' },
    { label: '💰 Amount', value: `₹${(payment.amount || 0).toLocaleString('en-IN')}` },
    { label: '📱 Contact', value: payment.contactNo || 'Not available' },
    { label: '🆔 Transaction ID', value: payment.transactionId || transactionId },
    { label: '💳 Payment Method', value: payment.method === 'cash' ? 'Cash Payment' : 'Online Payment' },
  ];
  // Add UPI ID only for online payments
  if (payment.method !== 'cash' && payment.upiId && payment.upiId !== 'Not available') {
    receiptData.push({ label: '📱 UPI ID', value: payment.upiId });
  }
  // Add Razorpay Payment ID only for online payments
  if (payment.method !== 'cash' && payment.razorpayPaymentId && payment.razorpayPaymentId !== 'Not available') {
    receiptData.push({ label: '🏦 Razorpay Payment ID', value: payment.razorpayPaymentId });
  }
  receiptData.push(
    { label: '📅 Date & Time', value: payment.updatedAt ? new Date(payment.updatedAt).toLocaleString('en-IN') : new Date().toLocaleString('en-IN') },
    { label: '🏛️ Recipient', value: payment.to_user || 'N/A' }
  );
  // Style the receipt data
  doc.fontSize(12).font('Helvetica');
  receiptData.forEach((item, index) => {
    const yPosition = doc.y;
   
    // Create a subtle background for alternating rows
    if (index % 2 === 0) {
      doc.rect(45, yPosition - 5, 510, 25).fillAndStroke('#f8f9fa', '#e9ecef');
    }
   
    doc.fillColor('#000000')
       .font('Helvetica-Bold')
       .text(item.label, 55, yPosition, { width: 150, continued: true });
      
    doc.font('Helvetica')
       .text(`: ${item.value}`, { width: 350 });
   
    doc.moveDown(0.5);
  });
 
  doc.moveDown(1);
 
  // Add decorative line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(1);
 
  // Footer with thank you message
  doc.fontSize(14).font('Helvetica-Bold')
     .text('🙏 Thank you for your donation to ISKCON!', { align: 'center' });
 
  doc.fontSize(12).font('Helvetica')
     .text('Your contribution helps in spreading Krishna Consciousness', { align: 'center' });
 
  doc.moveDown(0.5);
  doc.fontSize(16).font('Helvetica-Bold')
     .text('🕉️ Hare Krishna! 🕉️', { align: 'center' });
 
  // Add footer note
  doc.moveDown(1);
  doc.fontSize(8).font('Helvetica')
     .text('This is a computer-generated receipt. For queries, contact ISKCON support.', { align: 'center' });
 
  doc.moveDown(0.5);
  doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
  // End the document
  doc.end();
}
