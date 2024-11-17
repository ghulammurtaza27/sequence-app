import os
import uvicorn

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting server on port: {port}")
    uvicorn.run("api.main:app", host="0.0.0.0", port=port, reload=False)