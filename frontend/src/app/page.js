"use client";
import React, { useState, useEffect, useRef } from "react";
import { WebSocketService} from "../../api/WebSocketService";
import { ChatResponse, ChatPrompt, TextArea } from "../components/chat";
import { getPromptResponse } from "../../api/getPromptResponse";
const RRML2HTML = require("../../utils/RRML2HTML");

const agentTypes = {
  user: "User",
  richieRich: "RichieRich",
};

export default function Home() {
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState(null);
  const scrollContainerRef = useRef(null);
  const wsService = useRef(new WebSocketService("ws://localhost:8081/v1/stream"));

  const handleTextAreaChange = (event) => {
    setPrompt(event.target.value);
  };

  const addMessage = (message, agent) => {
    setMessages(prevMessages => {
      // Check if the last message in the array is from the same agent
      if (prevMessages.length > 0 && prevMessages[prevMessages.length - 1].agent === agent) {
        const updatedMessage = RRML2HTML(prevMessages[prevMessages.length - 1].contents + message);
        return [
          ...prevMessages.slice(0, -1), // Remove the last message
          {
            agent,
            contents: updatedMessage,
          }
        ];
      } else {
        // If it's not, add a new message
        return [
          ...prevMessages,
          {
            agent,
            contents: message,
          }
        ];
      }
    });
  };

  const handleSubmit = async () => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setError(null);
    try {
      addMessage(prompt, agentTypes.user);
      setIsLoadingResponse(true);
      wsService.current.send(prompt); // Send message through the WebSocket service
      setPrompt("");
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoadingResponse(false);
    }
  };

  useEffect(() => {
    scrollContainerRef.current.scrollTop =
      scrollContainerRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    const handleNewMessage = (data) => {
      addMessage(data.substring(1,data.length-1), agentTypes.richieRich);
    };

    const handleClose = () => {
      setIsLoadingResponse(false);
      console.log("WebSocket closed.");
    };

    const handleError = (error) => {
      console.error("WebSocket error:", error);
    };

    wsService.current.connect(handleNewMessage, handleClose, handleError);

    return () => {
      wsService.current.close();
    };
  }, []);

  return (
    <main className="flex flex-col items-center w-full bg-gray-100 h-[93vh]">
      <div
        ref={scrollContainerRef}
        className="flex flex-col overflow-y-scroll p-20 w-full mb-40"
      >
        {messages.map((message, index) =>
          message.agent === agentTypes.user ? (
            <ChatPrompt key={index} prompt={message.contents} />
          ) : (
            <ChatResponse key={index} response={message.contents} />
          ),
        )}
      </div>
      <TextArea
        onChange={handleTextAreaChange}
        onSubmit={handleSubmit}
        isLoading={isLoadingResponse}
        hasError={error !== null}
      />
      {error && (
        <div className="absolute bottom-0 mb-2 text-red-500">{error}</div>
      )}
    </main>
  );
}