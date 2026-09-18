# AI Learning Factory Service

This directory is reserved for importing the existing local AI Learning Factory project from:

`C:\AI_Server`

## Import policy
Import source code first without rewriting the working engine.

Expected initial mapping:

```
C:\AI_Server\api\                -> services/ai-learning-factory/api/
C:\AI_Server\avatar\sadtalker\ -> services/ai-learning-factory/avatar/sadtalker/
```

Before copying, exclude secrets, generated artifacts, virtual environments, caches, and large model weights.

The service should remain independently runnable as FastAPI and communicate with BizFlow AtoZ through HTTP APIs during the first integration phase.
