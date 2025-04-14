import React, { useState } from "react";
import EditableText from "../../../editor/EditableText";
import ImageUploadOverlay from "../../../editor/ImageUploadOverlay";
import { DoubleSidedCardProps } from "../../../../types/components";
import "./style.css";

/**
 * Double-sided Business Card template component
 */
const DoubleSidedCard: React.FC<DoubleSidedCardProps> = ({
  values,
  onValueChange,
  isEditMode,
  showBackSide = false,
  onFlip,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(showBackSide);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onFlip) {
      onFlip();
    }
  };

  return (
    <div style={{ marginTop: '20px', marginBottom: '40px', position: 'relative' }}>
      <div className={`double-sided-card ${isFlipped ? "flipped" : ""}`}>
        <div className="card-inner">
          <div className="card-front bg-white rounded-lg shadow-md flex flex-col p-4 border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  <EditableText
                    value={values.name}
                    fieldId="name"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </h2>
                <p className="text-gray-600">
                  <EditableText
                    value={values.title}
                    fieldId="title"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </p>
              </div>
              <div className="relative w-16 h-16">
                {values.logo && (
                  <>
                    <img
                      src={values.logo}
                      alt="Logo"
                      className="w-16 h-16 object-contain"
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
            <div className="text-sm text-gray-700 mt-2">
              <p className="font-semibold">
                <EditableText
                  value={values.company}
                  fieldId="company"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
              <p>
                <EditableText
                  value={values.address}
                  fieldId="address"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
              <div className="flex flex-col mt-2">
                <EditableText
                  value={values.phone}
                  fieldId="phone"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
                <EditableText
                  value={values.email}
                  fieldId="email"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
                <EditableText
                  value={values.website}
                  fieldId="website"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </div>
            </div>
          </div>

          <div className="card-back bg-gray-100 rounded-lg shadow-md flex flex-col p-4 border border-gray-200">
            <div className="flex flex-col justify-between h-full">
              <div className="text-center mb-2">
                <p className="font-semibold text-gray-800 italic">
                  <EditableText
                    value={values.tagline || ""}
                    fieldId="tagline"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </p>
              </div>

              <div className="flex-grow flex flex-col justify-center">
                <p className="text-sm text-gray-700 text-center">
                  <EditableText
                    value={values.backContent || ""}
                    fieldId="backContent"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </p>
              </div>

              <div className="mt-2 flex justify-center">
                {values.backLogo ? (
                  <div className="relative w-16 h-16">
                    <img
                      src={values.backLogo}
                      alt="Back Logo"
                      className="w-16 h-16 object-contain opacity-70"
                    />
                    <ImageUploadOverlay
                      fieldId="backLogo"
                      onValueChange={onValueChange}
                      isEditMode={isEditMode}
                    />
                  </div>
                ) : (
                  isEditMode && (
                    <div className="relative w-16 h-16 border border-dashed border-gray-300 flex items-center justify-center">
                      <ImageUploadOverlay
                        fieldId="backLogo"
                        onValueChange={onValueChange}
                        isEditMode={isEditMode}
                      />
                      <span className="text-gray-400 text-xs">Add Logo</span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flip button - only show in edit mode */}
      {isEditMode && (
        <button
          type="button"
          onClick={handleFlip}
          className="flip-button"
        >
          {isFlipped ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              Show Front
            </>
          ) : (
            <>
              Show Back
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </>
          )}
        </button>
      )}

      {/* For print/download version, show both sides stacked */}
      {!isEditMode && (
        <div className="double-sided-download-container print:block hidden">
          <div className="card-front bg-white rounded-lg shadow-md w-[350px] h-[200px] flex flex-col p-4 border border-gray-200 mb-4">
            {/* Front card content (duplicate of above) */}
          </div>
          <div className="card-back bg-gray-100 rounded-lg shadow-md w-[350px] h-[200px] flex flex-col p-4 border border-gray-200">
            {/* Back card content (duplicate of above) */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DoubleSidedCard;
