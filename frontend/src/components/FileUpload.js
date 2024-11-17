// src/components/FileUpload.js
'use client'
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function FileUpload({ onUpload, currentFile }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.step') && !file.name.toLowerCase().endsWith('.stp')) {
      setError('Please upload a STEP file (.step or .stp)');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      onUpload(file);
    } catch (error) {
      setError('Error processing file. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/step': ['.step', '.stp'],
    },
    multiple: false,
  });

  return (
    <div className="max-w-xl mx-auto">
      <div
        {...getRootProps()}
        className={`relative group cursor-pointer transition-all duration-300
          ${isDragActive 
            ? 'bg-blue-900/30 border-blue-500/50' 
            : 'bg-gray-700/50 border-gray-600 hover:border-blue-500/50 hover:bg-blue-900/20'
          } 
          border-2 border-dashed rounded-xl p-8`}
      >
        <input {...getInputProps()} disabled={isLoading} />
        
        <div className="space-y-4 text-center">
          {/* Upload Icon */}
          <div className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full
            ${isDragActive ? 'bg-blue-900/50' : 'bg-gray-600/50 group-hover:bg-blue-900/50'}
            transition-colors duration-300`}
          >
            <svg
              className={`w-6 h-6 ${isDragActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <p className={`text-sm font-medium
              ${isDragActive ? 'text-blue-400' : 'text-gray-300'}`}
            >
              {isDragActive
                ? 'Drop your file here'
                : currentFile
                ? 'Click or drag to replace file'
                : 'Click or drag file to upload'}
            </p>
            <p className={`text-xs
              ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
            >
              Supports STEP files (.step, .stp)
            </p>
          </div>

          {/* Current File Display */}
          {currentFile && (
            <div className="mt-4 py-3 px-4 bg-gray-700/50 rounded-lg border border-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-blue-900/30">
                  <svg
                    className="w-4 h-4 text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {currentFile.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-900/75 flex items-center justify-center rounded-xl backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-blue-400">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-3 px-4 py-3 bg-red-900/30 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        </div>
      )}
    </div>
  );
}