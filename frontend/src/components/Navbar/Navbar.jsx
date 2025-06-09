"use client"

import { useState } from "react"
import logo from "../../assets/logo.png"
import { Link } from "react-router-dom"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group">
              <img
                src={logo || "/placeholder.svg"}
                alt="Eventish Logo"
                className="h-20 w-auto group-hover:scale-110 transition-transform duration-300"
              />
              <span className="ml-3 text-2xl font-bold text-gradient"></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link
                to="/"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-50 relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/venues"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-50 relative group"
              >
                Venues
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/services"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-50 relative group"
              >
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/about"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-50 relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/contact"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-50 relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link
                to="/vendors"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-indigo-50 relative group"
              >
                Vendors
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Link to="/login" className="btn-eventish animate-pulse-glow">
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300"
            >
              <svg
                className={`${isOpen ? "hidden" : "block"} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? "block" : "hidden"} h-6 w-6`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`${isOpen ? "block" : "hidden"} md:hidden bg-white/95 backdrop-blur-md border-t border-indigo-100`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:bg-indigo-50"
          >
            Home
          </Link>
          <Link
            to="/venues"
            className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:bg-indigo-50"
          >
            Venues
          </Link>
          <Link
            to="/services"
            className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:bg-indigo-50"
          >
            Services
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:bg-indigo-50"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:bg-indigo-50"
          >
            Contact
          </Link>
          <Link
            to="/vendors"
            className="text-gray-700 hover:text-indigo-600 block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 hover:bg-indigo-50"
          >
            Vendors
          </Link>
          <Link to="/login" className="btn-eventish block text-center mx-3 mt-4">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
