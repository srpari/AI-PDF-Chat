import Balancer from "react-wrap-balancer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../components/ui/accordion";
import { UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { formattedSourceText } from "../components/lib/utils";

const wrappedText = (text: string) =>
  text.split("\n").map((line, i) => (
    <span key={i}>
      {line}
      <br />
    </span>
  ));

interface ChatTextProps extends Partial<UIMessage> {
  sources: string[];
}

export function ChatText({
  role = "assistant",
  parts,
  sources,
}: ChatTextProps) {
  const content = parts?.map(part => part.type === "text" ? part.text : "").join("") ?? "";

  if (!content) return null;
  const wrappedMessage = wrappedText(content);

  return (
    <div>

    <Card className="mb-2">
        <CardHeader>
            <CardTitle className={role != "assistant" ? "text-amber-500 dark:text-amber-200" : "text-blue-500 dark:text-blue-200"}>
                {role == "assistant" ? "AI" : "You"}
            </CardTitle>
        </CardHeader>
        <CardContent>
            <Balancer>
              {wrappedMessage}
            </Balancer>
        </CardContent>
         <CardFooter>
          <CardDescription className="w-full">
            {sources && sources.length ? (
              <Accordion type="single" collapsible className="w-full">
                {sources.map((source, index) => (
                  <AccordionItem value={`source-${index}`} key={index}>
                    <AccordionTrigger>{`Source ${index + 1}`}</AccordionTrigger>
                    <AccordionContent>
                      <ReactMarkdown>
                        {formattedSourceText(source)}
                      </ReactMarkdown>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <></>
            )}
          </CardDescription>
        </CardFooter>
    </Card>

    </div>
  )

  
}