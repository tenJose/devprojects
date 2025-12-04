"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const message_controller_1 = require("../controllers/message.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all conversations for logged-in user
router.get("/conversations", auth_middleware_1.autenticar, message_controller_1.getConversations);
// Get messages for a specific conversation
router.get("/:otherUserId", auth_middleware_1.autenticar, message_controller_1.getMessages);
// Send a new message
router.post("/", auth_middleware_1.autenticar, message_controller_1.sendMessage);
// Mark messages as read
router.put("/:otherUserId/read", auth_middleware_1.autenticar, message_controller_1.markAsRead);
exports.default = router;
//# sourceMappingURL=message.routes.js.map