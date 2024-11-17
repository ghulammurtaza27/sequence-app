from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from OCC.Core.STEPControl import STEPControl_Reader
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.StlAPI import StlAPI_Writer
from OCC.Core.IFSelect import IFSelect_RetDone
import tempfile
import os

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://sequence-app-xpou.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)




@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "message": "API is running"
    }


@app.post("/api/convert-step")
async def convert_step_to_stl(file: UploadFile = File(...)):
    try:
        # Log file details
        print(f"Received file: {file.filename}")
        
        # Validate file extension
        if not file.filename.lower().endswith(('.step', '.stp')):
            return JSONResponse(
                status_code=400,
                content={"detail": "Invalid file format. Please upload a STEP file."}
            )

        # Create temporary files
        with tempfile.NamedTemporaryFile(suffix='.step', delete=False) as temp_step:
            content = await file.read()
            temp_step.write(content)
            temp_step.flush()

        temp_stl = tempfile.NamedTemporaryFile(suffix='.stl', delete=False)
        temp_stl.close()

        try:
            # Read STEP file
            reader = STEPControl_Reader()
            status = reader.ReadFile(temp_step.name)

            if status == IFSelect_RetDone:
                reader.TransferRoots()
                shape = reader.OneShape()

                # Mesh the shape
                mesh = BRepMesh_IncrementalMesh(shape, 0.1)
                mesh.Perform()

                # Write to STL
                writer = StlAPI_Writer()
                writer.Write(shape, temp_stl.name)

                # Read the STL file
                with open(temp_stl.name, 'rb') as stl_file:
                    stl_content = stl_file.read()

                return Response(
                    content=stl_content,  # Your converted STL content
                    media_type="application/octet-stream",
                    headers={
                        "Content-Disposition": f'attachment; filename="{file.filename.replace(".step", ".stl")}"'
                    }
        )
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Failed to read STEP file"
                )

        finally:
            # Clean up temp files
            if os.path.exists(temp_step.name):
                os.unlink(temp_step.name)
            if os.path.exists(temp_stl.name):
                os.unlink(temp_stl.name)

     except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 