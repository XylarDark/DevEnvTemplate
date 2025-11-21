# FastAPI Best Practices

## CORS Configuration

### Use Environment-Based Origins

```python
# ✅ CORRECT - Environment-based CORS
import os
from fastapi.middleware.cors import CORSMiddleware

cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if "*" not in cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### ❌ Don't Hardcode Origins

```python
# ❌ WRONG - Hardcoded CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Not configurable
    ...
)
```

## Demo Mode Support

### Support Public Access for Demos

```python
# ✅ CORRECT - Demo mode support
import os

DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"

def require_api_key(api_key: Optional[str] = Security(get_api_key_from_header)):
    """Dependency to require and validate API key."""
    # Demo mode: Allow public access
    if DEMO_MODE and not api_key:
        return {
            "tier": "DEMO",
            "license": None,
            "api_key": None,
        }
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required",
        )
    
    # ... rest of validation
```

## Error Handling

### Use Custom Exception Hierarchy

```python
# ✅ CORRECT - Custom exceptions with context
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from lunar_mining_sim.utils.exceptions import (
    LunarMiningError,
    ValidationError,
    SimulationError,
    LicenseError
)

@app.exception_handler(LunarMiningError)
async def lunar_mining_error_handler(request, exc: LunarMiningError):
    """Handle custom Lunar Mining Simulator exceptions."""
    if isinstance(exc, ValidationError):
        status_code = status.HTTP_400_BAD_REQUEST
    elif isinstance(exc, LicenseError):
        status_code = status.HTTP_403_FORBIDDEN
    else:
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    
    return JSONResponse(
        status_code=status_code,
        content={
            "error": exc.__class__.__name__,
            "message": str(exc),
            "context": exc.context,
        },
    )
```

### ❌ Avoid Generic Exception Handling

```python
# ❌ WRONG - Generic exception handling
@app.exception_handler(Exception)
async def global_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error"}  # No context
    )
```

## Request/Response Validation

### Use Pydantic Models

```python
# ✅ CORRECT - Pydantic models for validation
from pydantic import BaseModel, Field
from enum import Enum

class ScenarioType(str, Enum):
    LUNAR_FLAT_STANDARD = "lunar_flat_standard"
    LUNAR_COMPACTED = "lunar_compacted"

class SimulationRequest(BaseModel):
    scenario: ScenarioType = Field(
        default=ScenarioType.LUNAR_FLAT_STANDARD,
        description="Terrain scenario"
    )
    depth: float = Field(
        default=0.5,
        ge=0.1,
        le=1.0,
        description="Excavation depth in meters"
    )
    angle: float = Field(
        default=45.0,
        ge=0,
        le=90,
        description="Excavation angle in degrees"
    )

@router.post("/simulate", response_model=SimulationResponse)
async def simulate(request: SimulationRequest):
    # Pydantic automatically validates request
    ...
```

## API Documentation

### Auto-Generated Documentation

FastAPI automatically generates OpenAPI docs at `/docs` and ReDoc at `/redoc`.

```python
app = FastAPI(
    title="Lunar Mining Simulator API",
    description="REST API for physics-based lunar excavation simulation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)
```

### Document Endpoints

```python
@router.post("/simulate", response_model=SimulationResponse)
async def simulate(
    request: SimulationRequest,
    auth: Dict[str, Any] = Depends(require_api_key),
):
    """
    Run a simulation with specified parameters.
    
    Requires Professional or Enterprise license.
    
    - **scenario**: Terrain scenario to simulate
    - **depth**: Excavation depth in meters (0.1 to 1.0)
    - **angle**: Excavation angle in degrees (0 to 90)
    - **speed**: Tool speed in m/s (0.5 to 2.0)
    """
    ...
```

## Health Check Endpoint

### Implement Health Check

```python
@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint (public)."""
    manager = get_license_manager()
    tier = manager.get_license_tier()
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        license_tier=tier,
    )
```

## Rate Limiting

### Implement Rate Limiting

```python
from collections import defaultdict
from datetime import datetime, timedelta

_rate_limit_store: Dict[str, Dict[str, Any]] = defaultdict(dict)

def check_rate_limit(api_key: str, tier: str) -> bool:
    """Check if API key has exceeded rate limit."""
    limits = {
        "PROFESSIONAL": 1000,  # requests per day
        "ENTERPRISE": None,  # unlimited
    }
    
    daily_limit = limits.get(tier)
    if daily_limit is None:
        return True  # Unlimited
    
    today = datetime.now().date().isoformat()
    key = f"{api_key}:{today}"
    
    if key not in _rate_limit_store:
        _rate_limit_store[key] = {
            "count": 0,
            "reset_at": datetime.now() + timedelta(days=1),
        }
    
    store = _rate_limit_store[key]
    
    if datetime.now() > store["reset_at"]:
        store["count"] = 0
        store["reset_at"] = datetime.now() + timedelta(days=1)
    
    if store["count"] >= daily_limit:
        return False
    
    store["count"] += 1
    return True
```

## Environment Variables

### Use Environment Variables for Configuration

```python
import os

# API Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")
DEMO_MODE = os.getenv("DEMO_MODE", "false").lower() == "true"
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

# Database (if applicable)
DATABASE_URL = os.getenv("DATABASE_URL")

# Security
SECRET_KEY = os.getenv("SECRET_KEY")
```

### Provide .env.example

```bash
# .env.example
API_URL=http://localhost:8000
DEMO_MODE=false
CORS_ORIGINS=*
DATABASE_URL=
SECRET_KEY=
```

## Deployment

### Use Production ASGI Server

```bash
# Development
uvicorn lunar_mining_sim.api.server:app --reload

# Production
uvicorn lunar_mining_sim.api.server:app --host 0.0.0.0 --port $PORT
```

### Railway/Render Configuration

```json
// railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pip install -e ."
  },
  "deploy": {
    "startCommand": "uvicorn lunar_mining_sim.api.server:app --host 0.0.0.0 --port $PORT"
  }
}
```

## Checklist

Before committing FastAPI code:

- [ ] CORS configured with environment variables
- [ ] Demo mode supported (if applicable)
- [ ] Custom exception hierarchy used
- [ ] Pydantic models for all requests/responses
- [ ] Health check endpoint implemented
- [ ] Rate limiting configured
- [ ] Environment variables for configuration
- [ ] API documentation at `/docs`
- [ ] Production server configuration
- [ ] Error handling with context

