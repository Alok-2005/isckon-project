import { NextResponse } from "next/server";
import connectDb from "@/app/db/connectDb";
import Payment, { PaymentDocument } from "@/app/models/Payment";
import { FilterQuery } from "mongoose";

export async function GET(req: Request) {
  await connectDb();

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const skip = (page - 1) * limit;

    // Build query
   const query: FilterQuery<PaymentDocument> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactNo: { $regex: search, $options: 'i' } },
        { transactionId: { $regex: search, $options: 'i' } },
        { to_user: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.done = status === 'completed';
    }

    if (dateFrom || dateTo) {
      query.updatedAt = {};
      if (dateFrom) query.updatedAt.$gte = new Date(dateFrom);
      if (dateTo) query.updatedAt.$lte = new Date(dateTo);
    }

    // Get payments with pagination
    const payments = await Payment.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count
    const total = await Payment.countDocuments(query);

    // Get statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $cond: [{ $eq: ["$done", true] }, "$amount", 0] } },
          totalPayments: { $sum: 1 },
          completedPayments: { $sum: { $cond: [{ $eq: ["$done", true] }, 1, 0] } },
          pendingPayments: { $sum: { $cond: [{ $eq: ["$done", false] }, 1, 0] } }
        }
      }
    ]);

    // Get monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      {
        $match: { done: true }
      },
      {
        $group: {
          _id: {
            year: { $year: "$updatedAt" },
            month: { $month: "$updatedAt" }
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      },
      {
        $limit: 12
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        stats: stats[0] || {
          totalRevenue: 0,
          totalPayments: 0,
          completedPayments: 0,
          pendingPayments: 0
        },
        monthlyRevenue
      }
    });

  } catch (error: unknown) {
    console.error("Error fetching payments:", error);
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