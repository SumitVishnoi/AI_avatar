import express from "express";
import { createAvatarToken } from "../controller/livekit.controller.js";

const router = express.Router();

router.post("/token", createAvatarToken);

export default router;