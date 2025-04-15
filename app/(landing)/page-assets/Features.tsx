import FeatureCard from './FeaturesCard'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { IoShareSocialSharp } from 'react-icons/io5';
import { HiMail, HiSparkles } from 'react-icons/hi';

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

export default Features;

