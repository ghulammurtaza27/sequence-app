#!/bin/bash

# Install system dependencies
apt-get update && apt-get install -y \
    gcc \
    g++ \
    cmake \
    libgl1-mesa-glx

# Install Python packages
pip install --no-cache-dir -r requirements.txt

# Install OpenCASCADE from conda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda.sh
bash miniconda.sh -b -p /opt/conda
export PATH="/opt/conda/bin:$PATH"
conda install -y -c conda-forge pythonocc-core=7.7.0