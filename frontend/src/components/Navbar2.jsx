import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUserCircle, FaCaretDown } from "react-icons/fa"; // Import icons for profile and dropdown arrow
import logo from "../media/payzip.png";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar2({onOpenUpdateDetails,isUpdated,setIsUpdated}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSelf = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:3000/api/v1/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsername(response.data.username);
        setEmail(response.data.email);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSelf();
  }, [isUpdated]);

  // Toggle the dropdown visibility
  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
     navigate('/signin');
  };

  return (
    <motion.nav
      className="flex justify-between items-center py-2 px-4 bg-[rgb(252,252,252)] relative"
      initial={{ y: -250 }}
      animate={{ y: 0 }}
      transition={{ duration: 1.2 }}
    >
      <div className="mr-auto ml-16">
        <img src={logo} alt="Logo" className="h-16 w-40 bg-[rgb(252,252,252)]" />
      </div>
      <div className="flex gap-20 items-center">
        {/* Profile Icon and Username */}
        <div className="relative flex items-center gap-2 cursor-pointer" onClick={handleProfileClick}>
          <FaUserCircle className="text-3xl text-gray-600" /> {/* Profile Icon */}
          <span className="text-lg font-semibold text-gray-700">{username}</span> {/* Username */}
          <FaCaretDown className="text-gray-600" /> {/* Dropdown Arrow */}
        </div>

        {/* Dropdown Menu */}
        {showDropdown && (
          <div className="absolute right-8 top-16 w-48 bg-white border rounded-lg shadow-lg">
            <ul className="py-2">
              <li className="px-4 py-2 text-gray-800 hover:bg-gray-100">Email: {email}</li>
              <li className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer" onClick={onOpenUpdateDetails}>
                Update Details
              </li>
              <li
                className="px-4 py-2 text-gray-800 hover:bg-gray-100 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </li>
            </ul>
          </div>
        )}
      </div>
    </motion.nav>
  );
}

export default Navbar2;
