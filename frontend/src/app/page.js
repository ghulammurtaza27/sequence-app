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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Sequence App</h1>
          <p className="text-sm text-gray-500 mt-1">Create assembly instructions with ease</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Upload Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Upload Model
                </h2>
                <FileUpload onUpload={handleFileUpload} currentFile={modelFile} />
              </div>
            </section>

            {/* Assembly Steps Section */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Assembly Steps
                  </h2>
                  {steps.length > 0 && (
                    <PDFExportButton steps={steps} modelFile={modelFile} />
                  )}
                </div>

                {/* Step Input Fields */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={stepData.partName}
                      onChange={(e) => setStepData({ ...stepData, partName: e.target.value })}
                      placeholder="Part name..."
                      className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={stepData.customTool}
                      onChange={(e) => setStepData({ ...stepData, customTool: e.target.value })}
                      placeholder="Required tool..."
                      className="w-full rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={stepData.description}
                      onChange={(e) => setStepData({ ...stepData, description: e.target.value })}
                      placeholder="Step description..."
                      className="flex-1 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <button
                      onClick={addStep}
                      disabled={!stepData.description.trim()}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Add Step
                    </button>
                  </div>
                </div>

                {screenshotTaken && (
                  <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-lg">
                    <p className="text-sm text-green-700 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Screenshot captured! Add details to create a step.
                    </p>
                  </div>
                )}

                {/* Steps List */}
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="steps">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {steps.map((step, index) => (
                          <Draggable key={step.id} draggableId={step.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`group bg-gray-50 rounded-lg p-4 transition-all
                                  ${snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'hover:bg-gray-100'}`}
                              >
                                <div className="flex justify-between items-start gap-4">
                                  <div className="flex items-start gap-3">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="cursor-move text-gray-400 hover:text-gray-600"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                      </svg>
                                    </div>
                                    <div>
                                      <h3 className="font-medium text-gray-900">Step {step.partNumber}</h3>
                                      {step.partName && (
                                        <p className="text-sm text-gray-600">Part: {step.partName}</p>
                                      )}
                                      {step.customTool && (
                                        <p className="text-sm text-gray-600">Tool: {step.customTool}</p>
                                      )}
                                      <p className="text-gray-700 mt-1">{step.description}</p>
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
            <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Model Preview
                </h2>
                {modelFile ? (
                  <ModelViewer 
                    modelFile={modelFile}
                    onPartSelect={handlePartSelect}
                  />
                ) : (
                  <div className="h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Upload a model to preview</p>
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