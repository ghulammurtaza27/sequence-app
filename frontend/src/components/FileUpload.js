// src/components/FileUpload.js
'use client'
import { useState } from 'react';
import ModelViewer from './ModelViewer';

export default function FileUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.step') && !file.name.toLowerCase().endsWith('.stp')) {
      setError('Please upload a STEP file (.step or .stp)');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSelectedFile(file);  // Just set the file - ModelViewer will handle conversion
    } catch (error) {
      setError('Error processing file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePartSelect = (data) => {
    console.log('Screenshot data:', data);
    // Handle the screenshot and camera position data here
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept=".step,.stp"
          onChange={handleFileUpload}
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-block px-4 py-2 bg-blue-500 text-white rounded-lg 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          {isLoading ? 'Processing...' : 'Upload STEP File'}
        </label>
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </div>

      {selectedFile && (
        <div className="mt-4">
          <ModelViewer 
            modelFile={selectedFile}
            onPartSelect={handlePartSelect}
          />
        </div>
      )}
    </div>
  );
}