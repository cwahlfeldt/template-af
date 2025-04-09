import React from 'react';

/**
 * Component for rendering editable text elements within templates
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - The text value to display
 * @param {string} props.fieldId - The field ID for updates
 * @param {string} props.className - Additional CSS classes
 * @param {function} props.onValueChange - Function to call when value changes
 * @param {boolean} props.isEditMode - Whether edit mode is active
 * @returns {JSX.Element} Editable text element
 */
const EditableText = ({ value, fieldId, className, onValueChange, isEditMode }) => {
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

export default EditableText;
