# Use an appropriate base image
FROM ubuntu:20.04

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Install system dependencies and Python 3.9
RUN apt-get update && \
    apt-get install -y python3.9 python3.9-venv python3.9-dev python3-pip gcc && \
    rm -rf /var/lib/apt/lists/*

# Create a symlink to ensure `python3.9` is available as `python3`
RUN ln -s /usr/bin/python3.9 /usr/bin/python && \
    ln -s /usr/bin/python3.9 /usr/bin/python3

# Set the working directory
WORKDIR /app

# Copy and install dependencies
COPY requirements.txt .
RUN python -m pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy the project files
COPY . .

# Expose the application port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]


