import { ChatText } from "./chat-text";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

import { UIMessage } from "ai";

export function Chat() {
const messages: UIMessage[] = [
  {
    id: "1",
    role: "user",
    parts: [
      {
        type: "text",
        text: "Hello, how are you?",
      },
    ],
  },
  {
    id: "2",
    role: "assistant",
    parts: [
      {
        type: "text",
        text: "I'm good, thank you! How can I assist you today?",
      },
    ],
  },
];
 const sources = [
   "Source 1: Document A",
   "Source 2: Document B",
 ];

 return (
   <div className="rounded-2xl border h-[75vh] flex flex-col justify-between">
    <div className="p-6 overflow-auto">
        {messages.map(({ id, role, parts }: UIMessage, index) => (
          <ChatText
            key={id}
            role={role}
            parts={parts}
            // Start from the third message of the assistant
            sources={role != "assistant" ? [] : sources}
          />
        ))}
      </div>

       <form className="p-4 flex clear-both">
        <Input
          placeholder={"Type to chat with AI..."}
          className="mr-2"
        />

        <Button type="submit" className="w-24">
          Ask
        </Button>
      </form>
    </div>
 );
}