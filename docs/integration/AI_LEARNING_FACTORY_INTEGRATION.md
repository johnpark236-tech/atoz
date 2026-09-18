# BizFlow AtoZ + AI Learning Factory Integration

## Decision
Use Option 1: BizFlow AtoZ remains the top-level product and AI Learning Factory is imported as a content-generation engine.

## Target architecture
- Frontend / business workflow: existing BizFlow AtoZ (React/Vite)
- Business backend: existing Node/Express backend
- Content engine: existing AI Learning Factory FastAPI service
- Integration style: monorepo + internal HTTP API boundary
- Do not rewrite the FastAPI engine into Node during Phase 1.

## Planned repository layout

```
atoz/
├─ src/                         # existing AtoZ frontend
├─ server.ts                    # existing AtoZ Node/Express backend
├─ services/
│  └─ ai-learning-factory/
│     ├─ api/
│     │  ├─ main.py
│     │  └─ templates/
│     ├─ avatar/
│     │  └─ sadtalker/
│     ├─ requirements.txt
│     ├─ .env.example
│     └─ README.md
├─ shared/
│  └─ contracts/
│     └─ content-generation.md
└─ docs/
   └─ integration/
      └─ AI_LEARNING_FACTORY_INTEGRATION.md
```

## Product flow

```
Idea
→ Market Research
→ Business Model
→ Build / Validate
→ Content Production
   ├─ Promotional script
   ├─ Promotional images
   ├─ Voice/TTS
   ├─ Promotional video
   ├─ Course curriculum
   ├─ Lesson plan / slides
   └─ Lesson video
→ Launch
→ Sell
→ Revenue / Settlement
```

## API boundary

AtoZ should send project context to AI Learning Factory instead of duplicating data entry.

Minimum project context:
- projectId
- projectName
- ideaSummary
- targetCustomer
- businessModel
- marketResearchSummary
- competitors
- differentiation
- productDescription
- lessonGoal
- targetLearner
- language
- requestedAssetType

Recommended endpoints:
- POST /api/content/projects
- POST /api/content/promotional-script
- POST /api/content/lesson-plan
- POST /api/content/voice
- POST /api/content/image
- POST /api/content/video
- GET  /api/content/jobs/:jobId
- GET  /api/content/assets/:assetId
- DELETE /api/content/assets/:assetId

## Critical rules
1. Keep all current AtoZ features working while integration is in progress.
2. Do not move secrets into frontend code.
3. Do not commit API keys, Google credentials, tokens, generated voice samples, private user audio, or large model weights.
4. Generated media must be stored outside Git source control.
5. Long video/audio jobs must be asynchronous jobs with status polling.
6. Existing Google TTS remains available as a provider; future cloned/open-source voices should use a provider abstraction.
7. SadTalker remains a downstream video/lip-sync worker initially.
8. Each generated asset must be linked to an AtoZ projectId.
9. Keep main branch deployable at all times.
10. Import the existing C:\AI_Server project first; refactor only after a baseline run passes.

## Integration phases

### Phase 0 — Baseline and backup
- Verify current AtoZ main build/tests.
- Verify C:\AI_Server starts and its current UI/TTS/SadTalker functions work.
- Record current dependencies and environment variables.
- Create a backup before moving anything.

### Phase 1 — Safe import
Copy C:\AI_Server into:
`services/ai-learning-factory/`

Exclude:
- venv/
- __pycache__/
- cache/
- generated media
- model weights if too large
- .env
- credentials
- tokens
- private audio

Goal: source import only. No destructive rewrite.

### Phase 2 — Health/API contract
Add/verify:
- GET /health
- version
- provider status
- TTS availability
- SadTalker availability
- job queue status

### Phase 3 — AtoZ integration UI
Add a top-level or roadmap section:
`콘텐츠 제작`

Subfeatures:
- 홍보영상 만들기
- 교안 만들기
- 교안 영상 만들기
- 생성 결과 / 버전 비교

### Phase 4 — Project context handoff
AtoZ passes existing project/market research context automatically.
Users should not re-enter the same business idea.

### Phase 5 — Job orchestration
Video jobs:
AtoZ → content request → jobId → worker → asset result → project history

### Phase 6 — Deployment split
- AtoZ frontend: existing deployment
- AtoZ lightweight backend: existing Cloud Run
- AI Learning Factory GPU/media backend: separate service/server
Do not force heavy GPU workloads into the existing lightweight AtoZ backend.

## Success criteria
- Existing AtoZ features regressions: NONE
- Existing AI Learning Factory features regressions: NONE
- One AtoZ project can generate a lesson plan using transferred context.
- One AtoZ project can request TTS and receive a playable audio asset.
- One AtoZ project can request a video and track job status.
- Generated assets remain linked to the original project.
- Secrets remain backend-only.
