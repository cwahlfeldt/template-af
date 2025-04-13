import React from "react";
import { InvoiceProps } from "../../../types/components";
import { InvoiceItem } from "../../../types/templates";
import EditableText from "../../editor/EditableText";
import ImageUploadOverlay from "../../editor/ImageUploadOverlay";

/**
 * Invoice template component
 */
const Invoice: React.FC<InvoiceProps> = ({
  values,
  onValueChange,
  isEditMode,
}) => {
  // Add a new row to the invoice items
  const addInvoiceItem = (): void => {
    if (!isEditMode) return;

    const items = [...(values.items || [])];
    items.push({
      description: "New Item",
      quantity: 1,
      rate: 0,
      amount: 0,
    });

    onValueChange("items", items);
    updateInvoiceTotals(items, values.tax, onValueChange);
  };

  // Remove a row from the invoice items
  const removeInvoiceItem = (index: number): void => {
    if (!isEditMode) return;

    const items = [...(values.items || [])];
    items.splice(index, 1);

    onValueChange("items", items);
    updateInvoiceTotals(items, values.tax, onValueChange);
  };

  return (
    <div className="invoice bg-white p-6 rounded-lg shadow-md w-[800px] border border-gray-200 scale-90">
      <div className="flex justify-between items-center mb-8">
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
        <div className="relative">
          {values.logo && (
            <>
              <img
                src={values.logo}
                alt="Logo"
                className="w-48 h-max object-contain"
              />
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

      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 text-left border border-gray-300">
                Description
              </th>
              <th className="py-2 px-4 text-center border border-gray-300">
                Quantity
              </th>
              <th className="py-2 px-4 text-center border border-gray-300">
                Rate
              </th>
              <th className="py-2 px-4 text-right border border-gray-300">
                Amount
              </th>
              {isEditMode && (
                <th className="py-2 px-2 w-10 border border-gray-300"></th>
              )}
            </tr>
          </thead>
          <tbody>
            {values.items &&
              values.items.map((item: InvoiceItem, index: number) => (
                <tr key={index}>
                  <td className="py-2 px-4 border border-gray-300">
                    <EditableText
                      value={item.description}
                      fieldId={`items.${index}.description`}
                      className="block"
                      onValueChange={onValueChange}
                      isEditMode={isEditMode}
                    />
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300">
                    <EditableText
                      value={String(item.quantity)}
                      fieldId={`items.${index}.quantity`}
                      className="block text-center"
                      onValueChange={(fieldId: string, value: any) => {
                        const numValue = Number(value) || 0;
                        onValueChange(fieldId, numValue);

                        // Update the amount
                        const newAmount = numValue * item.rate;
                        onValueChange(`items.${index}.amount`, newAmount);

                        // Update totals
                        setTimeout(() => {
                          const updatedItems = [...values.items];
                          updatedItems[index].quantity = numValue;
                          updatedItems[index].amount = newAmount;
                          updateInvoiceTotals(
                            updatedItems,
                            values.tax,
                            onValueChange
                          );
                        }, 0);
                      }}
                      isEditMode={isEditMode}
                    />
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300">
                    $
                    <EditableText
                      value={String(item.rate)}
                      fieldId={`items.${index}.rate`}
                      className="inline"
                      onValueChange={(fieldId: string, value: any) => {
                        const numValue = Number(value) || 0;
                        onValueChange(fieldId, numValue);

                        // Update the amount
                        const newAmount = item.quantity * numValue;
                        onValueChange(`items.${index}.amount`, newAmount);

                        // Update totals
                        setTimeout(() => {
                          const updatedItems = [...values.items];
                          updatedItems[index].rate = numValue;
                          updatedItems[index].amount = newAmount;
                          updateInvoiceTotals(
                            updatedItems,
                            values.tax,
                            onValueChange
                          );
                        }, 0);
                      }}
                      isEditMode={isEditMode}
                    />
                  </td>
                  <td className="py-2 px-4 text-right border border-gray-300">
                    ${item.amount}
                  </td>
                  {isEditMode && (
                    <td className="py-2 px-2 border border-gray-300">
                      <button
                        type="button"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeInvoiceItem(index)}
                        title="Remove item"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>

        {isEditMode && (
          <div className="mt-2 text-right">
            <button
              type="button"
              className="text-sm inline-flex items-center text-indigo-600 hover:text-indigo-800"
              onClick={addInvoiceItem}
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Item
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-end mb-8">
        <div className="w-64">
          <div className="flex justify-between py-2">
            <span className="font-semibold">Subtotal:</span>
            <span>
              $
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
              value={String(values.tax)}
              fieldId="tax"
              className="inline"
              onValueChange={(fieldId: string, value: any) => {
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
            <span>
              $
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
const updateInvoiceTotals = (
  items: InvoiceItem[] | undefined,
  tax: string | number,
  onValueChange: (id: string, value: any) => void
): void => {
  if (!items) return;

  const subtotal = items.reduce(
    (sum: number, item: InvoiceItem) => sum + (item.amount || 0),
    0
  );
  onValueChange("subtotal", subtotal);

  // Parse tax value, handling percentage or fixed amount
  let taxValue = 0;
  if (typeof tax === "string" && tax.includes("%")) {
    const percentage = parseFloat(tax) || 0;
    taxValue = subtotal * (percentage / 100);
  } else {
    taxValue = parseFloat(tax as string) || 0;
  }

  onValueChange("total", subtotal + taxValue);
};

export default Invoice;