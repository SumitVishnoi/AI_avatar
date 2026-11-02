import express from "express"
import chatRouter from "./routes/chat.routes.js"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use("/api/chat", chatRouter)

export default app