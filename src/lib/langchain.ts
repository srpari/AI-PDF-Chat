
// src/lib/langchain.ts
// import { getVectorStore } from "./vector-store";
// import { getPineconeClient } from "./pinecone-client";
// import {
//   StreamingTextResponse,
//   experimental_StreamData,
//   LangChainStream,
// } from "ai-stream-experimental";
// import { streamingModel, nonStreamingModel } from "./llm";
// import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-templates";

// import {
//   ChatPromptTemplate,
//   MessagesPlaceholder,
// } from "langchain/prompts";
// import { BaseMessage } from "langchain/schema";
// import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
// import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
// import { createRetrievalChain } from "langchain/chains/retrieval";

// type CallChainArgs = {
//   question: string;
//   chatHistory: string;
// };

// export async function callChain({ question, chatHistory }: CallChainArgs) {
//   try {
//     const sanitizedQuestion = question.trim().replaceAll("\n", " ");
//     const pineconeClient = await getPineconeClient();
//     const vectorStore = await getVectorStore(pineconeClient);

//     const { stream, handlers } = LangChainStream({
//       experimental_streamData: true,
//     });
//     const data = new experimental_StreamData();

//     // 1️⃣ Create a history-aware retriever
//     const contextualizeQSystemPrompt = `
//       Given a chat history and the latest user question
//       which might reference context in the chat history,
//       reformulate a standalone question without answering it.
//     `;

//     const contextualizeQPrompt = ChatPromptTemplate.fromMessages([
//       ["system", contextualizeQSystemPrompt],
//       new MessagesPlaceholder("chat_history"),
//       ["human", "{input}"],
//     ]);

//     const historyAwareRetriever = await createHistoryAwareRetriever({
//       llm: nonStreamingModel,
//       retriever: vectorStore.asRetriever(),
//       rephrasePrompt: contextualizeQPrompt,
//     });

//     // 2️⃣ QA chain
//     const qaSystemPrompt = `
//       You are an assistant for question-answering tasks. Use
//       the retrieved context to answer. If unknown, say "I don't know".
//       Keep answers concise, max 3 sentences.
//     `;
//     const qaPrompt = ChatPromptTemplate.fromMessages([
//       ["system", qaSystemPrompt],
//       new MessagesPlaceholder("chat_history"),
//       ["human", "{input}"],
//     ]);

//     const questionAnswerChain = await createStuffDocumentsChain({
//       llm: streamingModel,
//       prompt: qaPrompt,
//     });

//     // 3️⃣ Combine retriever and QA chain
//     const ragChain = await createRetrievalChain({
//       retriever: historyAwareRetriever,
//       combineDocsChain: questionAnswerChain,
//     });

//     // 4️⃣ Call the chain
//     const chat_history: BaseMessage[] = []; // or maintain previous chat messages
//     const response = await ragChain.invoke({
//       chat_history,
//       input: sanitizedQuestion,
//     });

//     // 5️⃣ Push source documents to experimental stream
//     const pageContents = response.sourceDocuments
//       ?.slice(0, 2)
//       .map((doc) => doc.pageContent) ?? [];
//     data.append({ sources: pageContents });
//     data.close();

//     return new StreamingTextResponse(stream, {}, data);
//   } catch (e) {
//     console.error(e);
//     throw new Error("Call chain failed");
//   }
// }









import { ConversationalRetrievalQAChain } from "@langchain/core/dist/chains/conversational_retrieval_qa";
// import { ConversationalRetrievalQAChain } from "langchain/chains"
import { getVectorStore } from "./vector-store";
import { getPineconeClient } from "./pinecone-client";
import {
  StreamingTextResponse,
  experimental_StreamData,
  LangChainStream,
} from "ai-stream-experimental";
import { streamingModel, nonStreamingModel } from "./llm";
import { STANDALONE_QUESTION_TEMPLATE, QA_TEMPLATE } from "./prompt-templates";

type callChainArgs = {
  question: string;
  chatHistory: string;
};

export async function callChain({ question, chatHistory }: callChainArgs) {
  try {
    // Open AI recommendation
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const pineconeClient = await getPineconeClient();
    const vectorStore = await getVectorStore(pineconeClient);
    const { stream, handlers } = LangChainStream({
      experimental_streamData: true,
    });
    const data = new experimental_StreamData();

    const chain = ConversationalRetrievalQAChain.fromLLM(
      streamingModel,
      vectorStore.asRetriever(),
      {
        qaTemplate: QA_TEMPLATE, // Final answer template
        questionGeneratorTemplate: STANDALONE_QUESTION_TEMPLATE,
        returnSourceDocuments: true, //default 4
        questionGeneratorChainOptions: {
          llm: nonStreamingModel,
        },
      }
    );

    // Question using chat-history
    // Reference https://js.langchain.com/docs/modules/chains/popular/chat_vector_db#externally-managed-memory
    chain
      .call(
        {
          question: sanitizedQuestion,
          chat_history: chatHistory,
        },
        [handlers]
      )
      .then(async (res) => {
        const sourceDocuments = res?.sourceDocuments;
        const firstTwoDocuments = sourceDocuments.slice(0, 2);
        const pageContents = firstTwoDocuments.map(
          ({ pageContent }: { pageContent: string }) => pageContent
        );
        console.log("already appended ", data);
        data.append({
          sources: pageContents,
        });
        data.close();
      });

    // Return the readable stream
    return new StreamingTextResponse(stream, {}, data);
  } catch (e) {
    console.error(e);
    throw new Error("Call chain method failed to execute successfully!!");
  }
}




