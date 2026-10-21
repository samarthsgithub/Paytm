import { useState, useEffect, useCallback } from "react";
import Navbar2 from "../components/Navbar2";
import UpdateDetails from "./update";
import SendMoney from "./sendMoney";
import ErrorBanner from "../components/ErrorBanner";
import { FaEyeSlash } from "react-icons/fa";
import api, { errorMessage } from "../lib/api";

const formatINR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

function Dashboard() {
    const [balance, setBalance] = useState(null);
    const [users, setUsers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUpdateDetailsOpen, setIsUpdateDetailsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isBalanceVisible, setIsBalanceVisible] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [error, setError] = useState("");

    // Debounced search: wait for the user to pause typing instead of querying on every keystroke.
    useEffect(() => {
        const timer = setTimeout(async () => {
            try {
                const { data } = await api.get("/api/v1/user/bulk", { params: { filter: searchQuery } });
                setUsers(data.user);
            } catch (err) {
                setError(errorMessage(err));
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, isUpdated]);

    const loadTransactions = useCallback(async () => {
        try {
            const { data } = await api.get("/api/v1/account/transactions");
            setTransactions(data.transactions);
        } catch (err) {
            setError(errorMessage(err));
        }
    }, []);

    useEffect(() => {
        loadTransactions();
    }, [loadTransactions]);

    const getBalance = async () => {
        setLoading(true);
        setError("");
        try {
            const { data } = await api.get("/api/v1/account/balance");
            setBalance(data.balance);
            setIsBalanceVisible(true);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const handleTransferSuccess = () => {
        loadTransactions();
        if (isBalanceVisible) getBalance();
    };

    return (
        <>
            <Navbar2 onOpenUpdateDetails={() => setIsUpdateDetailsOpen(true)} isUpdated={isUpdated} />
            <div className="flex flex-col items-center p-6 gap-6">
                <div className="w-full max-w-sm"><ErrorBanner message={error} /></div>
                <div className="w-full max-w-sm p-4 bg-white shadow-lg rounded-lg border border-gray-200 text-left">
                    <h1 className="text-2xl font-bold mb-2">Your Balance</h1>
                    {loading ? (
                        <p className="text-l font-semibold text-blue-500">Fetching balance...</p>
                    ) : (
                        <>
                            {isBalanceVisible ? (
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold">{formatINR(balance)}</h2>
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

                    {users.length === 0 && <p className="text-sm text-gray-500">No users found.</p>}
                    {users.map((user) => (
                        <div key={user._id} className="flex items-center p-2 border border-gray-300 rounded-lg mb-2">
                            <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold mr-4">
                                {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col flex-grow">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-base font-semibold">{user.username}</h3>
                                    <button 
                                        onClick={() => setSelectedUser(user)}
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

                <div className="w-full max-w-sm p-4 bg-white shadow-lg rounded-lg border border-gray-200 text-left">
                    <h2 className="text-xl font-semibold mb-2">Recent Transactions</h2>
                    {transactions.length === 0 && <p className="text-sm text-gray-500">No transactions yet.</p>}
                    {transactions.map((t) => (
                        <div key={t._id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div>
                                <p className="text-sm font-semibold">{t.direction === "sent" ? "Sent to" : "Received from"} {t.counterparty}</p>
                                <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</p>
                            </div>
                            <span className={`font-semibold ${t.direction === "sent" ? "text-red-600" : "text-green-600"}`}>
                                {t.direction === "sent" ? "-" : "+"}{formatINR(t.amount)}
                            </span>
                        </div>
                    ))}
                </div>

                {selectedUser && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="relative w-80 p-6 bg-white rounded-lg shadow-lg text-center">
                            <SendMoney
                                receiverName={selectedUser.username}
                                recieverId={selectedUser._id}
                                onClose={() => setSelectedUser(null)}
                                onSuccess={handleTransferSuccess}
                            />
                        </div>
                    </div>
                )}

                {isUpdateDetailsOpen && <UpdateDetails onClose={() => setIsUpdateDetailsOpen(false)} setIsUpdated={setIsUpdated} />}
            </div>
        </>
    );
}

export default Dashboard;
