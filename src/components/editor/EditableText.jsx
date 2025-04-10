import React, { useState, useRef, useEffect } from "react";

/**
 * Component for rendering editable text elements within templates
 */
const EditableText = ({
  value,
  fieldId,
  className,
  onValueChange,
  isEditMode,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const contentRef = useRef(null);

  // Only update the inner HTML when the component mounts or value changes while not focused
  useEffect(() => {
    if (contentRef.current && !isFocused) {
      contentRef.current.innerText = value;
    }
  }, [value, isFocused]);

  if (!isEditMode) {
    return <span className={className}>{value}</span>;
  }

  return (
    <span
      ref={contentRef}
      className={`${className} cursor-text transition-all duration-200 
        ${isHovered || isFocused ? "bg-blue-20" : ""}
        ${isHovered ? "outline-dashed outline-1 outline-black-300" : ""}
        ${
          isFocused
            ? "outline-dashed outline-2 outline-black-500 bg-blue-20"
            : ""
        }
      `}
      contentEditable={true}
      suppressContentEditableWarning={true}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        setIsFocused(false);
        onValueChange(fieldId, e.target.innerText);
      }}
      // Remove the onInput handler to prevent constant updates while typing
      data-field-id={fieldId}
      title="Click to edit"
    />
  );
};

export default EditableText;
