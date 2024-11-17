// src/components/SequenceSteps.js
'use client'
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import { FiMove, FiDownload, FiTrash2 } from 'react-icons/fi'
import { jsPDF } from 'jspdf'

export default function SequenceSteps({ selectedPartInfo }) {
  const [steps, setSteps] = useState([])
  const [newStep, setNewStep] = useState('')
  const [currentPartInfo, setCurrentPartInfo] = useState(null)

  // Update currentPartInfo when selectedPartInfo changes
  useEffect(() => {
    setCurrentPartInfo(selectedPartInfo)
  }, [selectedPartInfo])

  const handleAddStep = (e) => {
    e.preventDefault()
    if (newStep.trim()) {
      setSteps([...steps, {
        id: `step-${Date.now()}`,
        text: newStep.trim(),
        partIndex: currentPartInfo?.partIndex,
        screenshot: currentPartInfo?.screenshot,
      }])
      setNewStep('')
      setCurrentPartInfo(null) // Clear the current part info after adding step
    }
  }

  const onDragEnd = (result) => {
    if (!result.destination) return
    
    const items = Array.from(steps)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)
    
    setSteps(items)
  }

  const handleRemoveStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index))
  }

  const exportToPDF = async () => {
    const pdf = new jsPDF()
    let yOffset = 20

    // Add title
    pdf.setFontSize(20)
    pdf.text('Assembly Instructions', 20, yOffset)
    yOffset += 20

    // Add steps
    pdf.setFontSize(12)
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      
      // Add step number
      pdf.setFont(undefined, 'bold')
      pdf.text(`Step ${i + 1}`, 20, yOffset)
      yOffset += 10

      // Add step text
      pdf.setFont(undefined, 'normal')
      const splitText = pdf.splitTextToSize(step.text, 170) // Wrap text if too long
      pdf.text(splitText, 20, yOffset)
      yOffset += (splitText.length * 7) + 3

      // Add screenshot if exists
      if (step.screenshot) {
        try {
          pdf.addImage(step.screenshot, 'PNG', 20, yOffset, 60, 60)
          yOffset += 70
        } catch (error) {
          console.error('Error adding image to PDF:', error)
        }
      }

      // Add spacing between steps
      yOffset += 10

      // Check if we need a new page
      if (yOffset > 250) {
        pdf.addPage()
        yOffset = 20
      }
    }

    // Save the PDF
    pdf.save('assembly-instructions.pdf')
  }

  return (
    <div className="space-y-6">
      {/* Add Step Form */}
      <form onSubmit={handleAddStep} className="space-y-4">
        {currentPartInfo && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <p className="text-sm font-medium text-blue-700 mb-2">
              Selected Part: {currentPartInfo.partIndex + 1}
            </p>
            {currentPartInfo.screenshot && (
              <img
                src={currentPartInfo.screenshot}
                alt="Part preview"
                className="w-full h-32 object-contain bg-white rounded-md shadow-sm"
              />
            )}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            placeholder="Add step description..."
            className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Step
          </button>
        </div>
      </form>

      {/* Export Button */}
      {steps.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToPDF}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 
                   text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <FiDownload className="w-4 h-4" />
          Export as PDF
        </motion.button>
      )}

      {/* Steps List */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`group p-4 bg-white rounded-lg border ${
                        snapshot.isDragging ? 'border-blue-300 shadow-lg' : 'border-gray-200'
                      } hover:border-gray-300 transition-all duration-200`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 w-6 h-6 flex items-center justify-center 
                                   text-gray-400 hover:text-gray-600 cursor-move"
                        >
                          <FiMove className="w-4 h-4" />
                        </div>

                        {step.screenshot && (
                          <div className="w-32 flex-shrink-0">
                            <img
                              src={step.screenshot}
                              alt={`Step ${index + 1} preview`}
                              className="w-full aspect-square object-contain bg-gray-50 rounded-md"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <span className="font-medium text-gray-900">
                                Step {index + 1}
                              </span>
                              {step.partIndex !== undefined && (
                                <span className="ml-2 text-sm text-gray-500">
                                  (Part {step.partIndex + 1})
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveStep(index)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 
                                       hover:text-red-500 rounded transition-all duration-200"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-600 break-words">{step.text}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {steps.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No steps added yet. Select a part and add your first step.
        </div>
      )}
    </div>
  )
}