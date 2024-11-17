import { useState } from 'react';
import ModelViewer from './ModelViewer';

export default function Steps() {
  const [steps, setSteps] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentStepScreenshot, setCurrentStepScreenshot] = useState(null);

  const handleScreenshot = (blob) => {
    // Convert blob to URL for preview
    const screenshotUrl = URL.createObjectURL(blob);
    setCurrentStepScreenshot(screenshotUrl);
  };

  const handleAddStep = (stepData) => {
    if (currentStepScreenshot) {
      // Add the step with the screenshot
      setSteps([...steps, { 
        ...stepData, 
        screenshot: currentStepScreenshot 
      }]);
      
      // Clear the current screenshot
      setCurrentStepScreenshot(null);
    }
  };

  return (
    <div>
      {/* File upload and other components */}
      
      {selectedFile && (
        <ModelViewer 
          modelFile={selectedFile}
          onScreenshot={handleScreenshot}
        />
      )}

      {/* Step form */}
      <div className="mt-4">
        {currentStepScreenshot && (
          <div className="mb-4">
            <img 
              src={currentStepScreenshot} 
              alt="Step preview" 
              className="max-w-xs rounded shadow"
            />
          </div>
        )}
        
        <form onSubmit={(e) => {
          e.preventDefault();
          handleAddStep({
            title: e.target.title.value,
            description: e.target.description.value,
          });
          e.target.reset();
        }}>
          <input 
            name="title"
            placeholder="Step title"
            className="block w-full mb-2 p-2 border rounded"
          />
          <textarea 
            name="description"
            placeholder="Step description"
            className="block w-full mb-2 p-2 border rounded"
          />
          <button 
            type="submit"
            disabled={!currentStepScreenshot}
            className={`px-4 py-2 rounded ${
              currentStepScreenshot 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            Add Step
          </button>
        </form>
      </div>

      {/* Display steps */}
      <div className="mt-8">
        {steps.map((step, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <h3 className="font-bold">{step.title}</h3>
            <p>{step.description}</p>
            {step.screenshot && (
              <img 
                src={step.screenshot} 
                alt={`Step ${index + 1}`} 
                className="mt-2 max-w-xs rounded"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 