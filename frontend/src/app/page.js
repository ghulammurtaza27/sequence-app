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
  const [isRecording, setIsRecording] = useState(false)
  const [stepData, setStepData] = useState({
    description: '',
    partName: '',
    customTool: '',
    animation: {
      type: 'none',
      axis: 'x',
      value: 0,
      speed: 1
    },
    recordedVideo: null
  })

  const handleFileUpload = (file) => {
    setModelFile(file)
    setSelectedPart(null)
    setSteps([])
  }

  const handlePartSelect = (partInfo) => {
    setSelectedPart(partInfo)
    setScreenshotTaken(false)
  }

  const startRecording = async () => {
    if (!selectedPart) return;
    
    setIsRecording(true);
    
    const canvas = document.querySelector('#model-viewer-canvas');
    
    const stream = canvas.captureStream(60);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    });
    
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      setStepData(prev => ({ ...prev, recordedVideo: videoUrl }));
    };

    mediaRecorder.start();

    await playAnimation();
    mediaRecorder.stop();
    setIsRecording(false);
  }

  const addStep = () => {
    if (stepData.description.trim() && stepData.recordedVideo) {
      const newStep = {
        id: `step-${Date.now()}`,
        description: stepData.description,
        partName: stepData.partName,
        customTool: stepData.customTool,
        animation: stepData.animation,
        recordedVideo: stepData.recordedVideo,
        partNumber: steps.length + 1
      }
      setSteps([...steps, newStep])
      setStepData({
        description: '',
        partName: '',
        customTool: '',
        animation: {
          type: 'none',
          axis: 'x',
          value: 0,
          speed: 1
        },
        recordedVideo: null
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
      {/* Enhanced Hero Section */}
      <header className="relative bg-gray-900 border-b border-gray-800 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-purple-500/10"></div>

        <div className="relative container mx-auto px-8 py-24">
          <div className="max-w-5xl mx-auto">
            {/* Main Content */}
            <div className="text-center mb-16">
              <h1 className="text-6xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-8">
                Transform Your Design Reviews
              </h1>
              <p className="text-2xl text-gray-400 mb-8 leading-relaxed">
                Create interactive assembly instructions, collaborate on design decisions, 
                and streamline your product development workflow.
              </p>
              
              {/* Feature Pills */}
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  3D Model Visualization
                </span>
                <span className="px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  Step-by-Step Instructions
                </span>
                <span className="px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                  PDF Export
                </span>
              </div>
            </div>

            {/* Key Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Interactive 3D Viewer</h3>
                <p className="text-gray-400">View and interact with your 3D models directly in the browser. Select parts and create assembly steps with ease.</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Automated Screenshots</h3>
                <p className="text-gray-400">Automatically capture part views as you create assembly steps. Perfect for documentation and guides.</p>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Export & Share</h3>
                <p className="text-gray-400">Generate professional PDF documents with your assembly instructions ready to share with your team.</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-gray-400 bg-gray-800/50 backdrop-blur-sm rounded-xl px-6 py-3 border border-gray-700">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Get started by uploading your first 3D model below</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
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
                                {step.recordedVideo && (
                                  <div className="mt-3 w-64 rounded-lg overflow-hidden shadow-sm">
                                    <video 
                                      src={step.recordedVideo}
                                      controls
                                      loop
                                      muted
                                      className="w-full"
                                    >
                                      Your browser does not support the video element.
                                    </video>
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

      {/* FAQ Section - Add this after the main grid */}
      <section className="container mx-auto px-8 py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
            <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            Frequently Asked Questions
          </h2>

          <div className="space-y-8">
            {/* FAQ Item */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">What file formats are supported?</h3>
              <p className="text-gray-400">Currently, we support STEP files (.step, .stp) for 3D model uploads. These formats are widely used in CAD and provide the best compatibility for design reviews.</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">How do I create assembly instructions?</h3>
              <p className="text-gray-400">Upload your model, select parts in the 3D viewer, and add descriptions for each step. You can include part names and required tools. Steps can be reordered by dragging, and screenshots are automatically captured when you select parts.</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">Can I export my assembly instructions?</h3>
              <p className="text-gray-400">Yes! Once you've created your steps, you can export them as a PDF document. The PDF includes all step descriptions, part information, and captured screenshots for a complete assembly guide.</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">How do I share my design reviews?</h3>
              <p className="text-gray-400">After exporting your assembly instructions to PDF, you can easily share them with your team or clients. The PDF format ensures compatibility across different devices and platforms.</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-3">Is my data secure?</h3>
              <p className="text-gray-400">Your files and design data are processed locally in your browser. We don't store any of your files or assembly instructions on our servers, ensuring complete privacy and security of your intellectual property.</p>
            </div>

            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 group hover:border-blue-500/50 transition-colors">
              <h3 className="text-xl font-semibold text-white mb-3">Need more help?</h3>
              <p className="text-gray-400">Contact our support team for additional assistance or feature requests. We're constantly improving the platform based on user feedback.</p>
              <a href="mailto:murtazash123@gmail.com" 
                className="inline-flex items-center gap-2 mt-4 text-blue-400 hover:text-blue-300 transition-colors">
                <span>Contact Support</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Optional: Add a footer after FAQ */}
      <footer className="bg-gray-800/50 border-t border-gray-800">
        <div className="container mx-auto px-8 py-8">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Design Review Tool. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}