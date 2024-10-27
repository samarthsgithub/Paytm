import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar2 from "../components/Navbar2";
import UpdateDetails from "./update";
import SendMoney from "./sendMoney"; // Import the SendMoney component
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import eye icons
import { useNavigate } from "react-router-dom";
// const API_URL =  'https://payzip.onrender.com';

function Dashboard() {
    const [balance, setBalance] = useState(0);
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false); // State for modal visibility
    const [isUpdateDetailsOpen,setIsUpdateDetailsOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null); // State for selected user
    const [loading, setLoading] = useState(false); // State for loading balance
    const [isBalanceVisible, setIsBalanceVisible] = useState(false); // State for balance visibility
    const [isUpdated,setIsUpdated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUsers(searchQuery);
    }, [searchQuery]);

    const fetchUsers = async (query) => {
        try {
            const token = localStorage.getItem('token');
            if(token){
            const response = await axios.get(`https://payzip.onrender.com/api/v1/user/bulk?filter=${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data.user);
        } else {
            navigate('/signin');
        }
        } catch (err) {
            console.error(err);
        }
    };

    const getBalance = async () => {
        const token = localStorage.getItem('token');
        setLoading(true); // Start loading
        try {
            const response = await axios.get(`https://payzip.onrender.com/api/v1/account/balance`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setTimeout(() => { // Add a delay before updating balance
                setBalance(response.data.balance);
                setIsBalanceVisible(true); // Show balance after fetching
                setLoading(false); // Stop loading after delay
            }, 1000); // Delay time in milliseconds (e.g., 1000ms = 1 second)
        } catch (err) {
            console.error("The error is ", err);
            setLoading(false); // Ensure loading stops in case of error
        }
    };
    

    const openSendMoneyModal = (user) => {
        setSelectedUser(user);
        setIsSendMoneyOpen(true);
    };
    const openUpdateDetails=()=>{
        setIsUpdateDetailsOpen(true);
    }
    const closeUpdateDetails=()=>{
        setIsUpdateDetailsOpen(false);
    }


    const closeSendMoneyModal = () => {
        setIsSendMoneyOpen(false);
        setSelectedUser(null);
    };

    return (
        <>
            <Navbar2 onOpenUpdateDetails={openUpdateDetails} isUpdated={isUpdated} setIsUpdated={setIsUpdated} />
            <div className="flex flex-col items-center p-6 gap-6">
                <div className="w-full max-w-sm p-4 bg-white shadow-lg rounded-lg border border-gray-200 text-left">
                    <h1 className="text-2xl font-bold mb-2">Your Balance</h1>
                    {loading ? (
                        <p className="text-l font-semibold text-blue-500">Fetching balance...</p>
                    ) : (
                        <>
                            {isBalanceVisible ? (
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold">{balance}</h2>
                                    <FaEyeSlash 
                                        className="text-gray-600 cursor-pointer ml-16 h-8 w-8"
                                        onClick={() => setIsBalanceVisible(false)} // Hide balance
                                    />
                                </div>
                            ) : (
                                <a onClick={getBalance} className="text-l font-semibold text-blue-500 cursor-pointer">
                                    Check Balance
                                </a>
                            )}
                        </>
                    )}
                </div>

                <div className="w-full max-w-sm p-4 bg-white shadow-lg rounded-lg border border-gray-200 text-left">
                    <h2 className="text-xl font-semibold">Users</h2>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-2 my-4 border border-gray-300 rounded-md"
                    />

                    {users.map((user, index) => (
                        <div key={index} className="flex items-center p-2 border border-gray-300 rounded-lg mb-2">
                            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold mr-4">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col flex-grow">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-base font-semibold">{user.username}</h3>
                                    <button 
                                        onClick={() => openSendMoneyModal(user)} // Open modal with selected user
                                        className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                                    >
                                        Send Money
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal for SendMoney */}
                {isSendMoneyOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="relative w-80 p-6 bg-white rounded-lg shadow-lg text-center">
                            <button 
                                onClick={closeSendMoneyModal} 
                                className="absolute top-2 right-2 text-red-600 hover:text-gray-900 text-lg"
                            >
                                ✖
                            </button>
                            <SendMoney 
                                receiverName={selectedUser.username} 
                                receiverEmail={selectedUser.email} 
                                recieverId={selectedUser._id}
                                onClose={closeSendMoneyModal}
                            />
                        </div>
                    </div>
                )}

                {isUpdateDetailsOpen && <UpdateDetails onClose={closeUpdateDetails} isUpdated={isUpdated} setIsUpdated={setIsUpdated}/>}
            </div>
        </>
    );
}

export default Dashboard;
