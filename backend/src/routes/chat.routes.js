import express from "express"
import multer from "multer"

const router = express.Router()

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

router.post("/message", upload.single("file"),)


export default router