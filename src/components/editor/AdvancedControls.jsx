import React from 'react';

/**
 * Component for advanced template editing controls
 * 
 * @param {Object} props - Component props
 * @param {Object} props.template - The template definition
 * @param {Object} props.values - Current template values
 * @param {function} props.onValueChange - Function to call when values change
 * @returns {JSX.Element} Advanced controls UI
 */
const AdvancedControls = ({ template, values, onValueChange }) => {
  // Filter fields that need special controls
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
                        onValueChange(field.id, event.target.result);
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
                  onChange={(e) => onValueChange(field.id, e.target.value)}
                  className="h-10 w-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={values[field.id] || ''}
                  onChange={(e) => onValueChange(field.id, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="#RRGGBB"
                />
              </div>
            </div>
          );
        }
        
        // Special controls for invoice items
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
                          onValueChange(field.id, newItems);
                          
                          // Update totals
                          updateInvoiceTotals(newItems, values.tax, onValueChange);
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
                            onValueChange(field.id, newItems);
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
                            onValueChange(field.id, newItems);
                            
                            // Update totals
                            updateInvoiceTotals(newItems, values.tax, onValueChange);
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
                            onValueChange(field.id, newItems);
                            
                            // Update totals
                            updateInvoiceTotals(newItems, values.tax, onValueChange);
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
                    onValueChange(field.id, newItems);
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
            <span>Use these advanced controls for colors and complex items</span>
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

/**
 * Helper function to update invoice totals
 */
const updateInvoiceTotals = (items, tax, onValueChange) => {
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  onValueChange('subtotal', subtotal);
  
  // Parse tax value, handling percentage or fixed amount
  let taxValue = 0;
  if (typeof tax === 'string' && tax.includes('%')) {
    const percentage = parseFloat(tax) || 0;
    taxValue = subtotal * (percentage / 100);
  } else {
    taxValue = parseFloat(tax) || 0;
  }
  
  onValueChange('total', subtotal + taxValue);
};

export default AdvancedControls;
