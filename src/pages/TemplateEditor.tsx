import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toPng } from "html-to-image";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import useTemplateValues from "../hooks/useTemplateValues";
import TemplateRenderer from "../components/TemplateRenderer";
import TemplateControls from "../components/navigation/TemplateControls";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { exportElementAsImage } from "../utils/exportElementAsImage"; // Adjust path

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



  // No helper function needed

  /**
   * Download the template as a PNG image
   */
  const downloadTemplateAsPng = async (): Promise<void> => {
    if (!templateRef.current) return;
    // const element = templateRef.current;
    // const ogTransform = element.style.transform;

    try {
      const element = templateRef.current;
      exportElementAsImage(element);

      // element.style.transform = "scale(1)";

      // const canvas = await html2canvas(element, {
      //   scale: 2,
      //   useCORS: true,
      //   allowTaint: true,
      //   backgroundColor: null,
      //   logging: false,
      // });

      // const dataUrl = canvas.toDataURL("image/png");
      // const link = document.createElement("a");
      // link.download = `${template?.id}-template.png`;
      // link.href = dataUrl;
      // link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    } // finally {
    //   element.style.transform = ogTransform;
    // }
  };

  /**
   * Download the template as a PDF document
   */
  const downloadTemplateAsPdf = async (): Promise<void> => {
    if (!templateRef.current || !template?.printConfig) return;

    // Get print configuration
    const printConfig = template.printConfig;

    // Skip if PDF format is not supported
    if (!printConfig.formats.includes("pdf")) {
      console.error("PDF format is not supported for this template");
      return;
    }

    // Use default A4 dimensions if not specified
    const dimensions = printConfig.dimensions || {
      width: 210,
      height: 297,
      unit: "mm",
    };

    // Get orientation
    const orientation = printConfig.orientation || "portrait";

    try {
      // Create a clone of the template element to work with
      const element = templateRef.current;

      // Don't change the active tab - keep the editing UI visible
      // This ensures text remains visible in the browser

      const canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Calculate dimensions based on configuration
      const { width, height, unit } = dimensions;

      // Create PDF document with the specified dimensions
      const pdf = new jsPDF(orientation as any, unit as any, [width, height]);

      // Calculate image dimensions to fit in the PDF
      let imgWidth = width;
      let imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Apply margins if specified
      let xPosition = 0;
      let yPosition = 0;

      if (printConfig.margins) {
        const { left, top } = printConfig.margins;
        xPosition = left;
        yPosition = top;
        imgWidth = width - (left + printConfig.margins.right);
        imgHeight = (canvas.height * imgWidth) / canvas.width;
      }

      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      // Add the image to the PDF
      pdf.addImage(imgData, "JPEG", xPosition, yPosition, imgWidth, imgHeight);

      // Save the PDF
      pdf.save(`${template.id}-template.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Determine if we should show size options based on template's previewSizes
  const showSizeOptions =
    template?.previewSizes && template.previewSizes.length > 0;

  // Determine which export formats are available
  const supportedFormats = template?.printConfig?.formats || ["png"];
  const supportsPdf = supportedFormats.includes("pdf");
  const supportsPng = supportedFormats.includes("png");
  const dimensions = {
    width: template?.printConfig?.dimensions?.width,
    height: template?.printConfig?.dimensions?.height,
  };
  const aspectRatio =
    template?.printConfig?.orientation === "landscape"
      ? `${dimensions.width} / ${dimensions.height}`
      : `${dimensions.height} / ${dimensions.width}`;
  const scale = template?.printConfig?.initialScale ?? 1;

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
        name: data.name,
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
      <div className="fixed flex flex-col justify-center pl-5 w-full top-4 left-0 mb-6 z-1">
        <div>
          <h1 className="text-latte-pink text-5xl font-stretch-ultra-condensed font-extrabold italic">
            {template?.name}
          </h1>
          <p className="text-latte-overlay2 mt-1">{template?.description}</p>
        </div>
      </div>

      {/* Template Controls */}
      <TemplateControls
        onDownload={supportsPng ? downloadTemplateAsPng : undefined}
        onDownloadPdf={supportsPdf ? downloadTemplateAsPdf : undefined}
        showSizeOptions={showSizeOptions}
        previewSize={previewSize}
        previewOptions={previewOptions}
        onPreviewSizeChange={(size) => setPreviewSize(size)}
        showVariantOptions={
          !!template?.variants && Object.keys(template.variants).length > 0
        }
        variant={variant}
        variantOptions={variantOptions}
        onVariantChange={(newVariant) => setVariant(newVariant)}
        showBackSide={showBackSide}
        onFlipCard={() => setShowBackSide(!showBackSide)}
        canFlip={!!template?.hasBackSide}
      />
      <div className="justify-center gap-12 w-full">
        <div className="p-6 flex w-screen relative justify-center items-center h-screen">
          <div
            className="relative print"
            ref={templateRef}
            style={{ aspectRatio }}
          >
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
