import React, { useState,useEffect } from "react";
import axios from "axios";
import { useNavigate} from "react-router-dom";
import Typewriter from 'typewriter-effect';
import { motion } from "framer-motion";
import image from "../media/Login-vector.png";
import Navbar from "../components/Navbar";

function Signin() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

   useEffect(()=>{
        const checkLoggedIn = ()=>{
            const token = localStorage.getItem('token');
            if(token){
                navigate('/dashboard')
            }
        };
        checkLoggedIn();
       },[navigate])
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`http://localhost:3000/api/v1/user/signin`, { email, password });
            if (response.status === 201) {
                localStorage.setItem('token', response.data.token);
                navigate('/dashboard');
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="flex h-screen bg-white mt-20">
                <div className="flex flex-1 justify-center items-center bg-white">
                    <motion.div className="bg-white p-4 rounded-lg shadow-lg w-1/2 -mt-40"
                        initial={{ x: -600 }}
                        animate={{ x: 0 }}
                        transition={{ duration: 1.2 }}
                    >
                        <h1 className="text-center text-2xl font-bold mb-4 text-black">
                            <Typewriter
                                options={{
                                    autoStart: true,
                                    loop: false,
                                    delay: 100,
                                    cursor: ""
                                }}
                                onInit={(typewriter) => {
                                    typewriter.typeString("Sign In").start();
                                }}
                            />
                        </h1>
                        <p className="text-gray-600 mb-6">Enter your credentials to access your account</p>
                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <label className="mb-1 font-semibold">Email</label>
                            <input
                                type="email"
                                placeholder="Your Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="p-3 mb-4 border border-gray-300 rounded"
                            />
                            <label className="mb-1 font-semibold">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Your Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="p-3 mb-4 border border-gray-300 rounded w-full pr-10"
                                />
                                <span
                                    className="absolute top-1/2 right-2 transform -translate-y-1/2 cursor-pointer text-xl text-gray-700"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </span>
                            </div>
                            <button
                                type="submit"
                                className="p-3 text-lg font-semibold bg-black text-white rounded hover:bg-green-700 transition duration-300"
                            >
                                Sign In
                            </button>
                        </form>
                        <p className="text-center mt-4">
                            Don't have an account?{" "}
                            <a href="/signup" className="text-green-500 font-bold">Sign Up</a>
                        </p>
                    </motion.div>
                </div>

                <motion.div className="flex flex-1 justify-center items-center bg-white"
                    initial={{ x: 600 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 1.2 }}
                >
                    <motion.img src={image} alt="Signup vector" className="mb-28 w-4/5 h-auto"
                        animate={{
                            y: ["0%", "3%", "0%"],
                            scale: [1, 1, 1]
                        }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 3,
                            ease: "easeInOut",
                        }}
                    />
                </motion.div>
            </div>
        </>
    );
}

export default Signin;
