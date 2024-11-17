'use client'
import { useState } from 'react'
import FileUpload from '@/components/FileUpload'
import ModelViewer from '@/components/ModelViewer'
import SequenceSteps from '@/components/SequenceSteps'

export default function AppPage() {
  const [modelFile, setModelFile] = useState(null)
  const [selectedPartInfo, setSelectedPartInfo] = useState(null)

  const handleFileUpload = (file) => {
    setModelFile(file)
    setSelectedPartInfo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">AssemblyAI</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Upload Model
                </h2>
                <FileUpload onUpload={handleFileUpload} currentFile={modelFile} />
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Assembly Steps
                </h2>
                <SequenceSteps selectedPartInfo={selectedPartInfo} />
              </div>
            </section>
          </div>

          <section className="lg:col-span-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Model Preview
              </h2>
              {modelFile ? (
                <ModelViewer 
                  modelFile={modelFile}
                  onPartSelect={setSelectedPartInfo}
                />
              ) : (
                <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <p className="text-gray-500">Upload a model to get started</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
} 