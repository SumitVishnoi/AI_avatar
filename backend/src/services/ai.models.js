import { ChatGoogle } from "@langchain/google";

const model = new ChatGoogle("gemini-3.5-flash-lite");

const res = await model.invoke([
  ["human", "What would be a good company name for a company that makes colorful socks?"],
]);

console.log(res)