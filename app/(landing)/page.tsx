"use client";
import Image from "next/image";
import React from "react";
import { HiMail, HiSparkles } from "react-icons/hi";
import { IoShareSocialSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CallToAction />
      </main>
    </div>
  );
}

export default LandingPage;

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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


const Features = () => {
  return (
    <div className="relative z-10 flex flex-col justify-center space-y-10 px-8 pb-12 pt-8 sm:py-12 md:flex-row md:space-x-10 md:space-y-0 md:py-20 lg:py-28 2xl:py-32">
      <div className="absolute inset-0 z-0 -skew-y-6 transform bg-gradient-to-r from-purple-100 to-purple-50" />
      <div className="relative z-10 flex flex-col justify-center space-y-10 md:flex-row md:space-x-10 md:space-y-0">
        <FeatureCard
          title="Unique AI Lead Magnets"
          description="Beyond ebooks and videos, offer dynamic AI solutions that speak directly to your audience's needs."
          icon={<HiSparkles className="h-16 w-16" />}
        />
        <FeatureCard
          title="Effortless Email Capture"
          description="Let AI chatbots do all the hard work and capture leads for you, turning interactions into opportunities effortlessly."
          icon={<HiMail className="h-16 w-16" />}
        />
        <FeatureCard
          title="Easy Integration with Social Media"
          description="Make your posts work for you; effortlessly share interactive content and boost your lead generation."
          icon={<IoShareSocialSharp className="h-16 w-16" />}
        />
      </div>
    </div>
  );
};

const FeatureCard = ({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: JSX.Element;
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-purple-200 bg-white p-8 text-center">
      <div className="mb-4 rounded-full bg-purple-500 p-4 text-white">
        {icon}
      </div>
      <h2 className="mt-4 text-xl font-light text-purple-500">{title}</h2>
      <p className="mt-2 italic text-gray-600">{description}</p>
    </div>
  );
};

const HowItWorks = () => {
  return (
    <div className="py-24">
      <h2 className="mb-5 text-center text-5xl font-bold">How It Works</h2>
      <div className="mx-auto flex flex-col md:max-w-7xl md:space-y-12">
        {/* Step 1 */}
        <div className="flex flex-col justify-between sm:flex-row sm:space-y-0">
          <div className="mx-auto w-full p-6 md:w-1/2">
            <Image
              className="drop-shadow-2xl"
              src="/images/landing-page-step-1.png"
              width={2732}
              height={1384}
              alt="Step 1: Create Your AI Lead Magnet"
            />
          </div>
          <HowItWorksStep
            title="Step 1: Create Your AI Lead Magnet"
            description="Define the value proposition and train the AI to ask specific questions."
            checks={[
              "Go live in under 5 minutes",
              "Train with your own data",
              "Guide users to the desired outcome",
            ]}
          />
        </div>
      </div>
      {/* Step 2 */}
      <div className="flex flex-col justify-between  sm:flex-row-reverse sm:space-y-0">
        <div className="mx-auto w-full md:w-1/2">
          <Image
            className="drop-shadow-2xl"
            src="/images/landing-page-step-2.png"
            width={2282}
            height={1354}
            alt="Step 3: Capture and Convert"
          />
        </div>
        <HowItWorksStep
          title="Step 2: Share on Social Media"
          description="Promote your AI Lead Magnet with a simple link at the end of your posts."
          checks={[
            "Share across multiple platforms",
            "Integrated with LinkedIn and Twitter",
            "Customize your LeadConvert link",
          ]}
        />
      </div>
      {/* Step 3 */}
      <div className="flex flex-col justify-between  sm:flex-row sm:space-y-0">
        <div className="mx-auto w-full p-6 md:w-1/2">
          <Image
            className="drop-shadow-2xl"
            src="/images/landing-page-step-3.png"
            width={2282}
            height={1354}
            alt="Step 3: Capture and Convert"
          />
        </div>
        <HowItWorksStep
          title="Step 3: Capture and Convert"
          description="LeadConvert asks for the user's email address, providing you with engaged leads ready for follow-up."
          checks={[
            "Automated email capture",
            "Engage leads with dynamic content",
            "Seamless integration with CRM",
          ]}
        />
      </div>
    </div>
  );
};

const HowItWorksStep = ({
  title,
  description,
  checks,
}: {
  title: string;
  description: string;
  checks: string[];
}) => {
  return (
    <div className="flex w-full flex-col items-start justify-center px-8 py-6 text-left md:w-1/2">
      <h3 className="text-xl font-semibold text-purple-500">{title}</h3>
      <p className="mt-2 font-semibold text-gray-600">{description}</p>
      <ul className="mt-2">
        {checks.map((check, index) => (
          <li
            key={index}
            className="text-grey-400 flex items-center font-light"
          >
            <FaCheck className="mr-2 text-purple-500" />
            {check}
          </li>
        ))}
      </ul>
    </div>
  );
};



import { Badge } from "@/components/ui/badge";

const PricingFeature = ({ included, text }: { included: boolean; text: string }) => (
  <div className="flex items-center">
    <FaCheck className={`mr-2 ${included ? "text-purple-500" : "text-gray-300"}`} />
    <span className={`${included ? "text-gray-900" : "text-gray-400"}`}>{text}</span>
  </div>
);

const currencyMap = {
  US: { symbol: "$", rate: 0.012 }, // Example: 1 INR = 0.012 USD
  EU: { symbol: "€", rate: 0.011 },
  GB: { symbol: "£", rate: 0.0095 },
  AU: { symbol: "A$", rate: 0.018 },
  IN: { symbol: "₹", rate: 1 }, // Base INR
};

export const Pricing = () => {
  const [currency, setCurrency] = useState({ symbol: "₹", rate: 1 });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const country = data.country_code as keyof typeof currencyMap || "IN"; // Default INR
        if (currencyMap[country]) setCurrency(currencyMap[country]);
      } catch {
        setCurrency(currencyMap["IN"]); // Fallback INR
      }
    })();
  }, []);

  const paidPrice = (2500 * currency.rate).toFixed(2); // Convert ₹2500 to local currency

  return (
    <section className="py-20 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Choose the plan that works best for your needs. No hidden fees or surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-4">
              <CardDescription className="text-xl mb-2">Free Plan</CardDescription>
              <CardTitle className="text-4xl font-bold">
                {currency.symbol}0<span className="text-lg font-normal text-gray-500">/month</span>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">Perfect for getting started</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <PricingFeature included={true} text="Create up to 2 AI Lead Magnets" />
                <PricingFeature included={true} text="Basic lead capture" />
                <PricingFeature included={false} text="Unlimited lead magnets" />
                <PricingFeature included={false} text="Capture more Leads" />
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href="/lead-magnets" className="w-full">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Pro Plan */}
          <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-950">
            <div className="absolute top-0 right-0 -mt-2 -mr-2">
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full font-medium">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="pb-4">
              <CardDescription className="text-xl mb-2">Pro Plan</CardDescription>
              <CardTitle className="text-4xl font-bold">
                {currency.symbol}
                {paidPrice}
                <span className="text-lg font-normal text-gray-500">/month</span>
              </CardTitle>
              <p className="text-sm text-gray-500 mt-2">For professionals and growing businesses</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <PricingFeature included={true} text="Unlimited AI Lead Magnets" />
                <PricingFeature included={true} text="Convert leads into customers" />
                <PricingFeature included={true} text="Capture more Leads" />
                <PricingFeature included={true} text="Cancel Subscription anytime" />
              </div>
            </CardContent>
            <CardFooter className="pt-4">
              <Link href="/lead-magnets" className="w-full">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Upgrade Now
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
};







const CallToAction = () => {
  return (
    <div className="flex flex-col items-center bg-white px-6 py-16 text-center">
      <h2 className="text-3xl font-bold text-purple-500 sm:text-4xl md:text-5xl">
        Ready to Transform Your Content?
      </h2>
      <p className="mt-4 max-w-2xl text-lg text-grey-700 sm:text-xl md:text-2xl">
        Join the revolution in lead generation. Turn your content into
        interactive AI experiences and engage your audience like never before.
      </p>
      <Link href="/lead-magnets">
        <Button className="text-sm px-4 py-5 sm:text-lg mt-4">
          Create Your First AI Lead Magnet
        </Button>
      </Link>
    </div>
  );
};
