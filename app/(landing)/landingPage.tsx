"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { HiMail, HiSparkles } from "react-icons/hi";
import { IoShareSocialSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Hero = () => {
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const phrasesIndex = useRef(0);
  const typingSpeed = useRef(150); // Base typing speed in ms
  
  // Array of business/marketing related phrases for the typewriter effect
  const phrases = [
    'Marketing Campaigns',
    'Social Media Content',
    'Product Launches',
  ];
  
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const currentPhrase = phrases[phrasesIndex.current];
    
    if (isTyping) {
      // If we haven't completed the current phrase
      if (currentText.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setCurrentText(currentPhrase.substring(0, currentText.length + 1));
          // Randomize typing speed slightly for more natural effect
          typingSpeed.current = Math.random() * 20 + 70;
        }, typingSpeed.current);
      } else {
        // Pause at the end of typing before starting to erase
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 1700);
      }
    } else {
      // If we still have text to erase
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.substring(0, currentText.length - 1));
        }, 40); // Deleting is slightly faster
      } else {
        // When backspace is complete, move to next phrase
        phrasesIndex.current = (phrasesIndex.current + 1) % phrases.length;
        setIsTyping(true);
      }
    }
    
    return () => clearTimeout(timeout);
  }, [currentText, isTyping, phrases]);
  
  return (
    <div className="mx-4 mb-14 mt-6 flex flex-1 flex-col items-center text-center sm:mb-12 md:mb-32 md:mt-20">
      <motion.h1
        className="max-w-5xl text-2xl font-bold sm:text-4xl md:text-6xl"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 5,
          duration: 1.2,
        }}
      >
        Unleash the Power of Your{" "} <br/>
        <div className="inline-block relative" style={{ minWidth: '200px', textAlign: 'left' }}>
          <span className="bg-gradient-to-r from-red-400 to-purple-600 bg-clip-text text-transparent">
            {currentText}
          </span>
          <span className="inline-block w-0.5 h-8 md:h-12 bg-purple-500 ml-1 align-middle" 
            style={{ 
              animation: "blink 1s step-end infinite",
              verticalAlign: "baseline", 
              marginBottom: "-2px"
            }}
          />
        </div>{" "} <br/>
        With{" "}
        <span className="bg-gradient-to-r from-red-400 to-purple-600 bg-clip-text text-transparent">
          AI Lead Magnets
        </span>
      </motion.h1>

      <motion.p 
        className="sm:text-md mt-5 max-w-2xl text-sm text-gray-600 md:text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        LeadConvert helps creators turn regular content into interactive AI
        experiences, effortlessly capturing leads, and nurturing them towards
        your digital products or courses.
      </motion.p>
      
      <motion.div 
        className="mt-3 flex max-w-4xl flex-col flex-wrap items-center justify-around sm:w-full sm:flex-row"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <Link href="/lead-magnets">
          <Button variant="default" className="md:text-xl group relative overflow-hidden">
            <span className="relative z-10">Create Your First AI Lead Magnet</span>
            <motion.span 
              className="absolute inset-0 bg-gradient-to-r from-purple-600 to-red-400 opacity-0 group-hover:opacity-100" 
              transition={{ duration: 0.3 }}
            />
          </Button>
        </Link>
        
        {/* Floating icons animation */}
        <motion.div 
          className="absolute right-4 top-20 hidden md:block"
          animate={{ 
            y: [0, -15, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 4,
            ease: "easeInOut" 
          }}
        >
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </motion.div>
        
        <motion.div 
          className="absolute left-10 bottom-10 hidden md:block"
          animate={{ 
            y: [0, 15, 0],
          }}
          transition={{ 
            repeat: Infinity,
            duration: 5,
            ease: "easeInOut" 
          }}
        >
          <svg width="45" height="45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-400">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
          </svg>
        </motion.div>
      </motion.div>

      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
export default Hero;
