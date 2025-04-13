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
  onDownload: () => void;
  showSizeOptions?: boolean;
  previewSize?: string;
  previewOptions?: PreviewOption[];
  onPreviewSizeChange?: (size: string) => void;
  // Future props will go here for additional controls
}

/**
 * Template controls component displayed on the right side of the editor
 */
const TemplateControls: React.FC<TemplateControlsProps> = ({ 
  onDownload,
  showSizeOptions = false,
  previewSize = "default",
  previewOptions = [],
  onPreviewSizeChange = () => {},
}) => {
  // Icons for control buttons
  const downloadIcon = (
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

  // State for size dropdown
  const [showSizeDropdown, setShowSizeDropdown] = React.useState(false);
  
  // Ref for handling clicks outside of dropdown
  const dropdownRef = React.useRef<HTMLDivElement | null>(null);
  
  // Effect to add click outside handler
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  return (
    <div className="controls-wrapper fixed z-50 flex items-center h-full right-0">
      <div className="m-4 bg-white/90 backdrop-blur-md rounded-lg shadow-lg border border-latte-pink transition-all duration-300 ease-in-out flex flex-col p-3">
        <ul className="flex flex-col space-y-4 py-2">
          <ControlButton 
            icon={downloadIcon} 
            label="Download Template" 
            onClick={onDownload} 
          />
          
          {/* Size selector button and dropdown */}
          {showSizeOptions && (
            <li className="relative">
              <button
                onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-latte-text shadow-md hover:bg-blue-100/60 hover:text-blue-700 transition-colors duration-150 text-sm"
                title="Change Size"
                aria-label="Change Size"
              >
                {sizeIcon}
              </button>
              
              {/* Size dropdown */}
              {showSizeDropdown && (
                <div ref={dropdownRef} className="absolute top-0 right-12 bg-white shadow-lg rounded-lg p-2 min-w-40 z-50">
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
          
          {/* Additional control buttons will be added here */}
        </ul>
      </div>
    </div>
  );
};

export default TemplateControls;