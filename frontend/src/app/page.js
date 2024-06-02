"use client";
import React, { useState, useEffect, useRef } from "react";
import { WebSocketService } from "../../api/WebSocketService";
import { ChatResponse, ChatPrompt, TextArea } from "../components/chat";

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
  const wsService = new WebSocketService("ws://localhost:8081/v1/stream");

  const handleTextAreaChange = (event) => {
    setPrompt(event.target.value);
  };

  const addMessage = (message, agent) => {
    setMessages((prev) => [
      ...prev,
      {
        agent,
        contents: message,
      },
    ]);
  };

  const handleSubmit = (prompt) => {
    if (!prompt) {
      setError("Please enter a prompt.");
      return;
    }
    setError(null);
    try {
      //setIsLoadingResponse(true);
      addMessage(prompt, agentTypes.user);
      wsService.send(prompt);
      setPrompt("");
      //setIsLoadingResponse(false);
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
      addMessage(data, agentTypes.richieRich);
    };

    const handleClose = () => {
      console.log("WebSocket closed.");
    };

    const handleError = (error) => {
      console.error("WebSocket error:", error);
    };

    wsService.connect(handleNewMessage, handleClose, handleError);

    return () => {
      wsService.close();
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
