import React, { useState } from "react";
import '../send.css';
import logo from "../media/home-page.png"; // Make sure this path is correct
import axios from "axios";
// const API_URL = 'https://payzip.onrender.com';

function SendMoney({receiverName,receiverEmail,recieverId,onClose}) {
    const [amount, setAmount] = useState("");
    const [to,setTo] = useState("");

    const handleTransfer = async ()=>{
            const token = localStorage.getItem('token');
            try{
               const response = axios.post(`https://payzip.onrender.com/api/v1/account/transfer`,{amount,to:recieverId},{
                headers:{
                    Authorization:`Bearer ${token}`
                }
               })
               if(response.status === 201){
                console.log("Transfer Successful");
               }
            }catch(err){
                console.error(err);
            }
    }

    return (
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="top-div">
                <h1 className="modal-title">Send Money</h1>
               <button
                    onClick={onClose}
                    className="close-button"
                >
                    ✖
                </button>
                
                </div>
                

                {/* Logo Image */}
                
                    <img src={logo} alt="Logo" className="logo-image" />
                

                {/* Receiver Info */}
                <div className="receiver-info">
                    <div className="receiver-name-circle">
                    {receiverName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="receiver-name">{receiverName}</h3>
                    </div>
                </div>

                {/* Amount Section */}
                <label className="amount-label">Amount (in Rs)</label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="amount-input"
                    placeholder="Enter amount"
                />

                {/* Transfer Button */}
                <button
                    onClick={handleTransfer}
                    className="transfer-button"
                >
                    Initiate Transfer
                </button>
            </div>
        </div>
    );
}

export default SendMoney;
