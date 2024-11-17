// src/components/FileUpload.js
'use client'
import { useDropzone } from 'react-dropzone'
import { XMarkIcon } from '@heroicons/react/24/outline'

export default function FileUpload({ onUpload, currentFile }) {
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: {
      'model/stl': ['.stl'],
      'model/step': ['.step', '.stp']
    }
  })

  return (
    <div className="space-y-4">
      
      
      <div 
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${currentFile ? 'bg-gray-50' : 'bg-white'}`}
      >
        <input {...getInputProps()} />
        
        {currentFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-50 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentFile.name}</p>
                <p className="text-sm text-gray-500">{(currentFile.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onUpload(null)
              }}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        ) : isDragActive ? (
          <div className="text-center">
            <p className="text-sm text-blue-500">Drop the file here...</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-gray-500">Drag and drop a model file, or click to select</p>
            <p className="text-xs text-gray-400 mt-1">Supported formats: .stl, .step, .stp</p>
          </div>
        )}
      </div>
    </div>
  )
}