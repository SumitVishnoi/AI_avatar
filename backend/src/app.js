import express from "express"
import chatRouter from "./routes/chat.routes.js"

const app = express()

app.use(express.json())

app.use("/api/chat", chatRouter)

export default app