import React, { useState, useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";
import EditableText from "../../../components/editor/EditableText";
import ImageUploadOverlay from "../../../components/editor/ImageUploadOverlay";
import { TemplateComponentProps } from "../../_core/types";
import "./styles.css";

// Size variants for different platforms
interface SizeVariant {
  className: string;
}

interface SizeVariants {
  [key: string]: SizeVariant;
}

/**
 * Social Media Post template component
 */
const SocialPostTemplate: React.FC<TemplateComponentProps> = ({
  values,
  onValueChange,
  isEditMode,
  size = "instagram",
}) => {
  // Add state to manage the color picker
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [colorPickerPosition, setColorPickerPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });
  const colorPickerRef = useRef<HTMLDivElement | null>(null);

  // Size variants for different platforms
  const sizeVariants: SizeVariants = {
    instagram: { className: "size-instagram" },
    instagramStory: { className: "size-instagram-story" },
    facebook: { className: "size-facebook" },
    twitter: { className: "size-twitter" },
    linkedin: { className: "size-linkedin" },
    default: { className: "size-instagram" }
  };

  const currentSize =
    sizeVariants[size] || sizeVariants.default;

  // Close picker when clicking outside
  useEffect(() => {
    if (!showColorPicker) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node)
      ) {
        setShowColorPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showColorPicker]);

  const handleColorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditMode) return;

    // Get the button's position
    const buttonRect = e.currentTarget.getBoundingClientRect();

    // Set position for the color picker
    setColorPickerPosition({
      top: buttonRect.bottom + 5, // 5px below the button
      left: buttonRect.left,
    });

    // Show the color picker
    setShowColorPicker(true);

    // Prevent event propagation
    e.stopPropagation();
  };

  return (
    <div
      className={`social-post rounded-lg shadow-md ${currentSize.className} flex flex-col justify-between overflow-hidden relative`}
      style={{ backgroundColor: values.brandColor || "#ff5722" }}
    >
      {values.backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center mix-blend-multiply"
            style={{ backgroundImage: `url(${values.backgroundImage})` }}
          />
          {isEditMode && (
            <div className="absolute top-0 left-0 w-full h-full z-10">
              <ImageUploadOverlay
                fieldId="backgroundImage"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
        </>
      )}

      <div className="relative p-8 flex justify-between items-start">
        <div className="relative w-48 z-20">
          {values.logo && (
            <>
              <img
                src={values.logo}
                alt="Logo"
                className="w-full h-20 object-contain"
              />
              {isEditMode && (
                <ImageUploadOverlay
                  fieldId="logo"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              )}
            </>
          )}
        </div>

        {isEditMode && (
          <div
            className="z-20 p-2 bg-white rounded-full shadow-md cursor-pointer color-picker-button"
            onClick={handleColorClick}
            title="Click to change background color"
          >
            <span
              className="block w-6 h-6 rounded-full"
              style={{ backgroundColor: values.brandColor }}
            />
          </div>
        )}

        {/* Color picker popup */}
        {showColorPicker && isEditMode && (
          <div
            ref={colorPickerRef}
            className="absolute z-50"
            style={{
              position: "fixed",
              top: `${colorPickerPosition.top}px`,
              left: `${colorPickerPosition.left}px`,
            }}
          >
            <div className="p-2 bg-white rounded-lg shadow-lg">
              <HexColorPicker
                color={values.brandColor || "#fda286"}
                onChange={(color) => onValueChange("brandColor", color)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-8 text-white text-center">
        <h2 className="text-4xl font-bold mb-4 drop-shadow-md z-20 relative">
          <EditableText
            value={values.headline}
            fieldId="headline"
            className="block"
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </h2>
        <p className="relative text-xl mb-8 drop-shadow-md z-20">
          <EditableText
            value={values.subtext}
            fieldId="subtext"
            className="block"
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </p>
        <button className="bg-white relative text-black font-semibold py-3 px-8 rounded-full text-xl z-20">
          <EditableText
            value={values.callToAction}
            fieldId="callToAction"
            className="block"
            onValueChange={onValueChange}
            isEditMode={isEditMode}
          />
        </button>
      </div>
    </div>
  );
};

export default SocialPostTemplate;