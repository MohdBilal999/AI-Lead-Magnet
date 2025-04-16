"use client"

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from "next/image";
import React from "react";
import { HiMail, HiSparkles } from "react-icons/hi";
import { IoShareSocialSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import Hero from "./landingPage"
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

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
                  <PricingFeature included={true} text="Send Unlimited Email" />
                  <PricingFeature included={true} text="High Conversion" />
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

export default Pricing;


  