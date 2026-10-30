import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index("avatar");

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  outputDimensionality: 1024,
});

export const messageContent = async (req, res) => {
  console.log(req.file);

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No PDF file uploaded",
    });
  }

  const data = req.file;
  const fileUint8Array = new Uint8Array(data.buffer);

  const parser = new PDFParse(fileUint8Array);
  const document = await parser.getText();

  console.log(document);
  const texts = await splitter.splitText(document.text);

  console.log(texts);

  // const embeddingText = await embeddings.embedDocuments(texts);
  // console.log(embeddingText);

  const documents = [];

  for (let i = 0; i < texts.length; i++) {
    documents.push({
      _id: `vec-${Date.now()}-${i}`,
      text: texts[i],
      fileName: data.originalname,
      chunkIndex: String(i),
    });
  }

  if (documents.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No documents available to upload",
    });
  }

  const result = await index.namespace("default").upsertDocuments({
    documents,
  });

  console.log("Upsert successful:", result);
};
