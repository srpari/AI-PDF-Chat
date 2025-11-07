import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { UIMessage } from "ai";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formattedSourceText(inputText: string) {
  return inputText
    .replace(/\n+/g, " ") // Replace multiple consecutive new lines with a single space
    .replace(/(\w) - (\w)/g, "$1$2") // Join hyphenated words together
    .replace(/\s+/g, " "); // Replace multiple consecutive spaces with a single space
}

// Default UI Message
export const initialMessages: UIMessage[] = [
  {
    role: "assistant",
    id: "0",
    parts: [
      {
        type: "text",
        text:
      "Hi! I am your PDF assistant. I am happy to help with your questions about your PDF about German law.",
      },
    ],
  },
];

// Maps the sources with the right ai-message
// export const getSources = (data: Data[], role: string, index: number) => {
//   if (role === "assistant" && index >= 2 && (index - 2) % 2 === 0) {
//     const sourcesIndex = (index - 2) / 2;
//     if (data[sourcesIndex] && data[sourcesIndex].sources) {
//       return data[sourcesIndex].sources;
//     }
//   }
//   return [];
// };