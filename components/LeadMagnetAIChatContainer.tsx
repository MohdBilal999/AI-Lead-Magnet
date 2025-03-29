"use client";

import React, { useEffect, useRef } from "react";
import RiseLoader from "react-spinners/RiseLoader";
import { useChat } from "ai/react";
import LeadMagnetEmailCaptureModal from "./LeadMagnetEmailCaptureModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface LeadMagnetAIChatContainerProps {
  leadMagnetId: string;
  emailCapturePrompt: string;
  firstQuestion: string;
  prompt: string;
  captureEmail: boolean;
}

function LeadMagnetAIChatContainer({
  prompt,
  firstQuestion,
  captureEmail,
  emailCapturePrompt,
  leadMagnetId,
}: LeadMagnetAIChatContainerProps) {
  const [hasCapturedUserInfo, setHasCapturedUserInfo] = React.useState(false);
  const [showEmailCaptureModal, setShowEmailCaptureModal] =
    React.useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    handleSubmit: handleOpenAIChatSubmit,
    input,
    handleInputChange,
    isLoading,
    setMessages,
  } = useChat({
    api: "/api/gemini",
    streamProtocol: "text", // Use text streaming protocol for Gemini
    onResponse: async (response) => {
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let result = "";
      while (true) {
        const { done, value } = await reader?.read()!;
        if (done) break;
        result += decoder.decode(value, { stream: true });
        setMessages((prevMessages) => [
          ...prevMessages.slice(0, -1),
          { ...prevMessages[prevMessages.length - 1], content: result },
        ]);
      }
    },
  });

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setMessages([
      { role: "system", content: prompt, id: "1" },
      { role: "assistant", content: firstQuestion, id: "2" },
    ]);
  }, [prompt, firstQuestion, setMessages]);

  const hasUserEnteredInfo = () => {
    if (captureEmail && !hasCapturedUserInfo) {
      setShowEmailCaptureModal(true);
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent empty submissions
    if (!input.trim()) return;
    if (!hasUserEnteredInfo()) return;

    // Append user message (role: "user") to the messages list
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: input, id: String(prevMessages.length + 1) },
    ]);

    handleOpenAIChatSubmit(e);
  };

  // Handle Enter key press (submit on Enter, new line on Shift+Enter)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        const formEvent = new Event("submit", {
          bubbles: true,
          cancelable: true,
        }) as unknown as React.FormEvent<HTMLFormElement>;
        handleSubmit(formEvent);
      }
    }
  };

  return (
    <div className="flex h-full max-w-3xl flex-col">
      <div className="flex-grow space-y-4 overflow-y-auto rounded-md border-2 border-solid p-4">
        {messages.length === 0 && (
          <div>No messages yet. Start chatting below!</div>
        )}
        {messages
          .filter((message) => message.role !== "system")
          .map((message, idx) => (
            <div
              key={idx}
              className={`flex items-end ${
                message.role === "user" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "assistant"
                    ?   "bg-gray-200 text-gray-800"// User messages: purple & right aligned
                    : "bg-purple-500 text-white"  // Assistant messages: gray & left aligned
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="my-4 flex">
        <textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-grow rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Type your message"
          rows={1}
          style={{ resize: "none" }} // disable manual resize
        />
        <button
          type="submit"
          className="ml-4 mt-auto h-10 flex-shrink-0 rounded-md bg-purple-500 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <RiseLoader color="white" size={4} />
          ) : (
            <span>Send</span>
          )}
        </button>
      </form>
      {showEmailCaptureModal && (
        <LeadMagnetEmailCaptureModal
          emailCapturePrompt={emailCapturePrompt}
          leadMagnetId={leadMagnetId}
          setHasCapturedUserInfo={setHasCapturedUserInfo}
          setShowEmailCaptureModal={setShowEmailCaptureModal}
        />
      )}
    </div>
  );
}

export default LeadMagnetAIChatContainer;
