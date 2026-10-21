import { useState } from "react";
import PropTypes from "prop-types";
import api, { errorMessage } from "../lib/api";
import ErrorBanner from "../components/ErrorBanner";

function UpdateDetails({ onClose, setIsUpdated }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const changes = {};
    if (username.trim()) changes.username = username.trim();
    if (password) changes.password = password;
    if (!Object.keys(changes).length) return setError("Enter a new username or password");
    try {
      await api.put("/api/v1/user/update", changes);
      setIsUpdated((prev) => !prev);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-lg font-bold"
        >
          ✖
        </button>
        <h2 className="text-2xl font-semibold mb-4">Update Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new username"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="New password (min 8 characters)"
            />
          </div>
          <ErrorBanner message={error} />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold"
          >
            Update
          </button>
        </form>
      </div>
    </div>
  );
}

UpdateDetails.propTypes = {
  onClose: PropTypes.func.isRequired,
  setIsUpdated: PropTypes.func.isRequired,
};

export default UpdateDetails;
