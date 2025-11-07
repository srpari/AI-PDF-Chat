// src/types/langchain-chains.d.ts
declare module "@langchain/core/dist/chains/conversational_retrieval_qa" {
  import { BaseLanguageModel } from "@langchain/core";
  import { BaseRetriever } from "@langchain/core";

  type ConversationalRetrievalQAChainOptions = {
    qaTemplate?: string;
    questionGeneratorTemplate?: string;
    returnSourceDocuments?: boolean;
    questionGeneratorChainOptions?: { llm: BaseLanguageModel };
  };

  export class ConversationalRetrievalQAChain {
    static fromLLM(
      llm: BaseLanguageModel,
      retriever: BaseRetriever,
      options?: ConversationalRetrievalQAChainOptions
    ): ConversationalRetrievalQAChain;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    call(input: any, callbacks?: any[]): Promise<any>;
  }
}
