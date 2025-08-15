"use client"

import { Eye, Heart, Users, Radio, Music, CreditCard, Gift, Calendar } from "lucide-react"

function DiscoverMore() {
  const leftItems = [
    {
      title: "Daily",
      description: "Darshan",
      icon: Eye,
    },
    {
      title: "Life",
      description: "Meditation",
      icon: Heart,
    },
    {
      title: "Youth",
      description: "Program",
      icon: Users,
    },
    {
      title: "LIVE",
      description: "Darshan",
      icon: Radio,
    },
    
  ]

  const rightItems = [
    {
      title: "Membership",
      description: "Support the temple activities",
      icon: CreditCard,
    },
    {
      title: "Donate",
      description: "View the ekadasis and other festival date",
      icon: Gift,
    },
    {
      title: "Vaishnav Calendar",
      description: "The All-in-one Krishna app",
      icon: Calendar,
    },
    {
      title: "Mantra",
      description: "Other initiatives",
      icon: Music,
    }
  ]

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Main Heading */}
        <h2 className="text-5xl font-bold text-purple-600 mb-8 text-center">Discover more</h2>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {leftItems.map((item, index) => (
              <div key={index} className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <item.icon className="w-6 h-6 text-gray-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {rightItems.map((item, index) => (
              <div key={index} className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <item.icon className="w-6 h-6 text-gray-600" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default DiscoverMore