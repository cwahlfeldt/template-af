import React, { useState } from "react";
import { ImageUploadOverlayProps } from "../../types/components";

/**
 * Component for adding image upload functionality to template images
 * 
 * @param props - Component props
 * @returns Image upload overlay or null when not in edit mode
 */
const ImageUploadOverlay: React.FC<ImageUploadOverlayProps> = ({ 
  fieldId, 
  onValueChange, 
  isEditMode 
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  if (!isEditMode) return null;

  const handleImageClick = (): void => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent<FileReader>) => {
          onValueChange(fieldId, event.target?.result);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div
      className={`rounded absolute inset-0 flex items-center justify-center flex-col bg-black transition-opacity cursor-pointer opacity-0 hover:opacity-50`}
      onClick={handleImageClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title="Click to change image"
    >
      <div>
        <svg
          className="w-10 h-10 text-white mb-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <span className="text-white text-xs font-medium px-3 bg-black bg-opacity-75 rounded">
        Change
      </span>
    </div>
  );
};

export default ImageUploadOverlay;
