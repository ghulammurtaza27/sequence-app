from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from OCC.Core.STEPControl import STEPControl_Reader
from OCC.Core.StlAPI import StlAPI_Writer
from OCC.Core.BRepMesh import BRepMesh_IncrementalMesh
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
    return {"status": "ok"}

@app.post("/api/convert-step")
async def convert_step_to_stl(file: UploadFile = File(...)):
    try:
        # Create temporary files for STEP and STL
        with tempfile.NamedTemporaryFile(suffix='.step', delete=False) as temp_step, \
             tempfile.NamedTemporaryFile(suffix='.stl', delete=False) as temp_stl:
            
            # Save uploaded STEP file
            content = await file.read()
            temp_step.write(content)
            temp_step.flush()
            
            # Read STEP file
            step_reader = STEPControl_Reader()
            status = step_reader.ReadFile(temp_step.name)
            
            if status != IFSelect_RetDone:
                raise Exception("Error reading STEP file")
            
            step_reader.TransferRoots()
            shape = step_reader.OneShape()
            
            # Mesh the shape
            mesh = BRepMesh_IncrementalMesh(shape, 0.1)
            mesh.Perform()
            
            # Write STL file
            stl_writer = StlAPI_Writer()
            stl_writer.Write(shape, temp_stl.name)
            
            # Read the STL file content
            with open(temp_stl.name, 'rb') as stl_file:
                stl_content = stl_file.read()
            
            # Clean up temporary files
            os.unlink(temp_step.name)
            os.unlink(temp_stl.name)
            
            # Return the STL file
            return Response(
                content=stl_content,
                media_type="application/octet-stream",
                headers={
                    "Content-Disposition": f'attachment; filename="{file.filename.replace(".step", ".stl")}"'
                }
            )
            
    except Exception as e:
        print(f"Error: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )