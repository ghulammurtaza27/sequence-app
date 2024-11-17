from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from OCC.Core.STEPControl import STEPControl_Reader
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
from OCC.Core.StlAPI import StlAPI_Writer
from OCC.Core.IFSelect import IFSelect_RetDone
import tempfile
import os
from flask_cors import CORS
from flask import Flask

app = FastAPI()

# Configure CORS - update with your frontend URL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://sequence-app-xi.vercel.app/"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add a health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/convert-step")
async def convert_step_to_stl(file: UploadFile = File(...)):
    try:
        # Validate file extension
        if not file.filename.lower().endswith(('.step', '.stp')):
            raise HTTPException(
                status_code=400,
                detail="Invalid file format. Please upload a STEP file."
            )

        # Create temporary files for input and output
        with tempfile.NamedTemporaryFile(suffix='.step', delete=False) as temp_step:
            # Write uploaded file to temp
            content = await file.read()
            temp_step.write(content)
            temp_step.flush()

        # Create temp file for STL output
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
                    content=stl_content,
                    media_type='application/octet-stream',
                    headers={
                        'Content-Disposition': f'attachment; filename=converted.stl'
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
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 