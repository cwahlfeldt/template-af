import React from 'react';
import EditableText from '../../../components/editor/EditableText';
import ImageUploadOverlay from '../../../components/editor/ImageUploadOverlay';
import { TemplateComponentProps } from '../../_core/types';
import './styles.css';

/**
 * Etsy Display Coloring Sheet template component
 * Displays multiple overlapping coloring sheet images with title and subtitle
 * in a 4:3 frame for showcasing on Etsy
 */
const EtsyDisplayColoringSheet: React.FC<TemplateComponentProps> = ({
  values,
  onValueChange,
  isEditMode,
  variant = 'standard',
}) => {
  const { title, subtitle, image1, image2, image3, image4, backgroundColor } = values;
  
  return (
    <div className="relative">
      {/* Main container with 4:3 aspect ratio - 1200×900px for high quality */}
      <div 
        className="coloring-sheet-display-container" 
        style={{ backgroundColor: backgroundColor || '#f8f5ff' }}
      >
        {/* Title section */}
        <div className="coloring-sheet-title-container">
          <h1 className="coloring-sheet-title">
            <EditableText
              value={title}
              fieldId="title"
              className="block"
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </h1>
          <p className="coloring-sheet-subtitle">
            <EditableText
              value={subtitle}
              fieldId="subtitle"
              className="block"
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </p>
        </div>
        
        {/* Image display area with fanned/overlapping layout */}
        <div className="coloring-sheet-images-container">
          {/* Image 1 - Bottom right */}
          <div className="coloring-sheet-image image-1">
            {image1 && (
              <>
                <img
                  src={image1}
                  alt="Coloring sheet preview 1"
                  className="coloring-image"
                />
                <ImageUploadOverlay
                  fieldId="image1"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </>
            )}
          </div>
          
          {/* Image 2 - Bottom left */}
          <div className="coloring-sheet-image image-2">
            {image2 && (
              <>
                <img
                  src={image2}
                  alt="Coloring sheet preview 2"
                  className="coloring-image"
                />
                <ImageUploadOverlay
                  fieldId="image2"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </>
            )}
          </div>
          
          {/* Image 3 - Top right */}
          <div className="coloring-sheet-image image-3">
            {image3 && (
              <>
                <img
                  src={image3}
                  alt="Coloring sheet preview 3"
                  className="coloring-image"
                />
                <ImageUploadOverlay
                  fieldId="image3"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </>
            )}
          </div>
          
          {/* Image 4 - Top left */}
          <div className="coloring-sheet-image image-4">
            {image4 && (
              <>
                <img
                  src={image4}
                  alt="Coloring sheet preview 4"
                  className="coloring-image"
                />
                <ImageUploadOverlay
                  fieldId="image4"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtsyDisplayColoringSheet;