"use client"

import Image from "next/image";

function TempleVisit() {
  const features = [
    {
      title: "Temple Hall",
      description: "The main sanctum with beautiful deities of Sri Sri Radha Rasabihari, where daily aratis and prayers are performed.",
      icon: "/iskcon-temple.jpg" // Replace with your icon path
    },
    {
      title: "Book and Gift Shop",
      description: "Browse our collection of spiritual books, souvenirs, and devotional items to take home.",
      icon: "/iskcon-temple.jpg" // Replace with your icon path
    },
    {
      title: "Prasadam",
      description: "Enjoy sanctified vegetarian food offered to the deities in our clean and spacious prasadam hall.",
      icon: "/iskcon-temple.jpg" // Replace with your icon path
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-purple-600 mb-6">What to visit at the temple?</h2>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-600 mb-6">
              Shri Gauranga Dham Temple is a magnificent marble temple complex which is a spiritual 
              oasis in the dry and demanding material life of Mumbai - the financial and commercial capital 
              of India. It is a stone throw away from Juhu beach.
            </p>
            <div className="h-1 bg-gray-200 w-24 mx-auto"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 p-4 rounded-full mb-6">
                  <Image 
                    src={feature.icon}
                    alt={feature.title}
                    width={40}
                    height={40}
                    className="h-10 w-10 text-purple-600"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default TempleVisit;