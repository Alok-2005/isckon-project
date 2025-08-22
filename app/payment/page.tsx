"use client";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { v4 as uuidv4 } from "uuid";
import { UserIcon, PhoneIcon, CurrencyRupeeIcon, ClipboardDocumentListIcon, ChevronUpDownIcon } from "@heroicons/react/24/outline";
import { toast, Toaster } from "react-hot-toast";

// Define an interface for Razorpay's response
interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Define Razorpay interfaces
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayConstructor {
  new (options: RazorpayOptions): RazorpayInstance;
}

// Extend the global Window interface with typed Razorpay
declare global {
  interface Window {
    Razorpay: RazorpayConstructor;
  }
}

interface FormData {
  name: string;
  contactNo: string;
  purpose: string;
  amount: string;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    contactNo: "",
    purpose: "",
    amount: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.body.removeChild(script);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePurposeSelect = (purpose: string) => {
    setFormData((prev) => ({ ...prev, purpose }));
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Function to format phone number with country code
  const formatPhoneNumber = (phone: string): string => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // If the number already starts with a country code, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // For Indian numbers (10 digits), add +91
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    
    // For numbers with country code already included but without +
    if (cleaned.length > 10) {
      return `+${cleaned}`;
    }
    
    // Return the original if it doesn't match expected patterns
    return phone;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.name || !formData.contactNo || !formData.purpose || !formData.amount) {
      setError("All fields are required");
      setIsLoading(false);
      return;
    }

    // Format the phone number before validation
    const formattedContactNo = formatPhoneNumber(formData.contactNo);
    
    if (!/^\+[1-9]\d{1,14}$/.test(formattedContactNo)) {
      setError("Invalid contact number (e.g., 9876543210 or +919876543210)");
      setIsLoading(false);
      return;
    }
    
    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Invalid amount");
      setIsLoading(false);
      return;
    }

    try {
      const transactionId = uuidv4();
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          contactNo: formattedContactNo, // Use the formatted phone number
          amount: amountNum,
          transactionId,
          to_user: "default_user",
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.message || "Failed to create order");
        setIsLoading(false);
      } else {
        const options = {
          key: "rzp_test_LauiieS7mt98Bs",
          amount: amountNum * 100,
          currency: "INR",
          name: "ISKCON Payment Portal",
          description: `Payment by ${formData.name} for ${formData.purpose}`,
          order_id: data.orderId,
          handler: function (response: RazorpayResponse) {
            fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                transactionId,
              }),
            })
              .then((res) => res.json())
              .then((verifyData) => {
                if (verifyData.success) {
                  toast.success("Payment successful! Receipt has been sent to your WhatsApp.");
                  // Reset form after successful payment
                  setFormData({
                    name: "",
                    contactNo: "",
                    purpose: "",
                    amount: "",
                  });
                } else {
                  setError("Payment verification failed: " + verifyData.message);
                }
              })
              .catch((err) => {
                setError("Error verifying payment: " + (err as Error).message);
              });
          },
          prefill: {
            name: formData.name,
            contact: formattedContactNo.replace(/^\+/, ""), // Remove + for Razorpay prefill
          },
          theme: { color: "#3399cc" },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err: unknown) {
      setError("Error initiating payment: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  const purposeOptions = [
    "General Donation",
    "Temple Construction",
    "Deity Worship",
    "Food Distribution",
    "Book Distribution",
    "Festival Celebration",
    "Cow Protection",
    "Education",
    "Medical Aid",
    "Other"
  ];

  return (
    <div className="min-h-screen bg-purple-100/50 flex items-center justify-center p-4">
      <Toaster/>
      <Head>
        <title>Shri Gauranga Dham payment portal</title>
      </Head>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl">
        <h1 className="text-3xl font-bold  text-center text-black">Shri Gauranga Dham</h1>
        <h1 className="text-2xl font-semibold mb-6 text-center text-black">ISKCON Payment Form</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <UserIcon className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="pl-10 mt-1 p-3 w-full border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 placeholder:text-gray-400"
              required
              placeholder="Enter your name"
            />
          </div>
          
          <div className="relative">
            <label htmlFor="contactNo" className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number
            </label>
            <PhoneIcon className="absolute left-3  top-10 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              id="contactNo"
              name="contactNo"
              value={formData.contactNo}
              onChange={handleInputChange}
              className="pl-10 mt-1 p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-black"
              required
              placeholder="Enter your 10-digit mobile number"
            />
          </div>

          {/* Animated Dropdown for Purpose */}
          <div className="relative" ref={dropdownRef}>
            <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
              Purpose
            </label>
            <ClipboardDocumentListIcon className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <div 
              className="pl-10 mt-1 p-3 w-full border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white flex items-center justify-between cursor-pointer"
              onClick={toggleDropdown}
            >
              <span className={formData.purpose ? "text-black" : "text-gray-400"}>
                {formData.purpose || "Select Purpose"}
              </span>
              <ChevronUpDownIcon className="h-5 w-5 text-gray-400 transition-transform duration-300" />
            </div>
            
            {/* Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all duration-300 transform origin-top">
                <div className="max-h-60 overflow-y-auto">
                  {purposeOptions.map((option) => (
                    <div
                      key={option}
                      className={`px-4 py-3 cursor-pointer transition-colors duration-200 ${
                        formData.purpose === option
                          ? "bg-purple-100 text-purple-800"
                          : "hover:bg-gray-100 text-gray-800"
                      }`}
                      onClick={() => handlePurposeSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="relative">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹)
            </label>
            <CurrencyRupeeIcon className="absolute left-3 top-10 h-5 w-5 text-gray-400" />
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="pl-10 mt-1 p-3 w-full border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 placeholder:text-gray-400"
              required
              min="1"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center animate-pulse">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-500 text-white p-3 rounded-lg cursor-pointer hover:bg-purple-600 transition duration-300 font-semibold"
          >
            {isLoading ? "Processing..." : "Proceed to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}