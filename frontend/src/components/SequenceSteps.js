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
    <div className="space-y-6 w-full px-4 sm:px-0">
      {/* Add Step Form */}
      <form onSubmit={handleAddStep} className="space-y-4 w-full">
        {currentPartInfo && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl w-full"
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

        {/* Input Fields Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-3">
          <input
            type="text"
            placeholder="Part name..."
            className="w-full px-4 py-3 text-sm bg-gray-800 border border-gray-700 rounded-xl
              placeholder:text-gray-500 text-gray-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              transition-all duration-200"
          />
          <input
            type="text"
            placeholder="Required tools..."
            className="w-full px-4 py-3 text-sm bg-gray-800 border border-gray-700 rounded-xl
              placeholder:text-gray-500 text-gray-200
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
              transition-all duration-200"
          />
        </div>

        {/* Description and Add Button */}
        <div className="flex flex-col gap-3 w-full">
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
            className="w-full sm:w-auto sm:ml-auto px-6 py-3 bg-gradient-to-r 
              from-blue-500 to-blue-600 text-white rounded-xl 
              hover:from-blue-600 hover:to-blue-700 
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
            hover:from-emerald-600 hover:to-green-600 shadow-lg
            transition-all duration-200"
        >
          <FiDownload className="w-5 h-5" />
          <span className="font-medium">Export Instructions</span>
        </motion.button>
      )}

      {/* Steps List */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="steps">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-4 w-full"
            >
              {steps.map((step, index) => (
                <Draggable key={step.id} draggableId={step.id} index={index}>
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`group p-4 bg-gray-800 rounded-xl border w-full ${
                        snapshot.isDragging 
                          ? 'border-blue-500/50 shadow-lg ring-2 ring-blue-500/50' 
                          : 'border-gray-700 hover:border-blue-500/30'
                      } transition-all duration-200`}
                    >
                      {/* Step Content */}
                      <div className="flex flex-col w-full gap-4">
                        {/* Header */}
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-3">
                            <div
                              {...provided.dragHandleProps}
                              className="flex-shrink-0 w-8 h-8 flex items-center justify-center 
                                bg-gray-700 rounded-lg text-gray-400 hover:text-gray-300 
                                hover:bg-gray-600 cursor-move transition-colors duration-200"
                            >
                              <FiMove className="w-4 h-4" />
                            </div>
                            <span className="px-3 py-1 bg-gray-700 text-gray-300 
                              rounded-full text-sm font-medium">
                              Step {index + 1}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRemoveStep(index)}
                            className="p-2 text-gray-400 hover:text-red-400 
                              hover:bg-red-900/30 rounded-lg transition-all duration-200"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Screenshot and Description */}
                        <div className="flex flex-col sm:flex-row gap-4 w-full">
                          {step.screenshot && (
                            <div className="w-full sm:w-40 h-40 flex-shrink-0">
                              <img
                                src={step.screenshot}
                                alt={`Step ${index + 1}`}
                                className="w-full h-full object-contain bg-gray-700/50 
                                  rounded-lg"
                              />
                            </div>
                          )}
                          <p className="text-gray-300 flex-1">
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

      {/* Empty State */}
      {steps.length === 0 && (
        <div className="text-center py-8 px-4 bg-gray-800/50 rounded-xl 
          border-2 border-dashed border-gray-700 w-full">
          <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center 
            justify-center mx-auto mb-4">
            <FiMove className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-300 mb-1">No steps added yet</p>
          <p className="text-sm text-gray-400">
            Select a part and add your first step to get started
          </p>
        </div>
      )}
    </div>
  )
}