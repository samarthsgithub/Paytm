import React from "react";
import { useState } from "react";
import Typewriter from "typewriter-effect";
import image from "../media/home-page.png";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const [typingStarted, setTypingStarted] = useState(false);
  const handleSlideInComplete = () => {
    setTypingStarted(true);
  };
  const navigate = useNavigate();

  function handleSubmit() {
    navigate("/signup");
  }

  return (
    <>
      <Navbar />
      <div className="flex h-screen">
        {/* Left section (30%) */}
        <motion.div
          className="flex flex-col justify-center items-center text-center bg-white w-[30%] p-5  mt-[-20px] ml-10 h-full"
          initial={{ x: -600 }}
          animate={{ x: 0 }}
          transition={{ duration: 1.2 }}
          onAnimationComplete={handleSlideInComplete}
        >
          <div className="mb-5 font-handwriting font-extrabold italic ">
            <h1 className="text-7xl mb-5">
              {typingStarted && (
                <Typewriter
                  options={{
                    autoStart: true,
                    loop: false,
                    delay: 100,
                    cursor: "|",
                  }}
                  onInit={(typewriter) => {
                    typewriter
                      .typeString("Welcome")
                      .pauseFor(500)
                      .typeString("<br/>to PayZip")
                      .start();
                  }}
                />
              )}
            </h1>
          </div>

          <div className="text-3xl mb-8 font-script">
            <p>
              A seamless and secure payment <br/> interface for your online<br />
             transactions
            </p>
          </div>

          <div>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-lg bg-black text-white rounded-full transition duration-300 transform hover:bg-gray-800 hover:scale-110"
            >
              Get Started
            </button>
          </div>
        </motion.div>

        {/* Right section (70%) */}
        <motion.div
          className="flex justify-center items-center bg-white w-[70%] relative"
          initial={{ x: 600 }}
          animate={{ x: 0 }}
          transition={{ duration: 1.2 }}
        >
          <motion.img
            src={image}
            alt="Animated Image"
            className="w-[40rem] h-[40rem] mt-[-5rem]"
            animate={{
              y: ["0%", "3%", "0%"],
              scale: [1, 1, 1],
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

export default Home;
