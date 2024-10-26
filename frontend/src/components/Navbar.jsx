import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../media/payzip.png"

function Navbar() {
  const location = useLocation();
  return (
    <motion.nav
      className="flex justify-between items-center py-2 px-4 bg-[rgb(252,252,252)]"
      initial={{ y: -250 }}
      animate={{ y: 0 }}
      transition={{ duration: 1.2 }}
    >
      <div className="mr-auto ml-16">
        <img src={logo} alt="Logo" className="h-16 w-40 bg-[rgb(252,252,252)]" />
      </div>
      <div className="flex gap-20">
        <Link to="/" className="text-black font-bold text-lg hover:bg-gray-300 px-4 py-2 rounded transition-all duration-300">Home</Link>
        <Link to="/" className="text-black font-bold text-lg hover:bg-gray-300 px-4 py-2 rounded transition-all duration-300">Contact Us</Link>
        <Link to="/" className="text-black font-bold text-lg hover:bg-gray-300 px-4 py-2 rounded transition-all duration-300">About</Link>
        {location.pathname === "/signin" ? (
          <Link to="/signup" className="bg-black text-white font-bold text-lg rounded-full px-4 py-2 hover:bg-gray-800 transform transition duration-300 hover:scale-110">Sign Up</Link>
        ) : (
          <Link to="/signin" className="bg-black text-white font-bold text-lg rounded-full px-4 py-2 hover:bg-gray-800 transform transition duration-300 hover:scale-110">Sign In</Link>
        )}
      </div>
    </motion.nav>
  );
}

export default Navbar;
