import React from 'react';
import EditableText from '../editor/EditableText';
import ImageUploadOverlay from '../editor/ImageUploadOverlay';

/**
 * Invoice template component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.values - Template values
 * @param {function} props.onValueChange - Function to call when values change
 * @param {boolean} props.isEditMode - Whether edit mode is active
 * @returns {JSX.Element} Invoice template
 */
const Invoice = ({ values, onValueChange, isEditMode }) => {
  return (
    <div className="invoice bg-white p-6 rounded-lg shadow-md w-[800px] border border-gray-200">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            <EditableText 
              value={values.companyName} 
              fieldId="companyName" 
              className="block" 
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </h2>
          <p className="text-gray-600 whitespace-pre-line">
            <EditableText 
              value={values.companyInfo} 
              fieldId="companyInfo" 
              className="block" 
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </p>
        </div>
        <div className="relative w-24 h-24">
          {values.logo && (
            <>
              <img src={values.logo} alt="Logo" className="w-24 h-24 object-contain" />
              <ImageUploadOverlay 
                fieldId="logo" 
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </>
          )}
        </div>
      </div>
      
      <div className="flex justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Bill To:</h3>
          <p className="text-gray-800">
            <EditableText 
              value={values.clientName} 
              fieldId="clientName" 
              className="block" 
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </p>
          <p className="text-gray-600 whitespace-pre-line">
            <EditableText 
              value={values.clientAddress} 
              fieldId="clientAddress" 
              className="block" 
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </p>
        </div>
        <div className="text-right">
          <div className="mb-2">
            <span className="font-semibold">Invoice #: </span>
            <EditableText 
              value={values.invoiceNumber} 
              fieldId="invoiceNumber" 
              className="inline" 
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </div>
          <div className="mb-2">
            <span className="font-semibold">Date: </span>
            <EditableText 
              value={values.invoiceDate} 
              fieldId="invoiceDate" 
              className="inline" 
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </div>
          <div>
            <span className="font-semibold">Due Date: </span>
            <EditableText 
              value={values.dueDate} 
              fieldId="dueDate" 
              className="inline" 
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
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
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
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
                    onValueChange={(fieldId, value) => {
                      onValueChange(fieldId, Number(value));
                      
                      // Update the amount
                      const newAmount = Number(value) * item.rate;
                      onValueChange(`items.${index}.amount`, newAmount);
                      
                      // Update totals
                      setTimeout(() => {
                        updateInvoiceTotals(values.items, values.tax, onValueChange);
                      }, 0);
                    }}
                    isEditMode={isEditMode}
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
                    onValueChange={(fieldId, value) => {
                      onValueChange(fieldId, Number(value));
                      
                      // Update the amount
                      const newAmount = item.quantity * Number(value);
                      onValueChange(`items.${index}.amount`, newAmount);
                      
                      // Update totals
                      setTimeout(() => {
                        updateInvoiceTotals(values.items, values.tax, onValueChange);
                      }, 0);
                    }}
                    isEditMode={isEditMode}
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
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
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
            <span>$
              <EditableText 
                value={String(values.subtotal)} 
                fieldId="subtotal" 
                className="inline" 
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-semibold">Tax:</span>
            <EditableText 
              value={values.tax} 
              fieldId="tax" 
              className="inline" 
              onValueChange={(fieldId, value) => {
                onValueChange(fieldId, value);
                
                // Update total when tax changes
                setTimeout(() => {
                  updateInvoiceTotals(values.items, value, onValueChange);
                }, 0);
              }}
              isEditMode={isEditMode}
            />
          </div>
          <div className="flex justify-between py-2 text-lg font-bold">
            <span>Total:</span>
            <span>$
              <EditableText 
                value={String(values.total)} 
                fieldId="total" 
                className="inline" 
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </span>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-300 pt-4">
        <h3 className="font-semibold mb-2">Notes:</h3>
        <p className="text-gray-700 whitespace-pre-line">
          <EditableText 
            value={values.notes} 
            fieldId="notes" 
            className="block" 
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </p>
      </div>
    </div>
  );
};

/**
 * Helper function to update invoice totals
 */
const updateInvoiceTotals = (items, tax, onValueChange) => {
  if (!items) return;
  
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
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

export default Invoice;
