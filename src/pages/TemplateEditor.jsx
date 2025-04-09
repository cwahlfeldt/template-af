import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import useTemplateValues from '../hooks/useTemplateValues';
import TemplateRenderer from '../components/templates/TemplateRenderer';
import AdvancedControls from '../components/editor/AdvancedControls';

/**
 * Template Editor page component
 * Allows users to edit and preview templates
 */
function TemplateEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('edit');
  const templateRef = useRef(null);
  
  // Use custom hook to manage template values
  const { template, values, updateValue, loading } = useTemplateValues(templateId);
  
  // If template wasn't found, redirect to home
  if (!loading && !template) {
    navigate('/');
    return null;
  }

  /**
   * Download the template as a PNG image
   */
  const downloadTemplate = () => {
    if (templateRef.current) {
      // Temporarily hide edit UI elements
      const prevMode = activeTab;
      setActiveTab('preview');
      
      // Use setTimeout to ensure the UI updates before capturing
      setTimeout(() => {
        toPng(templateRef.current)
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `${templateId}-template.png`;
            link.href = dataUrl;
            link.click();
            
            // Restore previous mode
            setActiveTab(prevMode);
          })
          .catch((error) => {
            console.error('Error generating image:', error);
            setActiveTab(prevMode);
          });
      }, 100);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading template...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{template.name}</h1>
        <p className="text-gray-600">{template.description}</p>
      </div>
      
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'edit'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Edit Template
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 rounded-md ${
            activeTab === 'preview'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          Preview
        </button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-8">
        {activeTab === 'edit' && (
          <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Advanced Controls</h2>
            <div className="space-y-2">
              <AdvancedControls 
                template={template} 
                values={values} 
                onValueChange={updateValue} 
              />
            </div>
          </div>
        )}
        
        <div className={`${activeTab === 'preview' ? 'mx-auto' : 'md:w-2/3'}`}>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md flex justify-center">
            <div ref={templateRef}>
              <TemplateRenderer 
                template={template.template} 
                values={values}
                onValueChange={updateValue}
                isEditMode={activeTab === 'edit'}
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-center">
            <button
              onClick={downloadTemplate}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Download Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;
