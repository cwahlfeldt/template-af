import React, { useState, useEffect } from "react";
import EditableText from "../../../components/editor/EditableText";
import ImageUploadOverlay from "../../../components/editor/ImageUploadOverlay";
import { TemplateComponentProps } from "../../_core/types";
import "./styles.css";

/**
 * QR Code Business Card template component
 */
const QRCodeBusinessCard: React.FC<TemplateComponentProps> = ({
  values,
  onValueChange,
  isEditMode,
  showBackSide = false,
}) => {
  const [isFlipped, setIsFlipped] = useState<boolean>(showBackSide);
  const [qrCodeImage, setQrCodeImage] = useState<string>("");

  // Synchronize with external showBackSide prop
  useEffect(() => {
    setIsFlipped(showBackSide);
  }, [showBackSide]);

  // Generate QR code on load and when data changes
  useEffect(() => {
    // Simple QR code generation by using an external service
    // In a production app, you might want to use a library for this
    const encodedData = encodeURIComponent(values.qrCodeData);
    setQrCodeImage(`https://chart.googleapis.com/chart?cht=qr&chl=${encodedData}&chs=150x150&choe=UTF-8&chld=L|2`);
  }, [values.qrCodeData]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Social icons component
  const SocialIcons = () => (
    <div className="social-icons">
      {values.linkedinProfile && (
        <a
          href={`https://${values.linkedinProfile}`}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>
      )}
      {values.twitterHandle && (
        <a
          href={`https://twitter.com/${values.twitterHandle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-2.719 0-4.925 2.206-4.925 4.926 0 .386.044.762.127 1.122-4.092-.205-7.72-2.166-10.149-5.145-.423.727-.665 1.573-.665 2.476 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 14-7.503 14-14 0-.21-.015-.42-.019-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z" />
          </svg>
        </a>
      )}
      {values.instagramHandle && (
        <a
          href={`https://instagram.com/${values.instagramHandle.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          onClick={(e) => isEditMode && e.preventDefault()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
      )}
    </div>
  );

  return (
    <div style={{ marginTop: '20px', marginBottom: '40px', position: 'relative' }}>
      <div className={`qr-code-card ${isFlipped ? "flipped" : ""}`}>
        <div className="card-inner">
          <div className="card-front bg-white rounded-lg shadow-md flex p-4 border border-gray-200">
            <div className="flex-grow">
              <div className="flex flex-col h-full justify-between">
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
                  <p className="font-semibold text-sm mt-1">
                    <EditableText
                      value={values.company}
                      fieldId="company"
                      className="block"
                      onValueChange={onValueChange}
                      isEditMode={isEditMode}
                    />
                  </p>
                </div>
                
                <div className="text-sm text-gray-700 mt-auto">
                  <div className="flex flex-col space-y-0.5">
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
            </div>
            
            <div className="ml-4 flex flex-col items-center">
              <div className="relative w-16 h-16 mb-2">
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
              
              <div className="mt-auto">
                <div className="qr-code-container">
                  {qrCodeImage && (
                    <img src={qrCodeImage} alt="QR Code" className="qr-code" />
                  )}
                </div>
                <div className="qr-code-label">
                  <EditableText
                    value={values.qrCodeLabel || ""}
                    fieldId="qrCodeLabel"
                    className="block text-center"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card-back bg-gray-100 rounded-lg shadow-md flex flex-col p-4 border border-gray-200">
            <div className="flex flex-col justify-between h-full">
              <div className="text-center mb-2">
                <p className="font-semibold text-gray-800">
                  <EditableText
                    value={values.company}
                    fieldId="company"
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

              <div className="mt-4 flex flex-col items-center gap-2">
                <SocialIcons />
                
                {isEditMode && (
                  <div className="text-xs text-gray-500 flex flex-col gap-1">
                    <div className="flex">
                      <span className="w-24">LinkedIn:</span>
                      <EditableText
                        value={values.linkedinProfile || ""}
                        fieldId="linkedinProfile"
                        className="block"
                        onValueChange={onValueChange}
                        isEditMode={isEditMode}
                      />
                    </div>
                    <div className="flex">
                      <span className="w-24">Twitter:</span>
                      <EditableText
                        value={values.twitterHandle || ""}
                        fieldId="twitterHandle"
                        className="block"
                        onValueChange={onValueChange}
                        isEditMode={isEditMode}
                      />
                    </div>
                    <div className="flex">
                      <span className="w-24">Instagram:</span>
                      <EditableText
                        value={values.instagramHandle || ""}
                        fieldId="instagramHandle"
                        className="block"
                        onValueChange={onValueChange}
                        isEditMode={isEditMode}
                      />
                    </div>
                  </div>
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
        <div className="qr-download-container print:block hidden">
          <div className="card-front bg-white rounded-lg shadow-md w-[350px] h-[200px] flex p-4 border border-gray-200 mb-4">
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

export default QRCodeBusinessCard;