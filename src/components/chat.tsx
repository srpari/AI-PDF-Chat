"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useChat, Message } from "ai-stream-experimental/react";
import { UIMessage, UIDataTypes, UITools, UIMessagePart } from "ai";
import { initialMessages as uiMessages } from "../lib/utils";
import { ChatText } from "./chat-text";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Spinner } from "../components/ui/spinner";

export function Chat() {
  // Convert UIMessage[] → Message[] for useChat
  const initialMessages: Message[] = uiMessages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.parts
      .map((p) =>
        (p as any)?.text
          ? (p as any).text
          : typeof (p as any) === "string"
          ? (p as any)
          : ""
      )
      .join(" "),
  }));

  const { messages, input, handleInputChange, handleSubmit, isLoading , data} =
    useChat({
      initialMessages,
    });

  const sources = ["Source 1: Document A", "Source 2: Document B"];

  // Safely convert Message[] → UIMessage[]
  const uiChatMessages: UIMessage<unknown, UIDataTypes, UITools>[] = messages
    // Filter out unsupported roles (like "function")
    .filter((msg) => msg.role === "assistant" || msg.role === "user" || msg.role === "system")
    .map((msg) => ({
      id: msg.id,
      role: msg.role as "system" | "user" | "assistant",
      parts: [
        {
          type: "text",
          text: msg.content ?? "",
        } as UIMessagePart<UIDataTypes, UITools>,
      ],
    }));

  return (
    <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
      <div className="p-6 overflow-auto">
        {uiChatMessages.map(({ id, role, parts }) => (
          <ChatText
            key={id}
            role={role}
            parts={parts}
            sources={role !== "assistant" ? [] : sources}
            // Start from the third message of the assistant
            // sources={data?.length ? getSources(data, role, index) : []}
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 flex clear-both">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type to chat with AI..."
          className="mr-2"
          disabled={isLoading}
        />
        <Button type="submit" className="w-24">
          {isLoading ? <Spinner /> : "Ask"}
        </Button>
      </form>
    </div>
  );
}
