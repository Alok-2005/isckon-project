"use client"
import { useState, useEffect, useCallback, useRef } from "react"
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
  ArrowPathIcon,
  BanknotesIcon,
  PhoneIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import dynamic from "next/dynamic"
import toast, { Toaster } from "react-hot-toast"

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
})
const Doughnut = dynamic(() => import("react-chartjs-2").then((mod) => mod.Doughnut), {
  ssr: false,
})

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement)

interface Payment {
  _id: string
  name: string
  contactNo: string
  amount: number
  transactionId: string
  razorpayPaymentId?: string
  upiId?: string
  to_user: string
  done: boolean
  updatedAt: string
  method?: string
}

interface Stats {
  totalRevenue: number
  totalPayments: number
  completedPayments: number
  pendingPayments: number
}

interface MonthlyRevenue {
  _id: { year: number; month: number }
  revenue: number
  count: number
}

interface DashboardData {
  payments: Payment[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: Stats
  monthlyRevenue: MonthlyRevenue[]
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [receiptPreviewUrl, setReceiptPreviewUrl] = useState<string | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateForm, setGenerateForm] = useState({
    name: "",
    amount: "",
    contactNo: "",
    to_user: "Temple Fund",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 10,
  })

  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const isInitialMount = useRef(true)

  const fetchData = useCallback(
    async (showToast = false): Promise<void> => {
      setLoading(true)
      setError("")

      try {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString())
          }
        })

        const url = `/api/admin/payments?${params.toString()}`
        console.debug("Fetching data from:", url)

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Invalid response format: Expected JSON")
        }

        const result = await response.json()
        console.debug("API Response:", result)

        if (!result.success || !result.data) {
          throw new Error(result.message || "Failed to fetch data")
        }

        setData(result.data as DashboardData)
        if (showToast) toast.success("Data refreshed successfully")
      } catch (err) {
        console.error("Error fetching data:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch data"
        setError(errorMessage)
        toast.error(`Failed to load data: ${errorMessage}`)
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  useEffect(() => {
    if (isInitialMount.current) {
      fetchData()
      isInitialMount.current = false
    }
  }, [fetchData])

  useEffect(() => {
    if (isInitialMount.current) return

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for search and filters only
    searchTimeoutRef.current = setTimeout(() => {
      // Reset to page 1 when searching/filtering
      setFilters((prev) => ({ ...prev, page: 1 }))
      fetchData()
    }, 500) // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters.search, filters.status, filters.dateFrom, filters.dateTo])

  useEffect(() => {
    if (isInitialMount.current) return

    // Only fetch if page or limit changed, not other filters
    const timeoutId = setTimeout(() => {
      fetchData()
    }, 50) // Very short delay to prevent conflicts

    return () => clearTimeout(timeoutId)
  }, [filters.page, filters.limit])

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchData(true) // Show toast for auto-refresh
    }, 60000)

    return () => clearInterval(intervalId)
  }, [fetchData])

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      // Reset page to 1 when changing filters (except for page and limit changes)
      ...(key !== "page" && key !== "limit" ? { page: 1 } : {}),
    }))
  }

  const handleExport = async (format: "csv" | "pdf") => {
  try {
    toast.loading(`Preparing ${format.toUpperCase()} export...`);

    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.append("dateTo", filters.dateTo);
    params.append("format", format);

    const response = await fetch(`/api/admin/export?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: format === "pdf" ? "application/pdf" : "text/csv",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Export failed: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();

    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payments-export-${new Date().toISOString().split("T")[0]}.${format}`;
    a.style.display = "none";

    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 100);

    toast.dismiss();
    toast.success(`${format.toUpperCase()} exported successfully`);
  } catch (err) {
    console.error("Export error:", err);
    toast.dismiss();
    toast.error(err instanceof Error ? err.message : "Export failed");
  }
};

  const handleViewReceipt = async (payment: Payment) => {
    try {
      toast.loading("Loading receipt...")

      // Try multiple possible endpoints for receipt
      const possibleEndpoints = [
        `/api/receipts/${payment.transactionId}`,
        `/api/admin/receipts/${payment.transactionId}`,
        `/api/receipts/download/${payment.transactionId}`,
      ]

      let response: Response | null = null
      let workingEndpoint = ""

      for (const endpoint of possibleEndpoints) {
        try {
          response = await fetch(endpoint, {
            method: "GET",
            headers: {
              Accept: "application/pdf",
            },
          })

          if (response.ok) {
            workingEndpoint = endpoint
            break
          }
        } catch (e) {
          console.log(`Endpoint ${endpoint} failed, trying next...`)
        }
      }

      if (!response || !response.ok) {
        throw new Error("Receipt not found or not available")
      }

      const blob = await response.blob()

      // Verify it's a PDF
      if (blob.type !== "application/pdf" && !blob.type.includes("pdf")) {
        throw new Error("Invalid receipt format received")
      }

      const url = URL.createObjectURL(blob)
      setReceiptPreviewUrl(url)

      toast.dismiss()
      toast.success("Receipt loaded successfully")
    } catch (err) {
      console.error("Error fetching receipt:", err)
      toast.dismiss()
      toast.error(err instanceof Error ? err.message : "Failed to load receipt")
    }
  }

  const handleGenerateReceipt = async () => {
    if (!generateForm.name || !generateForm.amount || !generateForm.contactNo || !generateForm.to_user) {
      toast.error("All fields are required")
      return
    }

    const contactRegex = /^\+91\d{10}$/
    if (!contactRegex.test(generateForm.contactNo)) {
      toast.error("Contact number must be in format +91xxxxxxxxxx")
      return
    }

    const amount = Number.parseFloat(generateForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/admin/generate-receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...generateForm,
          amount: amount,
          method: "cash",
          done: true,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success("Receipt generated and sent via WhatsApp successfully!")
        setShowGenerateModal(false)
        setGenerateForm({ name: "", amount: "", contactNo: "", to_user: "Temple Fund" })
        fetchData(true)
      } else {
        throw new Error(result.message || "Generation failed")
      }
    } catch (err) {
      console.error("Error generating receipt:", err)
      toast.error(err instanceof Error ? err.message : "Failed to generate receipt")
    } finally {
      setIsGenerating(false)
    }
  }

  const closeReceiptPreview = () => {
    if (receiptPreviewUrl) {
      URL.revokeObjectURL(receiptPreviewUrl)
    }
    setReceiptPreviewUrl(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-slate-200"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-indigo-600 absolute top-0 left-0"></div>
          </div>
          <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg border border-red-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Failed to load data</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => fetchData(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const chartData = {
    labels: data.monthlyRevenue.map((m) => {
      const date = new Date(m._id.year, m._id.month - 1, 1)
      return date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    }),
    datasets: [
      {
        label: "Revenue (₹)",
        data: data.monthlyRevenue.map((m) => m.revenue),
        backgroundColor: "rgba(99, 102, 241, 0.8)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const statusChartData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [data.stats.completedPayments, data.stats.pendingPayments],
        backgroundColor: ["#10b981", "#f59e0b"],
        borderWidth: 0,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Toaster position="top-right" />

      <div className="bg-white shadow-lg border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ISKCON Admin Dashboard
                </h1>
                <p className="mt-2 text-slate-600 text-lg">Manage payments, generate receipts, and view analytics</p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => fetchData(true)}
                  className="p-3 bg-indigo-100 rounded-full hover:bg-indigo-200 transition-colors group"
                  aria-label="Refresh data"
                >
                  <ArrowPathIcon className="h-5 w-5 text-indigo-600 group-hover:rotate-180 transition-transform duration-300" />
                </button>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Last updated</p>
                  <p className="text-lg font-semibold text-slate-900">{new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Total Revenue</p>
                <p className="text-3xl font-bold text-emerald-900">
                  ₹{data.stats.totalRevenue.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-emerald-600 flex items-center mt-1">
                  <ChartBarIcon className="h-3 w-3 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <CurrencyRupeeIcon className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Total Payments</p>
                <p className="text-3xl font-bold text-blue-900">{data.stats.totalPayments}</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <UsersIcon className="h-3 w-3 mr-1" />
                  Active transactions
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <BanknotesIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Completed</p>
                <p className="text-3xl font-bold text-green-900">{data.stats.completedPayments}</p>
                <p className="text-xs text-green-600">
                  {((data.stats.completedPayments / data.stats.totalPayments) * 100).toFixed(1)}% success rate
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Pending</p>
                <p className="text-3xl font-bold text-amber-900">{data.stats.pendingPayments}</p>
                <p className="text-xs text-amber-600">Requires attention</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <ClockIcon className="h-8 w-8 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-900 flex items-center">
                <ChartBarIcon className="h-6 w-6 mr-2 text-indigo-500" />
                Monthly Revenue Trend
              </h3>
              <div className="flex items-center text-sm text-slate-500">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Last 12 months
              </div>
            </div>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Revenue: ₹${context.parsed.y.toLocaleString()}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `₹${value.toLocaleString()}`,
                    },
                  },
                },
              }}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
            <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center">
              <CheckCircleIcon className="h-6 w-6 mr-2 text-green-500" />
              Payment Status
            </h3>
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "bottom" },
                  tooltip: {
                    callbacks: {
                      label: (context) => `${context.label}: ${context.parsed}`,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-slate-500" />
              Search & Filter
            </h3>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Generate Cash Receipt
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-4">
            <div className="relative lg:col-span-2">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search payments..."
                className="pl-10 w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>

            <input
              type="date"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
            />

            <input
              type="date"
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
            />

            <div className="flex space-x-2">
              <button
                onClick={() => handleExport("csv")}
                className="flex items-center px-9 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                CSV / EXCEL
              </button>
              {/* <button
                onClick={() => handleExport("pdf")}
                className="flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                PDF
              </button> */}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-purple-50">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center">
              <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-indigo-500" />
              Recent Payments
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Name & Recipient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-indigo-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{payment.name}</div>
                        <div className="text-sm text-slate-500">→ {payment.to_user}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900 font-medium">{payment.contactNo}</div>
                      {payment.upiId && <div className="text-xs text-slate-500">{payment.upiId}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-lg font-bold text-emerald-600">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600 font-mono bg-slate-100 px-2 py-1 rounded">
                        {payment.transactionId.substring(0, 12)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          payment.done
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(payment.updatedAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                      <div className="text-xs text-slate-400">
                        {new Date(payment.updatedAt).toLocaleTimeString("en-IN", { timeStyle: "short" })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
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

          <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => handleFilterChange("page", Math.min(data.pagination.pages, filters.page + 1))}
                disabled={filters.page >= data.pagination.pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Showing <span className="font-semibold">{(filters.page - 1) * filters.limit + 1}</span> to{" "}
                  <span className="font-semibold">{Math.min(filters.page * filters.limit, data.pagination.total)}</span>{" "}
                  of <span className="font-semibold">{data.pagination.total}</span> results
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={filters.limit}
                  onChange={(e) => handleFilterChange("limit", Number.parseInt(e.target.value))}
                  className="px-2 py-1 border border-slate-300 rounded-lg text-sm"
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                  <button
                    onClick={() => handleFilterChange("page", 1)}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    First
                  </button>
                  <button
                    onClick={() => handleFilterChange("page", Math.max(1, filters.page - 1))}
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, data.pagination.pages) }, (_, i) => {
                    const startPage = Math.max(1, filters.page - 2)
                    const page = startPage + i
                    if (page > data.pagination.pages) return null
                    return (
                      <button
                        key={page}
                        onClick={() => handleFilterChange("page", page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                          filters.page === page
                            ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                            : "bg-white border-slate-300 text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => handleFilterChange("page", Math.min(data.pagination.pages, filters.page + 1))}
                    disabled={filters.page >= data.pagination.pages}
                    className="relative inline-flex items-center px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => handleFilterChange("page", data.pagination.pages)}
                    disabled={filters.page >= data.pagination.pages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Last
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Name</label>
                <p className="text-slate-900 font-medium">{selectedPayment.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Amount</label>
                <p className="text-2xl font-bold text-emerald-600">₹{selectedPayment.amount.toLocaleString("en-IN")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Transaction ID</label>
                <p className="text-slate-900 font-mono text-sm bg-slate-100 p-2 rounded">
                  {selectedPayment.transactionId}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Status</label>
                <p className={`font-semibold ${selectedPayment.done ? "text-emerald-600" : "text-amber-600"}`}>
                  {selectedPayment.done ? "Completed" : "Pending"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">Method</label>
                <p className="text-slate-900">{selectedPayment.method || "Online"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {receiptPreviewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 relative">
            <button
              onClick={closeReceiptPreview}
              className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 transition-colors text-2xl z-10"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Receipt Preview</h3>
            <iframe
              src={receiptPreviewUrl}
              className="w-full h-96 border border-slate-300 rounded-lg"
              title="Receipt Preview"
              onError={() => {
                toast.error("Failed to load receipt preview")
                closeReceiptPreview()
              }}
            />
            <div className="mt-4 flex justify-end">
              <a
                href={receiptPreviewUrl}
                download="receipt.pdf"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Download Receipt
              </a>
            </div>
          </div>
        </div>
      )}

      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Generate Cash Receipt</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-2xl"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="pl-10 w-full px-3 py-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={generateForm.name}
                  onChange={(e) => setGenerateForm({ ...generateForm, name: e.target.value })}
                />
              </div>
              <div className="relative">
                <CurrencyRupeeIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  className="pl-10 w-full px-3 py-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={generateForm.amount}
                  onChange={(e) => setGenerateForm({ ...generateForm, amount: e.target.value })}
                />
              </div>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="Mobile Number (+91xxxxxxxxxx)"
                  className="pl-10 w-full px-3 py-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={generateForm.contactNo}
                  onChange={(e) => setGenerateForm({ ...generateForm, contactNo: e.target.value })}
                />
              </div>
              <div className="relative">
                <BanknotesIcon className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <select
                  className="pl-10 w-full px-3 py-3 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={generateForm.to_user}
                  onChange={(e) => setGenerateForm({ ...generateForm, to_user: e.target.value })}
                >
                  <option value="Temple Fund">Temple Fund</option>
                  <option value="Deity Fund">Deity Fund</option>
                  <option value="Food Distribution">Food Distribution</option>
                  <option value="Book Distribution">Book Distribution</option>
                  <option value="General Donation">General Donation</option>
                </select>
              </div>
              <button
                onClick={handleGenerateReceipt}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Generating...
                  </div>
                ) : (
                  "Generate and Send Receipt"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
