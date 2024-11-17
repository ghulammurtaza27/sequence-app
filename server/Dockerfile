# Use a base image with OpenCASCADE pre-installed
FROM conda/miniconda3

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /code

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Create conda environment
RUN conda create -n cad-env python=3.9 \
    && conda install -n cad-env -c conda-forge pythonocc-core=7.7.0

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Set up shell to use conda environment
SHELL ["conda", "run", "-n", "cad-env", "/bin/bash", "-c"]

# Command to run the application
CMD ["conda", "run", "--no-capture-output", "-n", "cad-env", "python", "start.py"]


