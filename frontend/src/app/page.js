'use client'
import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import FileUpload from '@/components/FileUpload'
import ModelViewer from '@/components/ModelViewer'
import dynamic from 'next/dynamic'

const PDFExportButton = dynamic(() => import('@/components/PDFExportButton'), {
  ssr: false
})

export default function Home() {
  const [modelFile, setModelFile] = useState(null)
  const [selectedPart, setSelectedPart] = useState(null)
  const [steps, setSteps] = useState([])
  const [currentStep, setCurrentStep] = useState('')
  const [screenshotTaken, setScreenshotTaken] = useState(false)
  const [stepData, setStepData] = useState({
    description: '',
    partName: '',
    customTool: ''
  })

  const handleFileUpload = (file) => {
    setModelFile(file)
    setSelectedPart(null)
    setSteps([])
  }

  const handlePartSelect = (partInfo) => {
    setSelectedPart(partInfo)
    setScreenshotTaken(true)
    setTimeout(() => setScreenshotTaken(false), 2000)
  }

  const addStep = () => {
    if (stepData.description.trim()) {
      const newStep = {
        id: `step-${Date.now()}`,
        description: stepData.description,
        partName: stepData.partName,
        customTool: stepData.customTool,
        screenshot: selectedPart?.screenshot || null,
        partNumber: steps.length + 1
      }
      setSteps([...steps, newStep])
      setStepData({
        description: '',
        partName: '',
        customTool: ''
      })
      setSelectedPart(null)
    }
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const reorderedSteps = Array.from(steps)
    const [removed] = reorderedSteps.splice(result.source.index, 1)
    reorderedSteps.splice(result.destination.index, 0, removed)

    // Update the part numbers after reordering
    const updatedSteps = reorderedSteps.map((step, index) => ({
      ...step,
      partNumber: index + 1
    }))

    setSteps(updatedSteps)
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['stl', 'step', 'stp'].includes(fileExtension)) {
      alert('Please upload an STL or STEP file');
      return;
    }

    setModelFile(file);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section - Updated for dark theme */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-8 py-12">
          <h1 className="text-5xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Run Better Design Reviews
          </h1>
          <p className="text-xl text-gray-400 mt-6 max-w-2xl">
            Create and manage assembly instructions with ease. Collaborate on design reviews and make better product decisions.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Upload Section */}
            <section className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
              <div className="p-8">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Model
                </h2>
                <FileUpload onUpload={handleFileUpload} currentFile={modelFile} />
              </div>
            </section>

            {/* Assembly Steps Section */}
            <section className="bg-gray-800 rounded-3xl shadow-2xl border border-gray-700">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Assembly Steps
                  </h2>
                  {steps.length > 0 && (
                    <PDFExportButton steps={steps} modelFile={modelFile} />
                  )}
                </div>

                {/* Step Input Fields - Updated styling */}
                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={stepData.partName}
                      onChange={(e) => setStepData({ ...stepData, partName: e.target.value })}
                      placeholder="Part name..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border-2 border-gray-600 
                        focus:border-blue-500 focus:ring-blue-500 transition-colors text-white placeholder-gray-400"
                    />
                    <input
                      type="text"
                      value={stepData.customTool}
                      onChange={(e) => setStepData({ ...stepData, customTool: e.target.value })}
                      placeholder="Required tool..."
                      className="w-full px-4 py-3 rounded-xl bg-gray-700 border-2 border-gray-600 
                        focus:border-blue-500 focus:ring-blue-500 transition-colors text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={stepData.description}
                      onChange={(e) => setStepData({ ...stepData, description: e.target.value })}
                      placeholder="Step description..."
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-700 border-2 border-gray-600 
                        focus:border-blue-500 focus:ring-blue-500 transition-colors text-white placeholder-gray-400"
                    />
                    <button
                      onClick={addStep}
                      disabled={!stepData.description.trim()}
                      className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl
                        hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed 
                        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 
                        focus:ring-offset-2 focus:ring-offset-gray-800 font-semibold shadow-lg"
                    >
                      Add Step
                    </button>
                  </div>
                </div>

                {/* Screenshot notification - Updated for dark theme */}
                {screenshotTaken && (
                  <div className="mb-8 p-4 bg-blue-900/30 border-2 border-blue-500/30 rounded-xl">
                    <p className="text-sm text-blue-400 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Screenshot captured! Add details to create a step.
                    </p>
                  </div>
                )}

                {/* Steps List - Updated for dark theme */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="steps">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
                        {steps.map((step, index) => (
                          <Draggable key={step.id} draggableId={step.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group bg-gray-700/50 rounded-xl p-4 transition-all border border-gray-600
                                  ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'hover:bg-gray-700'}`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex items-start gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-move text-gray-400 hover:text-gray-300"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="font-medium text-white">Step {step.partNumber}</h3>
                                      {step.partName && (
                                        <p className="text-sm text-gray-400">Part: {step.partName}</p>
                                      )}
                                      {step.customTool && (
                                        <p className="text-sm text-gray-400">Tool: {step.customTool}</p>
                                      )}
                                      <p className="text-gray-300 mt-1">{step.description}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      const newSteps = steps.filter((_, i) => i !== index)
                                      const updatedSteps = newSteps.map((item, i) => ({
                                        ...item,
                                        partNumber: i + 1
                                      }))
                                      setSteps(updatedSteps)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 
                                      transition-opacity focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </div>
                                {step.screenshot && (
                                  <div className="mt-3 w-32 h-32 bg-white rounded-lg overflow-hidden shadow-sm">
                                    <img
                                      src={step.screenshot}
                                      alt={`Step ${step.partNumber}`}
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            </section>
          </div>

          {/* Right Column - Model Preview */}
          <div className="lg:sticky lg:top-8">
            <section className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
              <div className="p-8">
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Model Preview
                </h2>
                {modelFile ? (
                  <ModelViewer 
                    modelFile={modelFile}
                    onPartSelect={handlePartSelect}
                  />
                ) : (
                  <div className="h-[600px] flex items-center justify-center bg-gray-700/50 rounded-xl border-2 border-dashed border-gray-600">
                    <p className="text-gray-400 text-lg">Upload a model to preview</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}