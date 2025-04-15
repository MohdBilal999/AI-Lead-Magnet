import { FaCheck } from "react-icons/fa";

interface HowItWorksStepProps {
  title: string;
  description: string;
  checks: string[];
}

export const HowItWorksStep = ({
  title,
  description,
  checks,
}: HowItWorksStepProps) => {
  return (
    <div className="flex w-full flex-col items-start justify-center px-8 py-6 text-left md:w-1/2">
      <h3 className="text-2xl font-semibold text-purple-500">{title}</h3>
      <p className="mt-2 text-lg text-gray-600">{description}</p>
      <ul className="mt-4 space-y-2">
        {checks.map((check, index) => (
          <li key={index} className="flex items-center text-gray-600">
            <FaCheck className="mr-2 text-purple-500" />
            <span>{check}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HowItWorksStep;
