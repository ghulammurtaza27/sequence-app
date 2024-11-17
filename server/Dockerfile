# Stage 1: Build with conda
FROM continuumio/miniconda3 as builder

# Create conda environment
RUN conda create -n cad-env python=3.9
SHELL ["conda", "run", "-n", "cad-env", "/bin/bash", "-c"]

# Install OpenCASCADE
RUN conda install -c conda-forge -y pythonocc-core=7.7.0

# Stage 2: Final image
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /code

# Copy conda environment from builder
COPY --from=builder /opt/conda/envs/cad-env /opt/conda/envs/cad-env
ENV PATH="/opt/conda/envs/cad-env/bin:$PATH"

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Command to run the application
CMD ["python", "start.py"]


