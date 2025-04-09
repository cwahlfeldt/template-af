import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTemplateById } from '../data/templates';
import { toPng } from 'html-to-image';

// Component for rendering each template type with editable text
const TemplateRenderer = ({ template, values, onValueChange, isEditMode }) => {
  // Helper function to create editable text elements
  const EditableText = ({ value, fieldId, className }) => {
    if (!isEditMode) {
      return <span className={className}>{value}</span>;
    }
    
    return (
      <span
        className={`${className} cursor-text hover:bg-blue-50 hover:outline-dashed hover:outline-1 hover:outline-blue-300 focus:outline-dashed focus:outline-2 focus:outline-blue-500 focus:bg-blue-50`}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onBlur={(e) => onValueChange(fieldId, e.target.innerText)}
        onInput={(e) => onValueChange(fieldId, e.target.innerText)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    );
  };
  
  // Helper function for handling image changes
  const ImageUploadOverlay = ({ fieldId, currentImg }) => {
    if (!isEditMode) return null;
    
    const handleImageClick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            onValueChange(fieldId, event.target.result);
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };
    
    return (
      <div 
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        onClick={handleImageClick}
      >
        <span className="text-white text-sm font-medium px-2 py-1 bg-black bg-opacity-75 rounded">
          Change Image
        </span>
      </div>
    );
  };

  switch (template.type) {
    case 'business-card':
      return (
        <div className="business-card bg-white p-6 rounded-lg shadow-md w-[350px] h-[200px] flex flex-col justify-between border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                <EditableText value={values.name} fieldId="name" className="block" />
              </h2>
              <p className="text-gray-600">
                <EditableText value={values.title} fieldId="title" className="block" />
              </p>
            </div>
            <div className="relative w-16 h-16">
              {values.logo && (
                <>
                  <img src={values.logo} alt="Logo" className="w-16 h-16 object-contain" />
                  <ImageUploadOverlay fieldId="logo" currentImg={values.logo} />
                </>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-700 mt-2">
            <p className="font-semibold">
              <EditableText value={values.company} fieldId="company" className="block" />
            </p>
            <p>
              <EditableText value={values.address} fieldId="address" className="block" />
            </p>
            <div className="flex flex-col mt-2">
              <EditableText value={values.phone} fieldId="phone" className="block" />
              <EditableText value={values.email} fieldId="email" className="block" />
              <EditableText value={values.website} fieldId="website" className="block" />
            </div>
          </div>
        </div>
      );

    case 'invoice':
      return (
        <div className="invoice bg-white p-6 rounded-lg shadow-md w-[800px] border border-gray-200">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                <EditableText value={values.companyName} fieldId="companyName" className="block" />
              </h2>
              <p className="text-gray-600 whitespace-pre-line">
                <EditableText value={values.companyInfo} fieldId="companyInfo" className="block" />
              </p>
            </div>
            <div className="relative w-24 h-24">
              {values.logo && (
                <>
                  <img src={values.logo} alt="Logo" className="w-24 h-24 object-contain" />
                  <ImageUploadOverlay fieldId="logo" currentImg={values.logo} />
                </>
              )}
            </div>
          </div>
          
          <div className="flex justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
              <p className="text-gray-800">
                <EditableText value={values.clientName} fieldId="clientName" className="block" />
              </p>
              <p className="text-gray-600 whitespace-pre-line">
                <EditableText value={values.clientAddress} fieldId="clientAddress" className="block" />
              </p>
            </div>
            <div className="text-right">
              <div className="mb-2">
                <span className="font-semibold">Invoice #: </span>
                <EditableText value={values.invoiceNumber} fieldId="invoiceNumber" className="inline" />
              </div>
              <div className="mb-2">
                <span className="font-semibold">Date: </span>
                <EditableText value={values.invoiceDate} fieldId="invoiceDate" className="inline" />
              </div>
              <div>
                <span className="font-semibold">Due Date: </span>
                <EditableText value={values.dueDate} fieldId="dueDate" className="inline" />
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
                  <td className="py-2 px-4 border border-gray-300">
                    {isEditMode ? (
                      <EditableText 
                        value={item.description} 
                        fieldId={`items.${index}.description`}
                        className="block"
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300">
                    {isEditMode ? (
                      <EditableText 
                        value={String(item.quantity)} 
                        fieldId={`items.${index}.quantity`}
                        className="block text-center"
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300">
                    ${isEditMode ? (
                      <EditableText 
                        value={String(item.rate)} 
                        fieldId={`items.${index}.rate`}
                        className="inline"
                      />
                    ) : (
                      item.rate
                    )}
                  </td>
                  <td className="py-2 px-4 text-right border border-gray-300">
                    ${isEditMode ? (
                      <EditableText 
                        value={String(item.amount)} 
                        fieldId={`items.${index}.amount`}
                        className="inline"
                      />
                    ) : (
                      item.amount
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="font-semibold">Subtotal:</span>
                <span>$<EditableText value={String(values.subtotal)} fieldId="subtotal" className="inline" /></span>
              </div>
              <div className="flex justify-between py-2">
                <span className="font-semibold">Tax:</span>
                <EditableText value={values.tax} fieldId="tax" className="inline" />
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Total:</span>
                <span>$<EditableText value={String(values.total)} fieldId="total" className="inline" /></span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-4">
            <h3 className="font-semibold mb-2">Notes:</h3>
            <p className="text-gray-700 whitespace-pre-line">
              <EditableText value={values.notes} fieldId="notes" className="block" />
            </p>
          </div>
        </div>
      );

    case 'social-post':
      return (
        <div 
          className="social-post rounded-lg shadow-md w-[600px] h-[600px] flex flex-col justify-between overflow-hidden relative"
          style={{ backgroundColor: values.brandColor || '#ff5722' }}
        >
          {values.backgroundImage && (
            <>
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-75"
                style={{ backgroundImage: `url(${values.backgroundImage})` }}
              />
              {isEditMode && (
                <div className="absolute top-0 left-0 z-10 w-full h-full">
                  <ImageUploadOverlay fieldId="backgroundImage" currentImg={values.backgroundImage} />
                </div>
              )}
            </>
          )}
          
          <div className="relative p-8 flex justify-between items-start">
            <div className="relative w-20 h-20">
              {values.logo && (
                <>
                  <img src={values.logo} alt="Logo" className="w-20 h-20 object-contain" />
                  {isEditMode && (
                    <ImageUploadOverlay fieldId="logo" currentImg={values.logo} />
                  )}
                </>
              )}
            </div>
            
            {isEditMode && (
              <div 
                className="z-10 p-2 bg-white rounded-full shadow-md cursor-pointer"
                onClick={() => {
                  const color = prompt('Enter a new color (hex code, e.g. #ff5722):', values.brandColor);
                  if (color && /^#[0-9A-F]{6}$/i.test(color)) {
                    onValueChange('brandColor', color);
                  }
                }}
              >
                <span className="block w-6 h-6 rounded-full" style={{ backgroundColor: values.brandColor }} />
              </div>
            )}
          </div>
          
          <div className="relative p-8 text-white text-center">
            <h2 className="text-4xl font-bold mb-4 drop-shadow-md">
              <EditableText value={values.headline} fieldId="headline" className="block" />
            </h2>
            <p className="text-xl mb-8 drop-shadow-md">
              <EditableText value={values.subtext} fieldId="subtext" className="block" />
            </p>
            <button className="bg-white text-black font-semibold py-3 px-8 rounded-full text-xl">
              <EditableText value={values.callToAction} fieldId="callToAction" className="inline" />
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

  const handleValueChange = (id, value) => {
    // Handle nested object paths like 'items.0.description'
    if (id.includes('.')) {
      const parts = id.split('.');
      const newValues = { ...values };
      
      let current = newValues;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!current[part]) {
          // Create the missing object/array
          current[part] = isNaN(Number(parts[i + 1])) ? {} : [];
        }
        current = current[part];
      }
      
      current[parts[parts.length - 1]] = value;
      setValues(newValues);
    } else {
      // Handle simple paths
      setValues({
        ...values,
        [id]: value
      });
    }
  };

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

  // Generate a list of non-editable fields that need separate controls
  const renderAdvancedControls = () => {
    const advancedFields = template.template.fields.filter(field => 
      field.type === 'image' || field.type === 'color' || field.type === 'array'
    );
    
    if (advancedFields.length === 0) {
      return (
        <div className="text-center p-4 text-gray-500">
          <p>All content can be edited directly on the template.</p>
          <p className="text-sm mt-2">Click on any text to edit it.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium mb-3">Advanced Controls</h3>
        
        {advancedFields.map(field => {
          if (field.type === 'image') {
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          handleValueChange(field.id, event.target.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
            );
          }
          
          if (field.type === 'color') {
            return (
              <div key={field.id} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={values[field.id] || '#000000'}
                    onChange={(e) => handleValueChange(field.id, e.target.value)}
                    className="h-10 w-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={values[field.id] || ''}
                    onChange={(e) => handleValueChange(field.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="#RRGGBB"
                  />
                </div>
              </div>
            );
          }
          
          // Array fields (like invoice items) would need special controls
          if (field.type === 'array' && field.id === 'items') {
            const items = values[field.id] || [];
            
            return (
              <div key={field.id} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                
                <div className="border border-gray-300 rounded-md p-4 space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between mb-2">
                        <h4 className="text-sm font-medium">Item {index + 1}</h4>
                        <button
                          type="button"
                          className="text-red-500 text-sm"
                          onClick={() => {
                            const newItems = [...items];
                            newItems.splice(index, 1);
                            handleValueChange(field.id, newItems);
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-500">Description</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].description = e.target.value;
                              handleValueChange(field.id, newItems);
                            }}
                            className="w-full p-1 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Quantity</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].quantity = Number(e.target.value);
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                              handleValueChange(field.id, newItems);
                              
                              // Update subtotal and total
                              const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
                              handleValueChange('subtotal', subtotal);
                              
                              // Assuming tax is a percentage
                              const taxValue = parseFloat(values.tax) || 0;
                              const taxAmount = subtotal * (taxValue / 100);
                              handleValueChange('total', subtotal + taxAmount);
                            }}
                            className="w-full p-1 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Rate ($)</label>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => {
                              const newItems = [...items];
                              newItems[index].rate = Number(e.target.value);
                              newItems[index].amount = newItems[index].quantity * newItems[index].rate;
                              handleValueChange(field.id, newItems);
                              
                              // Update subtotal and total
                              const subtotal = newItems.reduce((sum, item) => sum + item.amount, 0);
                              handleValueChange('subtotal', subtotal);
                              
                              // Assuming tax is a percentage
                              const taxValue = parseFloat(values.tax) || 0;
                              const taxAmount = subtotal * (taxValue / 100);
                              handleValueChange('total', subtotal + taxAmount);
                            }}
                            className="w-full p-1 text-sm border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500">Amount ($)</label>
                          <input
                            type="number"
                            value={item.amount}
                            readOnly
                            className="w-full p-1 text-sm border border-gray-300 rounded-md bg-gray-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    className="w-full py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium"
                    onClick={() => {
                      const newItems = [...items, { description: 'New Item', quantity: 1, rate: 0, amount: 0 }];
                      handleValueChange(field.id, newItems);
                    }}
                  >
                    Add Item
                  </button>
                </div>
              </div>
            );
          }
          
          return null;
        })}
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="text-lg font-medium text-blue-700 mb-2">Editing Tips</h3>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Click directly on text in the template to edit it</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Hover over images to see the change option</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use the advanced controls for colors and complex items</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Switch to Preview mode to see how your final template will look</span>
            </li>
          </ul>
        </div>
      </div>
    );
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
              {renderAdvancedControls()}
            </div>
          </div>
        )}
        
        <div className={`${activeTab === 'preview' ? 'mx-auto' : 'md:w-2/3'}`}>
          <div className="bg-gray-100 p-6 rounded-lg shadow-md flex justify-center">
            <div ref={templateRef}>
              <TemplateRenderer 
                template={template.template} 
                values={values}
                onValueChange={handleValueChange}
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
