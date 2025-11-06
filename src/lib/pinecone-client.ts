import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from "./utils";

let pineconeClientInstance: Pinecone | null = null;

// Create Pinecone index if it doesn't exist

async function createIndex(client: Pinecone, indexName: string) {
  try {
    const existingIndexes = await client.listIndexes();

    const indexExists = existingIndexes.indexes?.some(
      (idx) => idx.name === indexName
    );

    if (!indexExists) {
      console.log(`Creating index "${indexName}"...`);

      await client.createIndex({
        name: indexName,
        spec: {
            serverless: {
            cloud: "aws",
            region: "us-east-1",
            },
        },
        dimension: 1536,
        metric: "cosine",
     });

      console.log(
        `Waiting for ${env.INDEX_INIT_TIMEOUT} seconds for index initialization to complete...`
      );
      await delay(env.INDEX_INIT_TIMEOUT * 1000);
      console.log("✅ Index created successfully!");
    } else {
      console.log("✅ Index already exists. Skipping creation.");
    }
  } catch (error) {
    console.error("❌ Error creating index:", error);
    throw new Error("Index creation failed");
  }
}


// Initialize Pinecone client and ensure the index exists
async function initPineconeClient() {
  try {
    const pinecone = new Pinecone({
      apiKey: env.PINECONE_API_KEY,
    });

    const indexName = env.PINECONE_INDEX_NAME;
    await createIndex(pinecone, indexName);

    return pinecone;
  } catch (error) {
    console.error("❌ Failed to initialize Pinecone client:", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

export async function getPineconeClient() {
  if (!pineconeClientInstance) {
    pineconeClientInstance = await initPineconeClient();
  }
  return pineconeClientInstance;
}
