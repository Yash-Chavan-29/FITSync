# FITSync - Master Context & Rules

You are helping me build "FITSync", a BCA final-year project: a Generative
AI-powered personalized workout and nutrition planner.

STACK
- Frontend: React (Vite) + Tailwind CSS + React Router + Axios + Recharts
- Backend: Node.js + Express (ES modules), REST API
- Database: MongoDB with Mongoose
- AI: Google Gemini API (wrapped in services/ai.service.js so the provider
  can be swapped to OpenAI)
- Validation: Zod. Auth: JWT in httpOnly cookie + bcrypt.
- Testing: Jest for the nutrition service. Postman for API.

PROJECT STRUCTURE
Monorepo with /client and /server. Server uses
src/{config,models,routes,controllers,services,prompts,validators,middleware,utils}.
Follow this structure strictly.

NON-NEGOTIABLE RULES
1. Calories/macros (BMR via Mifflin-St Jeor, TDEE, macro split) are computed
   in code in nutrition.service.js as pure functions. The AI must never do
   this arithmetic; it only chooses foods and exercises to fit given targets.
2. All AI responses must be JSON, validated with Zod before use. On failure,
   retry once, then return a clean error.
3. Allergies are hard constraints: also re-check AI output in code.
4. Never hardcode secrets. Use .env and provide .env.example.
5. Every route has input validation, async error handling via a central
   errorHandler middleware, and consistent JSON responses
   ({ success, data, message }).
6. Keep code simple and readable (this is a student project that must be
   explained in a viva). Add short comments on non-obvious logic.
7. Work only on what I ask in each prompt. Do not refactor unrelated files.
8. After each task, tell me: files created/changed, how to run, how to test.

When something is ambiguous, ask me before assuming.
