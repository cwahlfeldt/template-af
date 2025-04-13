import React, { useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import useTemplateValues from "../hooks/useTemplateValues";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import TemplateControls from "../components/navigation/TemplateControls";
import { Template } from "../types/templates";
import FlowBoard from "src/components/flowBoard/FlowBoard";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

interface PreviewOption {
  id: string;
  name: string;
}

/**
 * Template Editor page component
 * Allows users to edit and preview templates
 */
const TemplateEditor: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewSize, setPreviewSize] = useState<string>("default");
  const [cardStyle, setCardStyle] = useState<"standard" | "modern" | "minimal">("standard");
  const templateRef = useRef<HTMLDivElement | null>(null);

  // Use custom hook to manage template values
  const { template, values, updateValue, loading } = useTemplateValues(
    templateId || ""
  );

  // If template wasn't found, redirect to home
  if (!loading && !template) {
    navigate("/");
    return null;
  }

  /**
   * Download the template as a PNG image
   */
  const downloadTemplate = (): void => {
    if (templateRef.current) {
      // Temporarily hide edit UI elements
      const prevMode = activeTab;
      setActiveTab("preview");

      // Use setTimeout to ensure the UI updates before capturing
      setTimeout(() => {
        // Use non-null assertion since we've already checked templateRef.current is not null
        toPng(templateRef.current!)
          .then((dataUrl) => {
            const link = document.createElement("a");
            link.download = `${templateId}-template.png`;
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("Error generating image:", error);
          });
      }, 100);
    }
  };

  // Determine if we should show size options based on template type
  const showSizeOptions = template?.template?.type === "social-post";

  // Get preview options based on template type
  const getPreviewOptions = (): PreviewOption[] => {
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
    <>
      <div className="fixed flex flex-col justify-center items-center w-full top-4 left-0 mb-6 z-1 text-left">
        <div className="text-left">
          <h1 className="text-latte-pink text-5xl font-stretch-ultra-condensed font-extrabold italic">
            {template?.name}
          </h1>
          <p className="text-latte-overlay2">{template?.description}</p>
        </div>
      </div>
      
      {/* Template Controls */}
      <TemplateControls 
        onDownload={downloadTemplate} 
        showSizeOptions={showSizeOptions}
        previewSize={previewSize}
        previewOptions={previewOptions}
        onPreviewSizeChange={(size) => setPreviewSize(size)}
        templateType={template?.template?.type}
        cardStyle={cardStyle}
        onCardStyleChange={(style) => setCardStyle(style as "standard" | "modern" | "minimal")}
      />
      <div className="justify-center gap-12 w-full">
        <div className="p-6 flex w-screen relative justify-center items-center h-full min-h-screen">
          <div className="relative" ref={templateRef}>
            <TemplateRenderer
              template={template!.template}
              values={values}
              onValueChange={updateValue}
              isEditMode={activeTab === "edit"}
              size={previewSize}
              cardStyle={cardStyle}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateEditor;
