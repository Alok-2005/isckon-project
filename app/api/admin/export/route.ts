import { NextResponse } from "next/server";
import connectDb from "@/app/db/connectDb";
import Payment, { PaymentDocument } from "@/app/models/Payment";
import PDFDocument from "pdfkit";
import { FilterQuery } from "mongoose";

export async function GET(req: Request): Promise<Response | void> {
  await connectDb();

  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const status = searchParams.get('status');

    // Build query
    const query: FilterQuery<PaymentDocument> = {};
    
    if (status) {
      query.done = status === 'completed';
    }

    if (dateFrom || dateTo) {
      query.updatedAt = {};
      if (dateFrom) query.updatedAt.$gte = new Date(dateFrom);
      if (dateTo) query.updatedAt.$lte = new Date(dateTo);
    }

    const payments = await Payment.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Name',
        'Contact No',
        'Amount',
        'Transaction ID',
        'Razorpay Payment ID',
        'UPI ID',
        'Recipient',
        'Status',
        'Date'
      ];

      const csvRows = payments.map(payment => [
        payment.name || '',
        payment.contactNo || '',
        payment.amount || 0,
        payment.transactionId || '',
        payment.razorpayPaymentId || '',
        payment.upiId || '',
        payment.to_user || '',
        payment.done ? 'Completed' : 'Pending',
        payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payments-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });

    } else if (format === 'pdf') {
      // Generate PDF
      return new Promise<NextResponse>((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const buffers: Buffer[] = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);
          resolve(new NextResponse(pdfBuffer, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="payments-export-${new Date().toISOString().split('T')[0]}.pdf"`
            }
          }));
        });
        doc.on('error', reject);

        // PDF Header
        doc.fontSize(20).text('ISKCON Payments Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
        doc.moveDown(2);

        // Summary
        const totalRevenue = payments.filter(p => p.done).reduce((sum, p) => sum + (p.amount || 0), 0);
        const completedCount = payments.filter(p => p.done).length;
        
        doc.fontSize(14).text('Summary:', { underline: true });
        doc.fontSize(12);
        doc.text(`Total Payments: ${payments.length}`);
        doc.text(`Completed Payments: ${completedCount}`);
        doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString()}`);
        doc.moveDown(2);

        // Payment Details
        doc.fontSize(14).text('Payment Details:', { underline: true });
        doc.moveDown();

        payments.forEach((payment, index) => {
          if (index > 0) doc.moveDown();
          
          doc.fontSize(10);
          doc.text(`${index + 1}. ${payment.name || 'Unknown'} - ₹${payment.amount || 0}`);
          doc.text(`   Contact: ${payment.contactNo || 'N/A'}`);
          doc.text(`   Transaction ID: ${payment.transactionId || 'N/A'}`);
          doc.text(`   Status: ${payment.done ? 'Completed' : 'Pending'}`);
          doc.text(`   Date: ${payment.updatedAt ? new Date(payment.updatedAt).toLocaleString() : 'N/A'}`);
        });

        doc.end();
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid format' }, { status: 400 });

  } catch (error: unknown) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Export failed", 
        error: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}