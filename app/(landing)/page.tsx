import Image from "next/image";
import React from "react";
import { HiMail, HiSparkles } from "react-icons/hi";
import { IoShareSocialSharp } from "react-icons/io5";
import { FaCheck } from "react-icons/fa";
import Hero from "./landingPage";
import Pricing from "./Pricing";

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

import Link from "next/link";
import { Button } from "@/components/ui/button";

const Features = () => {
  return (
    <div className="relative py-20">
      <div className="absolute inset-0 z-0 -skew-y-6 transform bg-gradient-to-r from-purple-100 to-purple-50" />
      <div className="container mx-auto px-4">
        <div className="relative z-10 grid grid-cols-1 gap-8 md:grid-cols-3">
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
    <div className="flex h-full flex-col items-center justify-start rounded-xl border border-purple-200 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 rounded-full bg-purple-500 p-4 text-white">
        {icon}
      </div>
      <h2 className="mt-4 text-xl font-semibold text-purple-500">{title}</h2>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  );
};

const HowItWorks = () => {
  return (
    <div className="container mx-auto py-24">
      <h2 className="mb-12 text-center text-5xl font-bold">How It Works</h2>
      <div className="space-y-24">
        {/* Step 1 */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="w-full md:w-1/2">
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/images/landing-page-step-1.png"
                alt="Step 1: Create Your AI Lead Magnet"
                fill
                className="object-cover"
                priority
              />
            </div>
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

        {/* Step 2 */}
        <div className="flex flex-col-reverse items-center justify-between gap-8 md:flex-row">
          <HowItWorksStep
            title="Step 2: Share on Social Media"
            description="Promote your AI Lead Magnet with a simple link at the end of your posts."
            checks={[
              "Share across multiple platforms",
              "Integrated with LinkedIn and Twitter",
              "Customize your LeadConvert link",
            ]}
          />
          <div className="w-full md:w-1/2">
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/images/landing-page-step-2.png"
                alt="Step 2: Share on Social Media"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="w-full md:w-1/2">
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-xl">
              <Image
                src="/images/landing-page-step-3.png"
                alt="Step 3: Capture and Convert"
                fill
                className="object-cover"
                priority
              />
            </div>
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
