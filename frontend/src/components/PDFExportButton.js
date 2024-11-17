'use client'
import { jsPDF } from 'jspdf'
import { FiDownload } from 'react-icons/fi'

export default function PDFExportButton({ steps, modelFile }) {
  const exportToPDF = async () => {
    const pdf = new jsPDF()
    let yOffset = 20

    // Add title
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Assembly Instructions', 20, yOffset)
    yOffset += 15

    // Add model file name
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Model: ${modelFile.name}`, 20, yOffset)
    yOffset += 20

    // Process each step
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]

      // Check if we need a new page
      if (yOffset > 250) {
        pdf.addPage()
        yOffset = 20
      }

      // Step number
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Step ${step.partNumber}`, 20, yOffset)
      yOffset += 10

      // Part Name
      if (step.partName) {
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Part Name:', 20, yOffset)
        pdf.setFont('helvetica', 'normal')
        pdf.text(step.partName, 50, yOffset)
        yOffset += 8
      }

      // Tool Required
      if (step.customTool) {
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Tool Required:', 20, yOffset)
        pdf.setFont('helvetica', 'normal')
        pdf.text(step.customTool, 60, yOffset)
        yOffset += 8
      }

      // Description
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Description:', 20, yOffset)
      pdf.setFont('helvetica', 'normal')
      
      const splitDescription = pdf.splitTextToSize(step.description, 150)
      pdf.text(splitDescription, 55, yOffset)
      yOffset += (splitDescription.length * 7) + 5

      // Screenshot
      if (step.screenshot) {
        try {
          // Check if we need a new page for the screenshot
          if (yOffset > 200) {
            pdf.addPage()
            yOffset = 20
          }

          // Convert base64 image to make sure it's properly formatted
          const imgData = step.screenshot.split(',')[1] || step.screenshot;
          
          // Add the screenshot with proper dimensions
          pdf.addImage(imgData, 'PNG', 20, yOffset, 80, 80, undefined, 'FAST')
          yOffset += 85
        } catch (error) {
          console.error('Error adding screenshot to PDF:', error)
          pdf.text('Error: Screenshot could not be added', 20, yOffset)
          yOffset += 10
        }
      }

      // Add spacing between steps
      yOffset += 15
    }

    // Save the PDF
    pdf.save('assembly-instructions.pdf')
  }

  return (
    <button
      onClick={exportToPDF}
      className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
    >
      <FiDownload className="w-4 h-4" />
      Export PDF
    </button>
  )
} 