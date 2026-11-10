# FITSync: Build Guide + IDE Prompts

Generative AI-powered personalized workout and nutrition planner (BCA final year project).
Stack: React + Tailwind, Node + Express, MongoDB + Mongoose, Gemini/OpenAI API.

---

## 1. How to use this file

1. Create the project folder and put this file in it.
2. Paste **Section 8 (Master Context Prompt)** into your IDE's rules file first (`.cursorrules`, `CLAUDE.md`, `.github/copilot-instructions.md`, or Windsurf rules). This keeps the AI consistent across the whole project.
3. Then do the phases in Section 9 **one at a time**. Paste one phase prompt, run it, test it, commit to Git, then move on. Never paste all prompts at once.

---

## 2. Key design decisions (read before coding)

| Decision | Choice | Why |
|---|---|---|
| Maths vs AI | Calories and macros are computed by **your code**; AI only picks foods/exercises | AI is bad at arithmetic. This is also your project's strongest viva point. |
| AI output | Force **JSON** output, validate with **Zod**, retry once on failure | Prevents broken UI from malformed AI text |
| AI provider | Gemini API (free tier) behind a provider wrapper | Free for students; wrapper lets you swap to OpenAI later |
| Auth | JWT in httpOnly cookie, bcrypt for passwords | Simple and standard |
| Plan generation | Generate **day by day (7 small calls)** or 2 calls (meals, workouts), not one giant call | Fewer timeouts, fewer errors, easier to fix one day |
| Substitution chat | AI returns a **structured patch** (which meal to replace, new meal JSON), backend applies it | Safer than letting AI rewrite the whole plan |

---

## 3. Folder structure

```
fitsync/
├── client/                      # React (Vite) + Tailwind
│   └── src/
│       ├── api/                 # axios instance + API functions
│       ├── components/          # Navbar, MealCard, WorkoutCard, ChatBox, charts
│       ├── context/             # AuthContext
│       ├── pages/               # Login, Register, Onboarding, Dashboard,
│       │                        # MealPlan, WorkoutPlan, Progress, Chat
│       ├── hooks/
│       ├── App.jsx
│       └── main.jsx
├── server/
│   ├── src/
│   │   ├── config/              # db.js, env.js
│   │   ├── models/              # User, Profile, Plan, ProgressLog, ChatMessage
│   │   ├── routes/              # auth, profile, plan, progress, chat
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── nutrition.service.js   # BMR, TDEE, macros (pure functions)
│   │   │   ├── ai.service.js          # provider wrapper (Gemini/OpenAI)
│   │   │   ├── plan.service.js        # builds prompts, validates, saves plan
│   │   │   └── chat.service.js        # substitution logic
│   │   ├── prompts/             # prompt templates as separate files
│   │   ├── validators/          # Zod schemas (AI output + request bodies)
│   │   ├── middleware/          # auth, errorHandler, rateLimit
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── tests/                   # nutrition.service tests (Jest)
│   └── .env.example
├── .gitignore
└── README.md
```

---

## 4. Database models (Mongoose)

**User**: name, email (unique), passwordHash, createdAt

**Profile** (one per user): userId, age, gender, heightCm, weightKg, activityLevel (`sedentary|light|moderate|active|very_active`), goal (`lose|maintain|gain`), dietType (`veg|non-veg|vegan|eggetarian`), allergies [String], cuisinePreference, equipment [String] (`none|dumbbells|barbell|resistance_bands|full_gym`), workoutDaysPerWeek, sessionMinutes, computed: bmr, tdee, targetCalories, protein, carbs, fat

**Plan**: userId, weekStart, targets {calories, protein, carbs, fat}, meals: [{day (1-7), slots: [{type: breakfast|lunch|snack|dinner, name, ingredients[], calories, protein, carbs, fat, completed}]}], workouts: [{day, isRest, focus, exercises: [{name, sets, reps, restSec, notes}], completed}], version, isActive

**ProgressLog**: userId, date, weightKg, mealsCompleted, workoutCompleted, caloriesConsumed, proteinConsumed, carbsConsumed, fatConsumed

**ChatMessage**: userId, planId, role (`user|assistant`), content, appliedChange (optional object), createdAt

---

## 5. API endpoints

| Method | Route | Purpose |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login, set cookie |
| POST | /api/auth/logout | Clear cookie |
| GET | /api/auth/me | Current user |
| POST | /api/profile | Save onboarding data, compute BMR/TDEE/macros |
| GET | /api/profile | Get profile + targets |
| PUT | /api/profile | Update and recompute |
| POST | /api/plan/generate | Generate 7-day meal + workout plan |
| GET | /api/plan/current | Get active plan |
| PATCH | /api/plan/meal/:day/:slot/complete | Mark meal done |
| PATCH | /api/plan/workout/:day/complete | Mark workout done |
| POST | /api/chat | Send message, get reply, apply plan change |
| GET | /api/chat/history | Chat history |
| POST | /api/progress | Log weight/daily data |
| GET | /api/progress | Get logs for charts |

---

## 6. Core logic (nutrition engine)

**Mifflin-St Jeor BMR**
- Male: `10*kg + 6.25*cm - 5*age + 5`
- Female: `10*kg + 6.25*cm - 5*age - 161`

**TDEE** = BMR x activity multiplier
sedentary 1.2, light 1.375, moderate 1.55, active 1.725, very_active 1.9

**Target calories**: lose = TDEE - 500 (never below 1200 female / 1500 male), maintain = TDEE, gain = TDEE + 300

**Macros**: protein 1.8 g/kg body weight (1.6 for maintain), fat 25% of calories, carbs = remaining calories / 4
(protein and carbs = 4 kcal/g, fat = 9 kcal/g)

Write these as pure functions with unit tests. Example: male, 25, 175 cm, 70 kg, moderate: BMR = 1673.75, TDEE = about 2594.

---

## 7. AI design

**Generation flow**
1. Load profile + computed targets.
2. Build prompt from template (targets, diet, allergies, equipment, days, minutes).
3. Call AI with JSON-only instruction (use the provider's JSON mode / response schema if available).
4. Parse, validate with Zod.
5. Check daily calories are within about 5-8% of target. If not, retry once with a correction message ("Day 3 was 2100 kcal, target 2400, fix it"). If still off, scale portions in code.
6. Save to MongoDB.

**Chat substitution flow**
1. User: "I don't have paneer today."
2. Backend sends AI: current day's meals + targets + the user message.
3. AI returns JSON like `{ "reply": "...", "change": { "day": 2, "slot": "lunch", "newMeal": {...} } }` or `change: null` if only answering a question.
4. Backend validates, checks macros are close to the replaced meal, updates the plan, bumps `version`, and saves the chat message.

**Safety rules (put in prompts and UI)**
- Show a disclaimer: general guidance, not medical advice.
- Never go below minimum calories. Reject extreme goals.
- Respect allergies as hard constraints. Re-check generated ingredients against the allergy list in code too.

---

## 8. MASTER CONTEXT PROMPT (put this in your IDE rules file)

```
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
```

---

## 9. Phase-by-phase plan and prompts

Suggested timeline (about 6 weeks, adjust to your deadline). Split work among the 4 members, for example: Dhruv = backend core/AI, Yash = frontend pages, Samarth = dashboard/charts/progress, Manikant = testing/docs/deployment. Use Git branches per feature.

### Phase 0: Setup (Day 1-2)

```
Set up the FITSync monorepo. Create /client with Vite + React + Tailwind +
React Router + Axios, and /server with Express (ES modules), mongoose, dotenv,
cors, cookie-parser, helmet, express-rate-limit, zod, bcryptjs, jsonwebtoken,
nodemon. Create the folder structure from the master context. Add
server/src/config/db.js (Mongo connection), app.js, server.js, a
/api/health route, central errorHandler middleware, .env.example
(PORT, MONGO_URI, JWT_SECRET, GEMINI_API_KEY, CLIENT_URL), and .gitignore.
Add npm scripts to run both. Do not build features yet.
```

### Phase 1: Authentication (Week 1)

```
Build authentication. Backend: User model, POST /api/auth/register, /login,
/logout, GET /api/auth/me. Hash passwords with bcrypt, sign JWT, store it in
an httpOnly cookie, add auth middleware, validate bodies with Zod.
Frontend: AuthContext, Login and Register pages with Tailwind forms and error
messages, a ProtectedRoute component, and a Navbar that shows login state.
Tell me how to test it in Postman.
```

### Phase 2: Nutrition engine + onboarding (Week 1-2)

```
Create server/src/services/nutrition.service.js with pure functions:
calculateBMR (Mifflin-St Jeor), calculateTDEE (activity multipliers
1.2/1.375/1.55/1.725/1.9), calculateTargetCalories (lose -500, maintain 0,
gain +300, with safety minimum 1200 female / 1500 male), calculateMacros
(protein 1.8 g/kg for lose/gain and 1.6 for maintain, fat 25% of calories,
carbs remainder), and one function computeAllTargets(profile).
Write Jest tests, including male 25y 175cm 70kg moderate => BMR 1673.75.
Then create the Profile model, POST/GET/PUT /api/profile routes (compute and
store targets on save), and a multi-step Onboarding page in React (body
metrics -> goal and activity -> diet and allergies -> equipment and schedule)
that shows the calculated calories and macros at the end.
```

### Phase 3: AI service + plan generator (Week 2-3) *(core of the project)*

```
Build the AI plan generator.
1. server/src/services/ai.service.js: a function generateJSON({system, user})
   that calls Gemini with JSON output, has timeout handling, and returns the
   parsed object. Keep the provider isolated so it can be swapped.
2. validators/plan.schema.js: Zod schemas for a meal slot
   (type, name, ingredients[], calories, protein, carbs, fat), a day of meals,
   a workout day (isRest, focus, exercises[{name, sets, reps, restSec, notes}]).
3. prompts/: template files that take profile + targets and instruct the
   model to return ONLY JSON in the exact schema, respect diet type, allergies,
   cuisine, available equipment, workout days per week and session length, and
   stay within +/-5% of daily calorie target.
4. plan.service.js: generate the plan (meals and workouts as separate calls),
   validate with Zod, check each day's calories against target and allergies
   in code, retry once with a correction message if invalid, then save the
   Plan model.
5. Routes: POST /api/plan/generate, GET /api/plan/current.
Add clear error messages. Do not build the frontend yet. Give me a sample
Postman request and sample response.
```

### Phase 4: Plan display UI (Week 3)

```
Build the frontend for the plan. A Dashboard page with today's meals, today's
workout and calorie/macro summary cards. A MealPlan page with a 7-day tab
view of MealCards (name, ingredients, macros), a WorkoutPlan page with
WorkoutCards (exercise, sets x reps, rest). Add a "Generate my plan" button
with a loading state (generation takes 10-30 seconds), and handle the empty
and error states. Add checkboxes to mark meals/workouts complete using
PATCH /api/plan/meal/:day/:slot/complete and /api/plan/workout/:day/complete
(implement these routes too). Mobile responsive.
```

### Phase 5: Conversational assistant (Week 4) *(second core feature)*

```
Build the chat assistant for plan modification.
Backend: ChatMessage model, chat.service.js, POST /api/chat and
GET /api/chat/history. The service loads the user's active plan and targets,
sends the AI the relevant day's meals, daily targets and the user message,
and requires JSON output: { reply: string, change: null | { type: "meal" |
"exercise", day: number, slot: string, newItem: {...} } }. Validate with Zod,
re-check allergies, verify the replacement is within ~10% calories of the
original meal, apply the change to the Plan in MongoDB, bump plan.version,
and store both chat messages.
Frontend: a ChatBox component (floating or a dedicated page) with message
bubbles, a loading indicator, quick-suggestion chips ("No paneer today",
"Only 20 minutes", "Travelling, no equipment"), and the plan UI refreshing
automatically after a change.
```

### Phase 6: Progress tracking (Week 4-5)

```
Build progress tracking. ProgressLog model and POST/GET /api/progress.
Auto-calculate daily calories and macros consumed from completed meals.
Frontend Progress page with Recharts: weight trend line chart, daily calorie
vs target bar chart, weekly adherence percentage, and a workout streak
counter. Add a quick "Log today's weight" form on the dashboard.
```

### Phase 7: Hardening and polish (Week 5)

```
Review the whole project for quality: add rate limiting on /api/plan/generate
and /api/chat, helmet, input sanitization, loading and error states on every
page, a medical disclaimer on the plan page, and a settings page to edit the
profile and regenerate the plan. List any bugs or security issues you find
and fix them. Add Postman collection notes to README.
```

### Phase 8: Deployment and docs (Week 6)

```
Prepare for deployment: server on Render, client on Vercel, MongoDB Atlas.
Add environment variable docs, CORS config for the production client URL,
secure cookie settings for production, and a complete README with setup
steps, feature list, API endpoint table, and architecture overview.
```

---

## 10. Testing checklist

- [ ] Nutrition functions match hand-calculated values (Jest)
- [ ] Register, login, logout, protected routes work
- [ ] Vegetarian profile never returns meat; peanut allergy never returns peanuts
- [ ] Each generated day is within about 5% of the calorie target
- [ ] "Dumbbells only" profile contains no barbell/machine exercises
- [ ] Chat swap ("no paneer") changes only one meal and keeps macros close
- [ ] Malformed AI output is retried and fails gracefully
- [ ] Progress charts update after logging

---

## 11. Tips for the IDE and for your viva

- **One phase per session.** Commit after each working phase so you can roll back when the AI breaks something.
- If the IDE output is wrong, paste the exact error and the file name instead of saying "it doesn't work."
- Ask the IDE to "explain this file in simple words" for every major file. You must be able to explain it in the viva.
- Keep your API key only in `.env`. Never commit it. Check `.gitignore` before the first push.
- Free-tier AI limits are small. Cache generated plans, and don't regenerate on every page load.
- **Viva talking point:** deterministic engine (BMR/TDEE/macros) plus generative AI (food and exercise selection) plus validation layer. This hybrid design is why the plans are accurate and not just chatbot text.
- Add a one-line disclaimer: "FITSync provides general guidance and is not a substitute for professional medical advice."

---

## 12. Optional extras if you finish early

- Grocery list generated from the week's meals
- Regenerate a single day
- Export plan as PDF
- Dark mode
- Indian food focus (dal, roti, paneer, etc.) to make it unique
