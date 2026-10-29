import { PDFParse } from "pdf-parse";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 0,
});

const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  dimensions: 1024,
});

export const messageContent = async (req, res) => {
  console.log(req.file);

  if (req.file) {
    const data = req.file;
    const fileUint8Array = new Uint8Array(data.buffer);

    const parser = new PDFParse(fileUint8Array);
    const document = await parser.getText();

    console.log(document);
    const texts = await splitter.splitText(document.text);

    console.log(texts);

    const embeddingText = await embeddings.embedDocuments(texts);
    console.log(embeddingText);
  }
};
