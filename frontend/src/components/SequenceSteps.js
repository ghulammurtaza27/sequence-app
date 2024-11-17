// src/components/SequenceSteps.js
'use client'
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { motion } from 'framer-motion'
import { FiMove, FiDownload, FiTrash2, FiPlus } from 'react-icons/fi'
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
    <div className="space-y-8 w-full">
      {/* Add Step Form */}
      <form onSubmit={handleAddStep} className="space-y-6 w-full">
        {currentPartInfo && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-blue-600">
                  {currentPartInfo.partIndex + 1}
                </span>
              </div>
              <p className="text-sm font-medium text-blue-800">
                Selected Part
              </p>
            </div>
            {currentPartInfo.screenshot && (
              <div className="relative group">
                <img
                  src={currentPartInfo.screenshot}
                  alt="Part preview"
                  className="w-full h-40 object-contain bg-white rounded-xl shadow-sm 
                    ring-1 ring-blue-100 transition-transform duration-300 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              </div>
            )}
          </motion.div>
        )}

        {/* Completely separate the input and button */}
        <div className="w-full space-y-3">
          <textarea
            value={newStep}
            onChange={(e) => setNewStep(e.target.value)}
            placeholder="Step description..."
            rows={3}
            className="w-full px-4 py-3 text-sm bg-gray-800 border border-gray-700 rounded-xl
              placeholder:text-gray-500 text-gray-200 resize-none
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              transition-all duration-200"
          />
          <button
            type="submit"
            disabled={!newStep.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 
              text-white rounded-xl hover:from-blue-600 hover:to-blue-700 
              disabled:opacity-50 disabled:cursor-not-allowed
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              focus:ring-offset-gray-900 transition-all duration-200 
              flex items-center justify-center gap-2"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Step</span>
          </button>
        </div>
      </form>

      {/* Export Button */}
      {steps.length > 0 && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={exportToPDF}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 
            bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl 
            hover:from-emerald-600 hover:to-green-600 shadow-sm
            transition-all duration-200"
        >
          <FiDownload className="w-5 h-5" />
          <span className="font-medium">Export Assembly Instructions</span>
        </motion.button>
      )}

      {/* Steps List */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4"
            >
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group p-5 bg-white rounded-xl border ${
                        snapshot.isDragging 
                          ? 'border-blue-300 shadow-lg ring-2 ring-blue-500/50' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                      } transition-all duration-200`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center 
                            bg-gray-50 rounded-lg text-gray-400 hover:text-gray-600 
                            hover:bg-gray-100 cursor-move transition-colors duration-200"
                        >
                          <FiMove className="w-4 h-4" />
                        </div>

                        {step.screenshot && (
                          <div className="w-40 flex-shrink-0">
                            <div className="relative group/image rounded-lg overflow-hidden">
                              <img
                                src={step.screenshot}
                                alt={`Step ${index + 1} preview`}
                                className="w-full aspect-square object-contain bg-gray-50 
                                  transition-transform duration-300 group-hover/image:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 
                                to-transparent opacity-0 group-hover/image:opacity-100 
                                transition-opacity duration-300" />
                            </div>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 
                                rounded-full text-sm font-medium">
                                Step {index + 1}
                              </span>
                              {step.partIndex !== undefined && (
                                <span className="text-sm text-gray-500">
                                  Part {step.partIndex + 1}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveStep(index)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 
                                hover:text-red-500 hover:bg-red-50 rounded-lg
                                transition-all duration-200"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-gray-600 break-words leading-relaxed">
                            {step.text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {steps.length === 0 && (
        <div className="text-center py-12 px-6 bg-gray-50 rounded-xl border-2 
          border-dashed border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center 
            justify-center mx-auto mb-4">
            <FiMove className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-1">No steps added yet</p>
          <p className="text-sm text-gray-400">
            Select a part and add your first step to get started
          </p>
        </div>
      )}
    </div>
  )
}