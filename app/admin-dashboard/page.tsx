"use client";
import { useState, useEffect } from "react";
import {
  UsersIcon,
  CurrencyRupeeIcon,
  DocumentArrowDownIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  CalendarIcon,
  EyeIcon,
  PlusIcon,
  // RefreshIcon,
} from "@heroicons/react/24/outline";
import {Chart} from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import toast, { Toaster } from "react-hot-toast";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface Payment {
  _id: string;
  name: string;
  contactNo: string;
  amount: number;
  transactionId: string;
  razorpayPaymentId?: string;
  upiId?: string;
  to_user: string;
  done: boolean;
  updatedAt: string;
  method?: string; // Added for cash/other methods
}

interface Stats {
  totalRevenue: number;
  totalPayments: number;
  completedPayments: number;
  pendingPayments: number;
}

interface MonthlyRevenue {
  _id: { year: number; month: number };
  revenue: number;
  count: number;
}

interface DashboardData {
  payments: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats: Stats;
  monthlyRevenue: MonthlyRevenue[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({ name: "", amount: "", contactNo: "", to_user: "" });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 10,
  });

  const fetchData = async (showToast = false) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });

      const response = await fetch(`/api/admin/payments?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setData(result.data);
        if (showToast) toast.success("Data refreshed successfully");
      } else {
        throw new Error(result.message || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 60000); // Auto-refresh every 60s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      params.append("format", format);

      const response = await fetch(`/api/admin/export?${params}`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `payments-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`${format.toUpperCase()} exported successfully`);
      } else {
        throw new Error("Export failed");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Export failed");
    }
  };

  const handleViewReceipt = async (payment: Payment) => {
    try {
      const response = await fetch(`/api/receipts/${payment.transactionId}.pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setReceiptPreviewUrl(url);
      } else {
        toast.error("Receipt not available");
      }
    } catch (err) {
      console.error("Error fetching receipt:", err);
      toast.error("Failed to load receipt");
    }
  };

  const handleGenerateReceipt = async () => {
    if (!generateForm.name || !generateForm.amount || !generateForm.contactNo || !generateForm.to_user) {
      toast.error("All fields are required");
      return;
    }

    try {
      const response = await fetch("/api/admin/generate-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...generateForm, method: "cash", done: true }),
      });

      if (response.ok) {
        const { pdfUrl } = await response.json();
        toast.success("Receipt generated and sent via WhatsApp");
        setShowGenerateModal(false);
        setGenerateForm({ name: "", amount: "", contactNo: "", to_user: "" });
        fetchData(true); // Refresh data
      } else {
        throw new Error("Generation failed");
      }
    } catch (err) {
      console.error("Error generating receipt:", err);
      toast.error("Failed to generate receipt");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-orange-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-orange-500 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-orange-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to load data</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Chart Data for Monthly Revenue
  const chartData = {
    labels: data.monthlyRevenue.map((m) => new Date(m._id.year, m._id.month - 1).toLocaleDateString("en-US", { month: "short" })),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.monthlyRevenue.map((m) => m.revenue),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <Toaster position="top-right" />
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  ISKCON Admin Dashboard
                </h1>
                <p className="mt-2 text-gray-600 text-lg">Manage payments, generate receipts, and view analytics</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fetchData(true)}
                  className="p-2 bg-orange-100 rounded-full hover:bg-orange-200 transition-colors"
                  aria-label="Refresh data"
                >
                  {/* <RefreshIcon className="h-5 w-5 text-orange-600" /> */}
                </button>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Last updated</p>
                  <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900">₹{data.stats.totalRevenue.toLocaleString("en-IN")}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">+12% from last month</p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-6 border border-blue-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Payments</p>
                <p className="text-3xl font-bold text-blue-900">{data.stats.totalPayments}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <ChartBarIcon className="h-3 w-3 mr-1" />
                  Active transactions
                </p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <UsersIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-emerald-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Completed</p>
                <p className="text-3xl font-bold text-emerald-900">{data.stats.completedPayments}</p>
                <p className="text-xs text-emerald-600">
                  {((data.stats.completedPayments / data.stats.totalPayments) * 100).toFixed(1)}% success rate
                </p>
              </div>
              <div className="bg-emerald-200 p-3 rounded-full">
                <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl shadow-lg p-6 border border-yellow-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending</p>
                <p className="text-3xl font-bold text-yellow-900">{data.stats.pendingPayments}</p>
                <p className="text-xs text-yellow-600">Requires attention</p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-orange-500" />
              Monthly Revenue Trend
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Last 12 months
            </div>
          </div>
          <Chart type="bar" data={chartData} options={{ responsive: true, plugins: { legend: { position: "top" } } }} />
        </div>

        {/* Filters, Export, and Generate Receipt Button */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-gray-500" />
              Search & Filter
            </h3>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Generate Cash Receipt
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="relative lg:col-span-2">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>

            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />

            <input
              type="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />

            <div className="flex space-x-2">
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                CSV
              </button>
              <button
                onClick={() => handleExport("pdf")}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-orange-500" />
              Recent Payments
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name & Recipient</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Transaction</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-orange-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{payment.name}</div>
                        <div className="text-sm text-gray-500">→ {payment.to_user}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">{payment.contactNo}</div>
                      {payment.upiId && <div className="text-xs text-gray-500">{payment.upiId}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-green-600">₹{payment.amount.toLocaleString("en-IN")}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                        {payment.transactionId.substring(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          payment.done
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                        }`}
                      >
                        {payment.done ? (
                          <>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Completed
                          </>
                        ) : (
                          <>
                            <ClockIcon className="h-3 w-3 mr-1" />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      <div className="text-xs text-gray-400">
                        {new Date(payment.updatedAt).toLocaleTimeString("en-IN", { timeStyle: "short" })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-orange-600 hover:text-orange-900 transition-colors"
                        aria-label="View details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {payment.done && (
                        <button
                          onClick={() => handleViewReceipt(payment)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          aria-label="View receipt"
                        >
                          <DocumentArrowDownIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange("page", Math.min(data.pagination.pages, filters.page + 1))}
                disabled={filters.page === data.pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-semibold">{(filters.page - 1) * filters.limit + 1}</span> to{" "}
                  <span className="font-semibold">{Math.min(filters.page * filters.limit, data.pagination.total)}</span> of{" "}
                  <span className="font-semibold">{data.pagination.total}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange("limit", parseInt(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                  <button
                    onClick={() => handleFilterChange("page", 1)}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                    const page = filters.page - 2 + i;
                    if (page < 1 || page > data.pagination.pages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => handleFilterChange("page", page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                          filters.page === page
                            ? "z-10 bg-orange-50 border-orange-500 text-orange-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleFilterChange("page", Math.min(data.pagination.pages, filters.page + 1))}
                    disabled={filters.page === data.pagination.pages}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handleFilterChange("page", data.pagination.pages)}
                    disabled={filters.page === data.pagination.pages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    Last
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-gray-900 font-medium">{selectedPayment.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-black-500">Amount</label>
                <p className="text-2xl font-bold text-green-600">₹{selectedPayment.amount.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Transaction ID</label>
                <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">{selectedPayment.transactionId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className={`font-semibold ${selectedPayment.done ? "text-green-600" : "text-yellow-600"}`}>
                  {selectedPayment.done ? "Completed" : "Pending"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Method</label>
                <p className="text-gray-900">{selectedPayment.method || "Online"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {receiptPreviewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 relative">
            <button
              onClick={() => setReceiptPreviewUrl(null)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Preview</h3>
            <iframe src={receiptPreviewUrl} className="w-full h-96 border border-gray-300" title="Receipt Preview" />
          </div>
        </div>
      )}

      {/* Generate Receipt Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Generate Cash Receipt</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                value={generateForm.name}
                onChange={(e) => setGenerateForm({ ...generateForm, name: e.target.value })}
              />
              <input
                type="number"
                placeholder="Amount (₹)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                value={generateForm.amount}
                onChange={(e) => setGenerateForm({ ...generateForm, amount: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Mobile Number (with +91)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                value={generateForm.contactNo}
                onChange={(e) => setGenerateForm({ ...generateForm, contactNo: e.target.value })}
              />
              <input
                type="text"
                placeholder="Recipient (e.g., Temple Fund)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-black"
                value={generateForm.to_user}
                onChange={(e) => setGenerateForm({ ...generateForm, to_user: e.target.value })}
              />
              <button
                onClick={handleGenerateReceipt}
                className="w-full px-4 py-2 bg-orange-500 text-black rounded-lg hover:bg-orange-600 transition-colors"
              >
                Generate and Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
