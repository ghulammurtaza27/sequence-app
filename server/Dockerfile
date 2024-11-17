# Use conda base image
FROM continuumio/miniconda3

# Set working directory
WORKDIR /app

# Copy requirements first
COPY ./requirements.txt /app/requirements.txt

# Create conda environment and install dependencies
RUN conda create -n cad-env python=3.9 \
    && conda activate cad-env \
    && conda install -c conda-forge pythonocc-core=7.7.0 \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . /app/

# Expose port
EXPOSE 8000

# Set up shell to use conda environment
SHELL ["conda", "run", "-n", "cad-env", "/bin/bash", "-c"]

# Command to run the application
CMD ["conda", "run", "--no-capture-output", "-n", "cad-env", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]