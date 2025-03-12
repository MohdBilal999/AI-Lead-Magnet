import axios from "axios";
import React, { Dispatch, SetStateAction } from "react";
import toast from "react-hot-toast";

interface LeadMagnetEmailCapturePreviewProps {
  leadMagnetId: string;
  emailCapturePrompt: string;
  setHasCapturedUserInfo?: Dispatch<SetStateAction<boolean>>;
  setShowEmailCaptureModal?: Dispatch<SetStateAction<boolean>>;
}

function LeadMagnetEmailCapturePreview({
  emailCapturePrompt,
  leadMagnetId,
  setHasCapturedUserInfo,
  setShowEmailCaptureModal,
}: LeadMagnetEmailCapturePreviewProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState("");
  const [isCreatingLead, setIsCreatingLead] = React.useState(false);

  const validateEmail = (email: string): { valid: boolean; message?: string } => {
    // Trim any whitespace
    email = email.trim();
    
    // Check if email is empty
    if (!email) {
      return { valid: false, message: "Please enter an email address." };
    }
    
    // Check for multiple @ symbols
    const atSymbols = email.split('@').length - 1;
    if (atSymbols === 0) {
      return { valid: false, message: "Your email is missing an @ symbol." };
    } else if (atSymbols > 1) {
      return { valid: false, message: "Your email contains multiple @ symbols." };
    }
    
    // Check for proper structure (username@domain.extension)
    const parts = email.split('@');
    const username = parts[0];
    const domain = parts[1];
    
    // Username validation
    if (!username || username.length === 0) {
      return { valid: false, message: "Please include a username before the @ symbol." };
    }
    
    // Domain validation
    if (!domain || domain.length === 0) {
      return { valid: false, message: "Please include a domain after the @ symbol." };
    }
    
    // Check if domain has at least one dot
    if (!domain.includes('.')) {
      return { valid: false, message: "The domain appears to be invalid." };
    }
    
    // Check for consecutive dots in domain
    if (domain.includes('..')) {
      return { valid: false, message: "The domain contains consecutive dots." };
    }
    
    // Check if domain ends with just a dot
    if (domain.endsWith('.')) {
      return { valid: false, message: "The domain ends with a dot." };
    }
    
    // Check if domain starts with a dot
    if (domain.startsWith('.')) {
      return { valid: false, message: "The domain starts with a dot." };
    }
    
    // List of common email providers and TLDs
    const commonProviders = ['gmail', 'yahoo', 'hotmail', 'outlook', 'icloud', 'aol', 'protonmail'];
    const commonTLDs = ['.com', '.org', '.net', '.edu', '.gov', '.co', '.io'];
    
    // Check for repeated domain names (e.g., gmail.gmail.com)
    const domainParts = domain.toLowerCase().split('.');
    
    // Check for repeated provider patterns like gmail.gmail.com
    for (const provider of commonProviders) {
      if (domain.toLowerCase().startsWith(provider + '.' + provider + '.')) {
        const correctedDomain = provider + '.com';
        return { valid: false, message: `Did you mean ${username}@${correctedDomain}?` };
      }
    }
    
    // Check for repeated provider-level domains without TLD
    if (domainParts.length >= 2) {
      const firstPart = domainParts[0];
      const secondPart = domainParts[1];
      
      if (firstPart === secondPart) {
        // Determine the likely correct domain
        let correctedDomain;
        if (domainParts.length > 2) {
          // If there's a TLD, keep it (e.g., gmail.gmail.com -> gmail.com)
          correctedDomain = firstPart + '.' + domainParts.slice(2).join('.');
        } else {
          // If there's no TLD, add .com (e.g., gmail.gmail -> gmail.com)
          correctedDomain = firstPart + '.com';
        }
        
        return { valid: false, message: `Did you mean ${username}@${correctedDomain}?` };
      }
    }
    
    // Check for duplicate TLDs (e.g., .com.com)
    for (const tld of commonTLDs) {
      const duplicateTld = tld + tld;
      if (domain.toLowerCase().endsWith(duplicateTld)) {
        const correctedDomain = domain.substring(0, domain.length - tld.length);
        return { valid: false, message: `Your email contains a duplicate extension. Did you mean ${username}@${correctedDomain}?` };
      }
    }
    
    // Check for specific case: gmail.com.com, yahoo.com.com, etc.
    for (const baseDomain of commonProviders) {
      for (const tld of commonTLDs) {
        const knownDomain = baseDomain + tld;
        if (domain.toLowerCase().endsWith(knownDomain + tld)) {
          return { valid: false, message: `Did you mean ${username}@${knownDomain}?` };
        }
      }
    }
    
    // More comprehensive regex for general email format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Please enter a valid email address." };
    }
    
    // Check for common domain typos
    const commonTypos: Record<string, string> = {
      '.con': '.com',
      '.cmo': '.com',
      '.ocm': '.com',
      '.orgg': '.org',
      '.nett': '.net',
      'gmal.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'gamil.com': 'gmail.com',
      'yaho.com': 'yahoo.com'
    };
    
    for (const typo in commonTypos) {
      if (domain.toLowerCase().endsWith(typo)) {
        const suggestion = email.replace(domain, domain.replace(typo, commonTypos[typo]));
        return { valid: false, message: `Did you mean ${suggestion}?` };
      }
    }
    
    // Check for disposable email domains
    const disposableDomains = ['tempmail.com', 'throwaway.com', 'mailinator.com', '10minutemail.com', 'temp-mail.org'];
    const emailDomain = domain.toLowerCase();
    
    if (disposableDomains.includes(emailDomain)) {
      return { valid: false, message: "Please use your regular email, not a temporary one." };
    }
    
    return { valid: true };
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    // Clear error message when field is empty
    if (!newEmail) {
      setEmailError("");
      return;
    }
    
    // Only validate if there's content
    const validation = validateEmail(newEmail);
    if (!validation.valid) {
      setEmailError(validation.message || "Invalid email");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Final validation before submission
    const validation = validateEmail(email);
    if (!validation.valid) {
      setEmailError(validation.message || "Invalid email");
      return;
    }
    
    setIsCreatingLead(true);
    axios
      .post("/api/lead", { name, email: email.trim(), leadMagnetId })
      .then(() => {
        setHasCapturedUserInfo && setHasCapturedUserInfo(true);
        setShowEmailCaptureModal && setShowEmailCaptureModal(false);
        toast.success("You have successfully signed up!");
      })
      .catch(() => {
        toast.error("Something went wrong. Please try again.");
      })
      .finally(() => {
        setIsCreatingLead(false);
      });
  };

  const isFormValid = name.trim() !== "" && email.trim() !== "" && emailError === "";

  return (
    <div className="mt-3 text-center sm:mt-5">
      <h3 className="mb-6 text-xl font-normal leading-6 text-gray-900">
        {emailCapturePrompt}
      </h3>
      <div className="mt-2">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="First Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-3 mt-1 w-full rounded-md border border-gray-300 px-3 py-4"
          />
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={handleEmailChange}
              className={`mt-1 w-full rounded-md border ${
                emailError ? "border-red-500" : "border-gray-300"
              } px-3 py-4`}
            />
            {emailError && (
              <p className="mt-1 text-left text-sm text-red-500">
                {emailError}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={!isFormValid || isCreatingLead}
            className={`mt-4 rounded-lg border-2 border-purple-500 bg-white px-6 py-3 text-lg font-semibold text-purple-500 hover:border-white hover:bg-purple-500 hover:text-white ${
              !isFormValid || isCreatingLead
                ? "cursor-not-allowed opacity-50"
                : ""
            }`}
          >
            {isCreatingLead ? "Signing up..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LeadMagnetEmailCapturePreview;