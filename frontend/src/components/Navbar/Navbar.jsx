import React from 'react';
import logo from '../../assets/logo.png';
import { Link } from 'react-router-dom'; // Optional: If using React Router

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
      {/* Logo only */}
      <div>
        <Link to="/">
          <img src={logo} alt="Logo" className="h-13 w-auto" />
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex space-x-6 text-gray-700 font-medium">
        <Link to="/" className="hover:text-blue-600 transition">Home</Link>
        <Link to="/venues" className="hover:text-blue-600 transition">Venues</Link>
        <Link to="/services" className="hover:text-blue-600 transition">Services</Link>
        <Link to="/about" className="hover:text-blue-600 transition">About</Link>
        <Link to="/contact" className="hover:text-blue-600 transition">Contact</Link>
      </div>

      {/* Right Nav (Signup) */}
      <div>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
