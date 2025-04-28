import React from "react";

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

/**
 * Reusable control button component for the template editor controls
 */
const ControlButton: React.FC<ControlButtonProps> = ({ icon, label, onClick }) => {
  return (
    <li>
      <button
        onClick={onClick}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-latte-text shadow-md hover:bg-blue-100/60 hover:text-blue-700 transition-colors duration-150 text-sm"
        title={label}
        aria-label={label}
      >
        {icon}
      </button>
    </li>
  );
};

interface PreviewOption {
  id: string;
  name: string;
}

interface TemplateControlsProps {
  onDownload: any | undefined;
  onDownloadPdf: (() => void) | undefined;
  showSizeOptions?: boolean;
  previewSize?: string;
  previewOptions?: PreviewOption[];
  onPreviewSizeChange?: (size: string) => void;
  showVariantOptions?: boolean;
  variant?: string;
  variantOptions?: PreviewOption[];
  onVariantChange?: (variant: string) => void;
  showBackSide?: boolean;
  onFlipCard?: () => void;
  canFlip?: boolean;
}

/**
 * Template controls component displayed on the right side of the editor
 */
const TemplateControls: React.FC<TemplateControlsProps> = ({ 
  onDownload,
  onDownloadPdf,
  showSizeOptions = false,
  previewSize = "default",
  previewOptions = [],
  onPreviewSizeChange = () => {},
  showVariantOptions = false,
  variant = "standard",
  variantOptions = [],
  onVariantChange = () => {},
  showBackSide = false,
  onFlipCard = () => {},
  canFlip = false
}) => {
  // Icons for control buttons
  const downloadPngIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
      />
    </svg>
  );
  
  const downloadPdfIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
  
  const flipCardIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
      />
    </svg>
  );

  const sizeIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
      />
    </svg>
  );

  const styleIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42"
      />
    </svg>
  );

  // State for dropdowns
  const [showSizeDropdown, setShowSizeDropdown] = React.useState(false);
  const [showStyleDropdown, setShowStyleDropdown] = React.useState(false);
  
  // Refs for handling clicks outside of dropdowns
  const sizeDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const styleDropdownRef = React.useRef<HTMLDivElement | null>(null);
  
  // Effect to add click outside handler for size dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target as Node)) {
        setShowSizeDropdown(false);
      }
    }
    
    // Add event listener when dropdown is open
    if (showSizeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSizeDropdown]);

  // Effect to add click outside handler for style dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (styleDropdownRef.current && !styleDropdownRef.current.contains(event.target as Node)) {
        setShowStyleDropdown(false);
      }
    }
    
    // Add event listener when dropdown is open
    if (showStyleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStyleDropdown]);

  return (
    <div className="controls-wrapper fixed z-50 flex items-center h-full right-0">
      <div className="m-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-latte-pink transition-all duration-300 ease-in-out flex flex-col p-3">
        <ul className="flex flex-col space-y-4 py-2">
          {onDownload && (
            <ControlButton 
              icon={downloadPngIcon} 
              label="Download as PNG" 
              onClick={onDownload} 
            />
          )}
          
          {onDownloadPdf && (
            <ControlButton 
              icon={downloadPdfIcon} 
              label="Download as PDF" 
              onClick={onDownloadPdf} 
            />
          )}
          
          {/* Size selector button and dropdown */}
          {showSizeOptions && (
            <li className="relative">
              <button
                onClick={() => {
                  setShowSizeDropdown(!showSizeDropdown);
                  setShowStyleDropdown(false);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-latte-text shadow-md hover:bg-blue-100/60 hover:text-blue-700 transition-colors duration-150 text-sm"
                title="Change Size"
                aria-label="Change Size"
              >
                {sizeIcon}
              </button>
              
              {/* Size dropdown */}
              {showSizeDropdown && (
                <div ref={sizeDropdownRef} className="absolute top-0 right-12 bg-white shadow-lg rounded-lg p-2 min-w-40 z-50">
                  <div className="text-sm font-medium mb-2 text-latte-text px-2">
                    Size Options:
                  </div>
                  <ul className="space-y-1">
                    {previewOptions.map((option) => (
                      <li key={option.id}>
                        <button
                          onClick={() => {
                            onPreviewSizeChange(option.id);
                            setShowSizeDropdown(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                            previewSize === option.id
                              ? "bg-blue-100/60 text-blue-700 font-semibold"
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                        >
                          {option.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )}
          
          {/* Variant/Style selector button and dropdown */}
          {showVariantOptions && (
            <li className="relative">
              <button
                onClick={() => {
                  setShowStyleDropdown(!showStyleDropdown);
                  setShowSizeDropdown(false);
                }}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-latte-text shadow-md hover:bg-blue-100/60 hover:text-blue-700 transition-colors duration-150 text-sm"
                title="Change Style"
                aria-label="Change Style"
              >
                {styleIcon}
              </button>
              
              {/* Style dropdown */}
              {showStyleDropdown && (
                <div ref={styleDropdownRef} className="absolute top-0 right-12 bg-white shadow-lg rounded-lg p-2 min-w-40 z-50">
                  <div className="text-sm font-medium mb-2 text-latte-text px-2">
                    Style Options:
                  </div>
                  <ul className="space-y-1">
                    {variantOptions.map((option) => (
                      <li key={option.id}>
                        <button
                          onClick={() => {
                            onVariantChange(option.id);
                            setShowStyleDropdown(false);
                          }}
                          className={`w-full text-left px-2 py-1.5 rounded text-sm ${
                            variant === option.id
                              ? "bg-blue-100/60 text-blue-700 font-semibold"
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                        >
                          {option.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          )}
          
          {/* Flip card button */}
          {canFlip && (
            <ControlButton 
              icon={flipCardIcon} 
              label={showBackSide ? "Show Front" : "Show Back"} 
              onClick={onFlipCard} 
            />
          )}
        </ul>
      </div>
    </div>
  );
};

export default TemplateControls;