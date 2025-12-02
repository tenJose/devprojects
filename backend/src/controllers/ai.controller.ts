import { Request, Response } from 'express';

// Controller to generate a project skeleton from a prompt using Google Gemini API
export const generateFromPrompt = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Prompt requerido' });
    }

    const apiKey = process.env.GOOGLE_AI_KEY;
    console.log(`[AI] Generando proyecto desde prompt: "${prompt.slice(0, 80)}..."`);
    console.log(`[AI] API Key disponible: ${!!apiKey}`);
    
    if (!apiKey) {
      console.warn('[AI] GOOGLE_AI_KEY no configurada, usando fallback');
      return res.status(501).json({ success: false, message: 'AI not configured on server' });
    }

    // Build a very detailed prompt requesting structured JSON for Gemini
    // Emphasize that the assistant should IMPROVE the project title and description
    const userPrompt = `Eres un arquitecto de software y redactor experto. Analiza la IDEA DEL USUARIO y produce UNA ESPECIFICACIÓN COMPLETA en formato JSON.

User Idea: "${prompt}"

REGLAS OBLIGATORIAS (leer atentamente):
- Detecta explícitamente si el usuario menciona "móvil", "aplicación móvil", "app", "iOS", "Android", "Flutter", "React Native" u otras palabras relacionadas: si aparece cualquiera de estas, establece el campo "type": "Mobile" y rellena el campo "platform" (ej: "iOS", "Android", "Cross-platform", "Web").
- Si el usuario no menciona plataforma, infiere el tipo más probable a partir del texto.
- Mejora el título del proyecto: devuelve un título corto, claro y listo para mercado en español.
- Mejora la descripción: devuelve una descripción técnica pulida en español (2-4 frases) que incluya principales características, consideraciones de arquitectura y funcionalidades clave.
- Devuelve 3 sugerencias alternativas de título (cortas y comerciales) en español.
- Incluye un arreglo "features" con 5-12 funcionalidades clave (strings) si aplica.
- Recomienda un "techStack" apropiado; si el tipo es Mobile, prefiere React Native o Flutter y menciona integraciones móviles (push notifications, in-app purchases, autenticación nativa, publicación en App Store/Play Store).
- Siempre incluye un campo "platform" (string) y un campo "type" con uno de: Frontend, Backend, Full Stack, Mobile, DevOps, UI/UX, Data Science.
- Devuelve estimación de "duration" (string), "budget" (number en USD), y "teamSize" (string).
- Responde SOLO con JSON válido sin texto adicional ni explicaciones.

Devuelve este objeto JSON con las claves (obligatorias cuando apliquen):
{
  "title": "string",
  "title_suggestions": ["string","string","string"],
  "description": "string",
  "techStack": ["string"],
  "type": "string - Frontend|Backend|Full Stack|Mobile|DevOps|UI/UX|Data Science",
  "platform": "string - iOS|Android|Cross-platform|Web|Other",
  "features": ["string"],
  "duration": "string",
  "budget": number,
  "teamSize": "string"
}`;

    const body = {
      contents: [
        {
          parts: [
            { text: userPrompt }
          ]
        }
      ]
    };

    console.log('[AI] Enviando request a Gemini API...');
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('[AI] Gemini error:', resp.status, txt);
      return res.status(502).json({ success: false, message: 'AI provider error' });
    }

    const data = await resp.json();
    console.log('[AI] Response de Gemini recibida');
    
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[AI] Contenido de respuesta:', content.slice(0, 200));

    // Try to extract JSON from the assistant reply
    let parsed: any = null;
    try {
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? content.substring(firstBrace, lastBrace + 1) : content;
      parsed = JSON.parse(jsonText);
      console.log('[AI] JSON parseado exitosamente');
    } catch (err) {
      console.error('[AI] Error parseando JSON:', err, 'Content:', content);
      return res.status(200).json({ success: true, raw: content });
    }

    // Normalize and augment parsed JSON to be robust for the frontend
    try {
      const normalized: any = {};

      const lowerPrompt = String(prompt || '').toLowerCase();

      // Helpers
      const isMobileKeyword = (text: string) => /móvil|movil|aplicación móvil|app|ios|android|flutter|react native|react-native|reactnative/.test(text);

      // Title
      normalized.title = parsed.title || parsed.name || parsed.titulo || '';
      // Title suggestions (try several possible key names)
      normalized.title_suggestions = parsed.title_suggestions || parsed.titleSuggestions || parsed.title_alternatives || parsed.suggestions || [];
      if (!Array.isArray(normalized.title_suggestions)) normalized.title_suggestions = [];
      // If no title but we have suggestions, pick first as title
      if (!normalized.title && normalized.title_suggestions.length) normalized.title = normalized.title_suggestions[0];

      // Description
      normalized.description = parsed.description || parsed.descripcion || parsed.description_improved || '';

      // Tech stack
      normalized.techStack = parsed.techStack || parsed.tecnologias || parsed.tech || [];
      if (typeof normalized.techStack === 'string') {
        try { normalized.techStack = JSON.parse(normalized.techStack); } catch { normalized.techStack = [normalized.techStack]; }
      }
      if (!Array.isArray(normalized.techStack)) normalized.techStack = [];

      // Type and platform: prefer parsed, else infer from prompt
      normalized.type = parsed.type || parsed.tipo || '';
      normalized.platform = parsed.platform || parsed.plataforma || '';
      if (!normalized.type) {
        if (isMobileKeyword(lowerPrompt) || isMobileKeyword(JSON.stringify(parsed).toLowerCase())) {
          normalized.type = 'Mobile';
        } else {
          normalized.type = 'Full Stack';
        }
      }
      if (!normalized.platform) {
        if (isMobileKeyword(lowerPrompt)) {
          // If mobile, try to detect iOS/Android keywords
          if (/ios/.test(lowerPrompt)) normalized.platform = 'iOS';
          else if (/android/.test(lowerPrompt)) normalized.platform = 'Android';
          else normalized.platform = 'Cross-platform';
        } else {
          normalized.platform = 'Web';
        }
      }

      // Features
      normalized.features = parsed.features || parsed.funcionalidades || parsed.features_list || parsed.featuresList || [];
      if (typeof normalized.features === 'string') {
        // try to split by commas or newlines
        normalized.features = normalized.features.split(/\n|,|;|\.|\-|\u2022/).map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }
      if (!Array.isArray(normalized.features)) normalized.features = [];

      // Duration, budget, teamSize
      normalized.duration = parsed.duration || parsed.duracion || '';
      normalized.budget = parsed.budget || parsed.presupuesto || null;
      if (typeof normalized.budget === 'string') {
        const num = Number(normalized.budget.replace(/[^0-9\.]/g, ''));
        normalized.budget = isNaN(num) ? null : num;
      }
      normalized.teamSize = parsed.teamSize || parsed.tamanoEquipo || parsed.team_size || '';

      // If techStack is empty, infer reasonable defaults based on type
      if (!normalized.techStack || normalized.techStack.length === 0) {
        if (String(normalized.type).toLowerCase() === 'mobile') normalized.techStack = ['React Native', 'Firebase'];
        else if (String(normalized.type).toLowerCase().includes('full')) normalized.techStack = ['React', 'Node.js', 'MySQL'];
        else normalized.techStack = ['React'];
      }

      // Populate simple budget/duration/teamSize defaults if not provided
      if (!normalized.duration) {
        if (String(normalized.type).toLowerCase() === 'mobile') normalized.duration = '2-4 meses';
        else if (String(normalized.type).toLowerCase().includes('full')) normalized.duration = '3-6 meses';
        else normalized.duration = '1-3 meses';
      }
      if (!normalized.budget) {
        if (String(normalized.type).toLowerCase() === 'mobile') normalized.budget = 15000;
        else if (String(normalized.type).toLowerCase().includes('full')) normalized.budget = 30000;
        else normalized.budget = 8000;
      }
      if (!normalized.teamSize) {
        if (String(normalized.type).toLowerCase() === 'mobile') normalized.teamSize = '2-4';
        else if (String(normalized.type).toLowerCase().includes('full')) normalized.teamSize = '3-6';
        else normalized.teamSize = '1-2';
      }

      // Ensure at least 3 title suggestions by creating variations if needed
      if (!normalized.title_suggestions || normalized.title_suggestions.length < 3) {
        const base = normalized.title || (typeof prompt === 'string' ? (prompt.split(/[.,]/)[0] || prompt).slice(0, 40) : 'Proyecto');
        normalized.title_suggestions = normalized.title_suggestions.concat([
          `${base} - App moderna`,
          `${base} - MVP rápido`,
          `${base} - Plataforma`,
        ]).slice(0, 3);
      }

      // Return normalized data
      return res.status(200).json({ success: true, data: normalized });
    } catch (err) {
      console.error('[AI] Error normalizando resultado:', err);
      return res.status(200).json({ success: true, data: parsed });
    }
  } catch (error) {
    console.error('[AI] generateFromPrompt error', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


export const generateQuestions = async (req: Request, res: Response) => {
  try {
    const { prompt, history } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Prompt requerido' });
    }

    const apiKey = process.env.GOOGLE_AI_KEY;
    
    console.log(`[AI-Q] Generando preguntas para: "${prompt.slice(0, 80)}..."`);
    console.log(`[AI-Q] Historial: ${Array.isArray(history) ? history.length : 0} items`);
    console.log(`[AI-Q] API Key disponible: ${!!apiKey}`);
    
    // If no API key AND this is the first question (no history), return empty questions to trigger final generation
    if (!apiKey) {
      console.warn('[AI-Q] GOOGLE_AI_KEY no configurada, usando fallback');
      const hist: any[] = Array.isArray(history) ? history : [];
      
      // On first call (just the idea), return done=true to go directly to generation
      if (hist.length <= 1) {
        return res.status(200).json({ success: true, questions: [], done: true });
      }
      
      return res.status(200).json({ success: true, questions: [], done: true });
    }

    // Build smart prompt for Gemini to assess if more info is needed or if we can generate
    const historyText = Array.isArray(history) && history.length ? 
      history.map((h: any, i: number) => `Q${i}: ${h.question}\nA${i}: ${h.answer}`).join('\n') : '';
    
    const userPrompt = `You are a software project expert. Evaluate if you have enough information to generate a complete project specification.

User's Project Idea: "${prompt}"

${historyText ? `Conversation so far:\n${historyText}\n` : ''}

DECISION RULES:
- If this is the FIRST message (only user idea, no history) or you have the basic idea clearly, respond with { "questions": [], "done": true } to proceed with generation
- Only ask follow-up questions if you REALLY need clarification on critical aspects (architecture type, budget range, timeline, key features)
- Ask in Spanish, be direct and specific
- Maximum 1 question per response

Respond ONLY with valid JSON in this exact format:
{
  "questions": ["question1", "question2"],
  "done": false
}

Or if ready to generate:
{
  "questions": [],
  "done": true
}`;

    const body = {
      contents: [
        {
          parts: [
            { text: userPrompt }
          ]
        }
      ]
    };

    console.log('[AI-Q] Enviando request a Gemini...');
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error('[AI-Q] Gemini error:', resp.status, txt);
      // Fallback: if we have the idea, proceed to generation
      return res.status(200).json({ success: true, questions: [], done: true });
    }

    const data = await resp.json();
    console.log('[AI-Q] Response recibida');
    
    const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('[AI-Q] Contenido:', content.slice(0, 300));

    try {
      const firstBrace = content.indexOf('{');
      const lastBrace = content.lastIndexOf('}');
      const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? content.substring(firstBrace, lastBrace + 1) : content;
      const parsed = JSON.parse(jsonText);
      const questions = Array.isArray(parsed.questions) ? parsed.questions.filter((q: any) => q && typeof q === 'string').slice(0, 1) : [];
      const done = !!parsed.done;
      
      console.log(`[AI-Q] Resultado: ${questions.length} preguntas, done=${done}`);
      return res.status(200).json({ success: true, questions, done });
    } catch (err) {
      console.error('[AI-Q] Error parseando JSON:', err, 'Content:', content);
      // Default: proceed to generation
      return res.status(200).json({ success: true, questions: [], done: true });
    }
  } catch (error) {
    console.error('[AI-Q] generateQuestions error', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

