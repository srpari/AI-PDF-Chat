// import { getChunkedDocsFromPDF } from "../lib/pdf-loader";
// import { embedAndStoreDocs } from "../lib/vector-store";
// import { getPineconeClient } from "../lib/pinecone-client";

// // This operation might fail because indexes likely need
// // more time to init, so give some 5 mins after index
// // creation and try again.
// (async () => {
//   try {
//     const pineconeClient = await getPineconeClient();
//     console.log("Preparing chunks from PDF file");
//     const docs = await getChunkedDocsFromPDF();
//     console.log(`Loading ${docs.length} chunks into pinecone...`);
//     await embedAndStoreDocs(pineconeClient, docs);
//     console.log("Data embedded and stored in pine-cone index");
//   } catch (error) {
//     console.error("Init client script failed ", error);
//   }
// })();


// src/scripts/pinecone-prepare-docs.ts
import "dotenv/config";
import fs from "fs";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeClient } from "../lib/pinecone-client";

const pdfPath = process.env.PDF_PATH!;
const batchSize = 20; // smaller batches to reduce rate limit issues
const retryDelayMs = 5000; // wait 5s between retries
const maxRetries = 3; // retry each batch up to 3 times

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  try {
    console.log("✅ Index already exists. Skipping creation.");

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found at ${pdfPath}`);
    }

    console.log("Preparing chunks from PDF file...");
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 2000, // larger chunks -> fewer embeddings
      chunkOverlap: 200,
    });

    const chunkedDocs = await splitter.createDocuments(
      docs.map((d) => d.pageContent)
    );
    console.log(`Loaded ${chunkedDocs.length} chunks from PDF`);

    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-ada-002",
    });

    const pineconeClient = await getPineconeClient();
    const index = pineconeClient.index(process.env.PINECONE_INDEX_NAME!);

    console.log(`Uploading chunks to Pinecone in batches of ${batchSize}...`);

    for (let i = 0; i < chunkedDocs.length; i += batchSize) {
      const batch = chunkedDocs.slice(i, i + batchSize);

      let attempt = 0;
      while (attempt < maxRetries) {
        try {
          await PineconeStore.fromDocuments(batch, embeddings, {
            pineconeIndex: index,
            textKey: "text",
          });
          console.log(`✅ Uploaded chunks ${i + 1}-${i + batch.length}`);
          break; // success → exit retry loop
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          attempt++;
          console.warn(
            `⚠️ Batch ${i + 1}-${i + batch.length} failed (attempt ${attempt}): ${err.message}`
          );
          if (attempt < maxRetries) {
            console.log(`⏳ Retrying in ${retryDelayMs / 1000}s...`);
            await sleep(retryDelayMs);
          } else {
            console.error("❌ Max retries reached for this batch. Skipping...");
          }
        }
      }

      // Wait 2 seconds between batches to avoid hitting rate limits
      await sleep(10000);
    }

    console.log("🎉 All chunks processed and uploaded!");
  } catch (err) {
    console.error("Init client script failed", err);
  }
}

main();
