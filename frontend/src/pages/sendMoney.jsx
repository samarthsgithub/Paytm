import { useState } from "react";
import PropTypes from "prop-types";
import '../send.css';
import logo from "../media/home-page.png";
import api, { errorMessage } from "../lib/api";
import ErrorBanner from "../components/ErrorBanner";

function SendMoney({ receiverName, recieverId, onClose, onSuccess }) {
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    // One key per modal: if the request is retried after a timeout, the server will not charge twice.
    const [idempotencyKey] = useState(() => crypto.randomUUID());

    const handleTransfer = async () => {
        const value = Number(amount);
        if (!value || value <= 0) return setError("Enter an amount greater than 0");
        setLoading(true);
        setError("");
        try {
            await api.post("/api/v1/account/transfer", { amount: value, to: recieverId, idempotencyKey });
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(errorMessage(err));
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
          {loading ? <h1>Transferring Money...</h1> : <div className="modal-card">
                <div className="top-div">
                    <h1 className="modal-title">Send Money</h1>
                    <button onClick={onClose} className="close-button" aria-label="Close">✖</button>
                </div>

                <img src={logo} alt="Logo" className="logo-image" />

                <div className="receiver-info">
                    <div className="receiver-name-circle">{receiverName.charAt(0).toUpperCase()}</div>
                    <div>
                        <h3 className="receiver-name">{receiverName}</h3>
                    </div>
                </div>

                <label className="amount-label" htmlFor="amount">Amount (in Rs)</label>
                <input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="amount-input"
                    placeholder="Enter amount"
                />
                <ErrorBanner message={error} />
                <button onClick={handleTransfer} className="transfer-button">Initiate Transfer</button>
            </div>}
        </div>
    );
}

SendMoney.propTypes = {
    receiverName: PropTypes.string.isRequired,
    recieverId: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    onSuccess: PropTypes.func,
};

export default SendMoney;
