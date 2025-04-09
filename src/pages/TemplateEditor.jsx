import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTemplateById } from '../data/templates';
import { toPng } from 'html-to-image';

// Component for rendering each template type
const TemplateRenderer = ({ template, values }) => {
  switch (template.type) {
    case 'business-card':
      return (
        <div className="business-card bg-white p-6 rounded-lg shadow-md w-[350px] h-[200px] flex flex-col justify-between border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{values.name}</h2>
              <p className="text-gray-600">{values.title}</p>
            </div>
            {values.logo && (
              <img src={values.logo} alt="Logo" className="w-16 h-16 object-contain" />
            )}
          </div>
          <div className="text-sm text-gray-700 mt-2">
            <p className="font-semibold">{values.company}</p>
            <p>{values.address}</p>
            <div className="flex flex-col mt-2">
              <span>{values.phone}</span>
              <span>{values.email}</span>
              <span>{values.website}</span>
            </div>
          </div>
        </div>
      );

    case 'invoice':
      return (
        <div className="invoice bg-white p-6 rounded-lg shadow-md w-[800px] border border-gray-200">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{values.companyName}</h2>
              <p className="text-gray-600 whitespace-pre-line">{values.companyInfo}</p>
            </div>
            {values.logo && (
              <img src={values.logo} alt="Logo" className="w-24 h-24 object-contain" />
            )}
          </div>
          
          <div className="flex justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
              <p className="text-gray-800">{values.clientName}</p>
              <p className="text-gray-600 whitespace-pre-line">{values.clientAddress}</p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="font-semibold">Invoice #: </span>
                <span>{values.invoiceNumber}</span>
              </div>
              <div className="mb-2">
                <span className="font-semibold">Date: </span>
                <span>{values.invoiceDate}</span>
              </div>
              <div>
                <span className="font-semibold">Due Date: </span>
                <span>{values.dueDate}</span>
              </div>
            </div>
          </div>
          
          <table className="w-full mb-8 border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 text-left border border-gray-300">Description</th>
                <th className="py-2 px-4 text-center border border-gray-300">Quantity</th>
                <th className="py-2 px-4 text-center border border-gray-300">Rate</th>
                <th className="py-2 px-4 text-right border border-gray-300">Amount</th>
              </tr>
            </thead>
            <tbody>
              {values.items && values.items.map((item, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 border border-gray-300">{item.description}</td>
                  <td className="py-2 px-4 text-center border border-gray-300">{item.quantity}</td>
                  <td className="py-2 px-4 text-center border border-gray-300">${item.rate}</td>
                  <td className="py-2 px-4 text-right border border-gray-300">${item.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="font-semibold">Subtotal:</span>
                <span>${values.subtotal}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">Tax:</span>
                <span>{values.tax}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Total:</span>
                <span>${values.total}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-semibold mb-2">Notes:</h3>
            <p className="text-gray-700 whitespace-pre-line">{values.notes}</p>
          </div>
        </div>
      );

    case 'social-post':
      return (
        <div 
          className="social-post rounded-lg shadow-md w-[600px] h-[600px] flex flex-col justify-between overflow-hidden"
          style={{ backgroundColor: values.brandColor || '#ff5722' }}
        >
          {values.backgroundImage && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-75"
              style={{ backgroundImage: `url(${values.backgroundImage})` }}
            />
          )}
          
          <div className="relative p-8 flex justify-between items-start">
            {values.logo && (
              <img src={values.logo} alt="Logo" className="w-20 h-20 object-contain" />
            )}
          </div>
          
          <div className="relative p-8 text-white text-center">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-md">{values.headline}</h2>
            <p className="text-xl mb-8 drop-shadow-md">{values.subtext}</p>
            <button className="bg-white text-black font-semibold py-3 px-8 rounded-full text-xl">
              {values.callToAction}
            </button>
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-gray-100 p-6 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Preview not available for this template type.</p>
        </div>
      );
  }
};

// Main component
function TemplateEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('edit');
  const templateRef = useRef(null);

  useEffect(() => {
    // Fetch the template
    const fetchedTemplate = getTemplateById(templateId);
    
    if (fetchedTemplate) {
      setTemplate(fetchedTemplate);
      
      // Initialize form values with defaults
      const initialValues = {};
      fetchedTemplate.template.fields.forEach(field => {
        initialValues[field.id] = field.default;
      });
      
      setValues(initialValues);
      setLoading(false);
    } else {
      // Template not found
      navigate('/');
    }
  }, [templateId, navigate]);

  const handleInputChange = (id, value) => {
    setValues({
      ...values,
      [id]: value
    });
  };

  const handleImageChange = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        handleInputChange(id, event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColorChange = (id, value) => {
    handleInputChange(id, value);
  };

  const downloadTemplate = () => {
    if (templateRef.current) {
      toPng(templateRef.current)
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = `${templateId}-template.png`;
          link.href = dataUrl;
          link.click();
        });
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type="text"
              value={values[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        );
        
      case 'image':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="flex items-center space-x-4">
              {values[field.id] && (
                <img 
                  src={values[field.id]} 
                  alt={field.label}
                  className="w-20 h-20 object-contain border rounded-md"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(field.id, e)}
                className="text-sm"
              />
            </div>
          </div>
        );
        
      case 'color':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={values[field.id] || '#000000'}
                onChange={(e) => handleColorChange(field.id, e.target.value)}
                className="h-10 w-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={values[field.id] || ''}
                onChange={(e) => handleColorChange(field.id, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="#RRGGBB"
              />
            </div>
          </div>
        );
        
      default:
        return null;
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
          <div className="md:w-1/2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Edit Content</h2>
            <div className="space-y-2">
              {template.template.fields.map(field => renderField(field))}
            </div>
          </div>
        )}
        
        <div className={`${activeTab === 'preview' ? 'mx-auto' : 'md:w-1/2'}`}>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md flex justify-center">
            <div ref={templateRef}>
              <TemplateRenderer template={template.template} values={values} />
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
