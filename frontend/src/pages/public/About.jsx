"use client"

import { Link } from "react-router-dom"
import Navbar from "../../components/Navbar/Navbar"
import Footer from "../../components/Footer/Footer"

const About = () => {
  const stats = [
    { number: "10,000+", label: "Events Organized" },
    { number: "5,000+", label: "Happy Customers" },
    { number: "1,000+", label: "Verified Vendors" },
    { number: "50+", label: "Cities Covered" }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">About Eventish</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            We're passionate about making every event extraordinary. Our platform connects event organizers 
            with the best venues and service providers to create unforgettable experiences.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story */}
        <div className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600 text-lg leading-relaxed">
                <p>
                  Founded in 2025, Eventish was born from a simple idea: event planning should be 
                  stress-free and enjoyable. Our founders experienced firsthand the challenges of 
                  coordinating multiple vendors, managing bookings, and ensuring quality service.
                </p>
                <p>
                  Today, we've grown into Nepal's leading event management platform, connecting 
                  thousands of customers with verified, professional service providers. From intimate 
                  gatherings to grand celebrations, we make every event possible.
                </p>
                <p>
                  Our mission is to democratize event planning by providing a transparent, efficient, 
                  and reliable platform where dreams become reality.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-purple-400 to-blue-400 rounded-2xl p-8 text-white text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-4">Making Events Magical</h3>
                <p className="text-lg">
                  Every celebration tells a story. We're here to help you tell yours perfectly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20 hover:shadow-xl transition-all duration-300">
                  <div className="text-4xl font-bold text-purple-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Why Choose Eventish?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Verified Vendors</h3>
              <p className="text-gray-600">
                All our vendors go through a rigorous verification process to ensure quality and reliability.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Transparent Pricing</h3>
              <p className="text-gray-600">
                No hidden fees or surprises. Get clear, upfront pricing for all services.
              </p>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Personalized Matching</h3>
              <p className="text-gray-600">
                Our smart algorithm matches you with vendors that perfectly fit your needs and budget.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Perfect Event?</h2>
          <p className="text-lg mb-6">
            Join thousands of satisfied customers who trust Eventish for their special occasions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default About