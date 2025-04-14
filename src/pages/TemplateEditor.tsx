import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import useTemplateValues from "../hooks/useTemplateValues";
import TemplateRenderer from "../components/templates/TemplateRenderer";
import TemplateControls from "../components/navigation/TemplateControls";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

/**
 * Template Editor page component
 * Allows users to edit and preview templates
 */
const TemplateEditor: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [previewSize, setPreviewSize] = useState<string>("default");
  const [variant, setVariant] = useState<string>("standard");
  const [showBackSide, setShowBackSide] = useState<boolean>(false);
  const templateRef = useRef<HTMLDivElement | null>(null);

  // Use custom hook to manage template values
  const { template, values, updateValue, loading, error } = useTemplateValues(
    templateId || ""
  );

  // Use useEffect for navigation to prevent state updates during render
  useEffect(() => {
    if (!loading && (error || !template)) {
      navigate("/");
    }
  }, [loading, error, template, navigate]);

  // Early return if no template or still loading
  if (!template && !loading) {
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
            link.download = `${template?.id}-template.png`;
            link.href = dataUrl;
            link.click();
          })
          .catch((error) => {
            console.error("Error generating image:", error);
          });
      }, 100);
    }
  };

  // Determine if we should show size options based on template's previewSizes
  const showSizeOptions = template?.previewSizes && template.previewSizes.length > 0;

  // Get preview options based on template's previewSizes
  const getPreviewOptions = () => {
    if (template?.previewSizes && template.previewSizes.length > 0) {
      return template.previewSizes;
    }
    return [{ id: "default", name: "Default" }];
  };

  // Get variant options based on template's variants
  const getVariantOptions = () => {
    if (template?.variants) {
      return Object.entries(template.variants).map(([id, data]) => ({
        id,
        name: data.name
      }));
    }
    return [{ id: "standard", name: "Standard" }];
  };

  const previewOptions = getPreviewOptions();
  const variantOptions = getVariantOptions();

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
        showVariantOptions={!!template?.variants && Object.keys(template.variants).length > 0}
        variant={variant}
        variantOptions={variantOptions}
        onVariantChange={(newVariant) => setVariant(newVariant)}
        showBackSide={showBackSide}
        onFlipCard={() => setShowBackSide(!showBackSide)}
        canFlip={!!template?.hasBackSide}
      />
      <div className="justify-center gap-12 w-full">
        <div className="p-6 flex w-screen relative justify-center items-center h-full min-h-screen">
          <div className="relative" ref={templateRef} style={{ minHeight: '250px' }}>
            <TemplateRenderer
              template={template!}
              values={values}
              onValueChange={updateValue}
              isEditMode={activeTab === "edit"}
              size={previewSize}
              variant={variant}
              showBackSide={showBackSide}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default TemplateEditor;
