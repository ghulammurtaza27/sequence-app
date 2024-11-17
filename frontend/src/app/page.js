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
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-semibold mb-4">Upload Model</h2>
            <FileUpload onUpload={handleFileUpload} currentFile={modelFile} />
          </div>

          <div className="bg-white rounded-lg shadow p-4 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Assembly Steps</h2>
              {steps.length > 0 && (
                <PDFExportButton steps={steps} modelFile={modelFile} />
              )}
            </div>

            <div className="space-y-3 mb-4">
              <input
                type="text"
                value={stepData.partName}
                onChange={(e) => setStepData({ ...stepData, partName: e.target.value })}
                placeholder="Part name..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />

              <input
                type="text"
                value={stepData.customTool}
                onChange={(e) => setStepData({ ...stepData, customTool: e.target.value })}
                placeholder="Required tool..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
              />

              <div className="flex gap-2">
                <input
                  type="text"
                  value={stepData.description}
                  onChange={(e) => setStepData({ ...stepData, description: e.target.value })}
                  placeholder="Step description..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                />
                <button
                  onClick={addStep}
                  disabled={!stepData.description.trim()}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Step
                </button>
              </div>
            </div>

            {screenshotTaken && (
              <div className="mb-4 p-2 bg-green-50 text-green-600 rounded-lg text-sm">
                Screenshot captured! Add details to create a step.
              </div>
            )}

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
                            className={`bg-gray-50 rounded-lg p-4 ${
                              snapshot.isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center gap-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-move text-gray-400 hover:text-gray-600 px-1"
                                >
                                  ⋮⋮
                                </div>
                                <div>
                                  <h3 className="font-medium">Step {step.partNumber}</h3>
                                  {step.partName && (
                                    <p className="text-sm text-gray-600">Part: {step.partName}</p>
                                  )}
                                  {step.customTool && (
                                    <p className="text-sm text-gray-600">Tool: {step.customTool}</p>
                                  )}
                                  <p className="text-gray-600">{step.description}</p>
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
                                className="text-red-500 hover:text-red-600 text-sm"
                              >
                                Remove
                              </button>
                            </div>
                            {step.screenshot && (
                              <div className="w-32 h-32 bg-white rounded-lg overflow-hidden">
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
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Model Preview</h2>
          {modelFile && (
            <ModelViewer 
              modelFile={modelFile}
              onPartSelect={handlePartSelect}
            />
          )}
        </div>
      </div>
    </div>
  )
}