"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const ai_controller_2 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
// POST /api/ai/generate
router.post('/generate', ai_controller_1.generateFromPrompt);
router.post('/questions', ai_controller_2.generateQuestions);
exports.default = router;
//# sourceMappingURL=ai.routes.js.map