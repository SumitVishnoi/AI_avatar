import express from "express"
import multer from "multer"
import { messageContent } from "../controller/chat.controller.js"


const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post("/message", upload.single("file"), messageContent)

export default router