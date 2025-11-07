"""
Main FastAPI application
"""
from fastapi import FastAPI

app = FastAPI()

# TEMPLATE-ONLY:START
# This block should be removed by cleanup
def template_only_function():
    """This is template-only code"""
    return "Should not exist in production"
# TEMPLATE-ONLY:END

@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Hello World"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok"}

# @template-only
def another_template_function():
    """This line-tagged function should be removed"""
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

