import { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import useTemplateValues from "../hooks/useTemplateValues";
import TemplateRenderer from "../components/templates/TemplateRenderer";

/**
 * Template Editor page component
 * Allows users to edit and preview templates
 */
function TemplateEditor() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("edit");
  const [previewSize, setPreviewSize] = useState("default");
  const templateRef = useRef(null);

  // Use custom hook to manage template values
  const { template, values, updateValue, loading } =
    useTemplateValues(templateId);

  // If template wasn't found, redirect to home
  if (!loading && !template) {
    navigate("/");
    return null;
  }

  /**
   * Download the template as a PNG image
   */
  const downloadTemplate = () => {
    if (templateRef.current) {
      // Temporarily hide edit UI elements
      const prevMode = activeTab;
      setActiveTab("preview");

      // Use setTimeout to ensure the UI updates before capturing
      setTimeout(() => {
        toPng(templateRef.current)
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = `${templateId}-template.png`;
            link.href = dataUrl;
            link.click();

            // Restore previous mode
            setActiveTab(prevMode);
          })
          .catch((error) => {
            console.error("Error generating image:", error);
            setActiveTab(prevMode);
          });
      }, 100);
    }
  };

  // Determine if we should show size options based on template type
  const showSizeOptions = template?.template?.type === "social-post";

  // Get preview options based on template type
  const getPreviewOptions = () => {
    if (template?.template?.type === "social-post") {
      return [
        { id: "instagram", name: "Instagram (Square)" },
        { id: "instagramStory", name: "Instagram Story" },
        { id: "facebook", name: "Facebook" },
        { id: "twitter", name: "Twitter" },
        { id: "linkedin", name: "LinkedIn" },
      ];
    }

    return [{ id: "default", name: "Default" }];
  };

  const previewOptions = getPreviewOptions();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading template...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto flex gap-12">
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{template.name}</h1>
          <p className="text-gray-600">{template.description}</p>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            onClick={downloadTemplate}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Download Template
          </button>

          {showSizeOptions && (
            <div className="flex items-center space-x-2">
              <label
                htmlFor="preview-size"
                className="text-sm font-medium text-gray-700 invisible absolute -top-full"
              >
                Preview Size:
              </label>
              <select
                id="preview-size"
                value={previewSize}
                onChange={(e) => setPreviewSize(e.target.value)}
                className="border border-gray-300 rounded-md p-3 text-sm"
              >
                {previewOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {activeTab === "edit" && (
          <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-700 mb-2">
              Editing Tips
            </h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Click directly on text in the template to edit it</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Hover over images to change them</span>
              </li>
              {template?.template?.type === "social-post" && (
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Click on the color circle to change background colors
                  </span>
                </li>
              )}
              {template?.template?.type === "invoice" && (
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Use the "Add Item" button to add new invoice items
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div className="bg-gray-100 p-6 rounded-lg shadow-md">
          <div ref={templateRef}>
            <TemplateRenderer
              template={template.template}
              values={values}
              onValueChange={updateValue}
              isEditMode={activeTab === "edit"}
              size={previewSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateEditor;
