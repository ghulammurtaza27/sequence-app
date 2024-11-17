// src/components/FileUpload.js
'use client'
import { useState } from 'react';

export default function FileUpload({ onUpload, currentFile }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
      
      // Pass the file directly to parent component
      onUpload(file);
      
    } catch (error) {
      setError('Error processing file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
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
          {isLoading ? 'Processing...' : currentFile ? 'Change File' : 'Upload STEP File'}
        </label>
        {currentFile && (
          <p className="mt-2 text-sm text-gray-600">
            Current file: {currentFile.name}
          </p>
        )}
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}
      </div>
    </div>
  );
}