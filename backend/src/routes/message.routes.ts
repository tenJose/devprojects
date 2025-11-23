import { Router } from "express"
import { getConversations, getMessages, sendMessage, markAsRead } from "../controllers/message.controller"
import { autenticar } from "../middleware/auth.middleware"

const router = Router()

// Get all conversations for logged-in user
router.get("/conversations", autenticar, getConversations)

// Get messages for a specific conversation
router.get("/:otherUserId", autenticar, getMessages)

// Send a new message
router.post("/", autenticar, sendMessage)

// Mark messages as read
router.put("/:otherUserId/read", autenticar, markAsRead)

export default router
