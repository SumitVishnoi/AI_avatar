import express from "express"
import chatRouter from "./routes/chat.routes.js"
import livekitRouter from "./routes/livekit.routes.js"
import cors from "cors"

const app = express()

app.use(express.json())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))

app.use("/api/chat", chatRouter)
app.use("/api/livekit", livekitRouter)

export default app