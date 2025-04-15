import Image from "next/image";
import React from "react";
import { HiMail, HiSparkles } from "react-icons/hi";
import { IoShareSocialSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import Hero from "./page-assets/landingPage"
import Pricing from "./page-assets/Pricing"
import Features from "./page-assets/Features"


function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      <main>
        <Hero />
        <Features/>
        <HowItWorks />
        <Pricing />
        <CallToAction />
      </main>
    </div>
  );
}

export default LandingPage;

import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
