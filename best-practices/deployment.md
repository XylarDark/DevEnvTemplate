# Deployment Best Practices

## Environment Configuration

### Separate Development and Production

```bash
# Development (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
DEMO_MODE=true

# Production (set in deployment platform)
NEXT_PUBLIC_API_URL=https://api.example.com
DEMO_MODE=false
CORS_ORIGINS=https://app.example.com
```

### Never Commit Secrets

```bash
# .gitignore
.env
.env.local
.env*.local
*.pem
secrets/
```

## Frontend Deployment (Vercel)

### Vercel Configuration

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Environment Variables

Set in Vercel dashboard:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_API_KEY` - Optional API key

### Build Optimization

```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true, // For Vercel deployment
  },
}
```

## Backend Deployment (Railway/Render)

### Railway Configuration

```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -e ."
  },
  "deploy": {
    "startCommand": "uvicorn lunar_mining_sim.api.server:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Render Configuration

```yaml
# render.yaml
services:
  - type: web
    name: lunar-mining-sim-api
    env: python
    buildCommand: pip install -e .
    startCommand: uvicorn lunar_mining_sim.api.server:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
      - key: PORT
        value: 8000
      - key: DEMO_MODE
        value: "true"
      - key: CORS_ORIGINS
        value: "https://your-vercel-app.vercel.app"
```

## Health Checks

### Frontend Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
}
```

### Backend Health Check

```python
# Already implemented in FastAPI
@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint (public)."""
    ...
```

## Monitoring

### Error Tracking

Consider using Sentry for error tracking:

```typescript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

### Performance Monitoring

Use Vercel Analytics or Lighthouse CI for performance monitoring.

## Database (if applicable)

### Connection Pooling

```python
# Use connection pooling for production
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
)
```

## Security

### HTTPS Only

Ensure all deployments use HTTPS:
- Vercel: Automatic HTTPS
- Railway: Automatic HTTPS
- Render: Automatic HTTPS

### API Key Security

```python
# Never log API keys
logger.info(f"Request from tier: {tier}")  # OK
logger.info(f"API key: {api_key}")  # ❌ NEVER
```

## Checklist

Before deploying:

- [ ] Environment variables configured
- [ ] No secrets in code
- [ ] Health checks implemented
- [ ] CORS configured correctly
- [ ] HTTPS enabled
- [ ] Error tracking configured
- [ ] Performance monitoring set up
- [ ] Database connection pooling (if applicable)
- [ ] Logging configured
- [ ] Backup strategy (if applicable)

