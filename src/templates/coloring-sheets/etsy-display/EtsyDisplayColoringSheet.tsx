import React from "react";
// import EditableText from "../../../components/web-components/editable-text";
import ImageUploadOverlay from "../../../components/editor/ImageUploadOverlay";
import { TemplateComponentProps } from "../../_core/types";
import "./styles.css";

/**
 * Etsy Display Coloring Sheet template component
 * Displays multiple scattered coloring sheets with title and subtitle
 * in a 4:3 frame for showcasing on Etsy
 */
const EtsyDisplayColoringSheet: React.FC<TemplateComponentProps> = ({
  values,
  onValueChange,
  isEditMode,
  printConfig,
}) => {
  // Extract all available images from values
  const {
    title,
    subtitle,
    backgroundColor,
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
    image7,
    image8,
    image9,
    image10,
    image11,
    image12,
  } = values;

  // Create an array of images that exist
  const images = [
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
    image7,
    image8,
    image9,
    image10,
    image11,
    image12,
  ].filter((img) => img);

  console.log(printConfig);

  return (
    <>
      {/* Main container */}
      <div className="coloring-sheet-display-container bg-white">
        {/* Title section */}
        <div className="coloring-sheet-title-container">
          <div>
            <editable-text id="coloring-sheet-title" persist>
              <h1 className="coloring-sheet-title">{title}</h1>
            </editable-text>
          </div>
          <div>
            <editable-text id="coloring-sheet-subtitle" persist>
              <h2 className="coloring-sheet-subtitle">{subtitle}</h2>
            </editable-text>
          </div>
        </div>

        {/* Image display area with scattered layout */}
        <div className="coloring-sheet-images-container">
          {images.map((image, index) => (
            <div className={`coloring-sheet-image image-${index}`}>
              <editable-image>
                <img
                  id={`image${index + 1}`}
                  src={image}
                  alt="Coloring sheet 1"
                  className="coloring-image"
                />
              </editable-image>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EtsyDisplayColoringSheet;
