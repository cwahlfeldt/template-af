import React from 'react';
import EditableText from '../../../components/editor/EditableText';
import ImageUploadOverlay from '../../../components/editor/ImageUploadOverlay';
import { TemplateComponentProps } from '../../_core/types';
import './styles.css';

/**
 * Etsy Display Coloring Sheet template component
 * Displays multiple scattered coloring sheets with title and subtitle
 * in a 4:3 frame for showcasing on Etsy
 */
const EtsyDisplayColoringSheet: React.FC<TemplateComponentProps> = ({
  values,
  onValueChange,
  isEditMode,
  variant = 'standard',
}) => {
  // Extract all available images from values
  const { 
    title, 
    subtitle, 
    backgroundColor,
    image1, image2, image3, image4, image5, image6, image7, image8, image9, image10,
    image11, image12
  } = values;
  
  // Create an array of images that exist
  const images = [
    image1, image2, image3, image4, image5, image6, image7, image8, image9, image10,
    image11, image12
  ].filter(img => img);
  
  return (
    <div className="relative">
      {/* Main container */}
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
        
        {/* Image display area with scattered layout */}
        <div className="coloring-sheet-images-container">
          {/* Image 1 */}
          {image1 && (
            <div className="coloring-sheet-image image-1">
              <img
                src={image1}
                alt="Coloring sheet 1"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image1"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 2 */}
          {image2 && (
            <div className="coloring-sheet-image image-2">
              <img
                src={image2}
                alt="Coloring sheet 2"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image2"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 3 */}
          {image3 && (
            <div className="coloring-sheet-image image-3">
              <img
                src={image3}
                alt="Coloring sheet 3"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image3"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 4 */}
          {image4 && (
            <div className="coloring-sheet-image image-4">
              <img
                src={image4}
                alt="Coloring sheet 4"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image4"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 5 */}
          {image5 && (
            <div className="coloring-sheet-image image-5">
              <img
                src={image5}
                alt="Coloring sheet 5"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image5"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 6 */}
          {image6 && (
            <div className="coloring-sheet-image image-6">
              <img
                src={image6}
                alt="Coloring sheet 6"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image6"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 7 */}
          {image7 && (
            <div className="coloring-sheet-image image-7">
              <img
                src={image7}
                alt="Coloring sheet 7"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image7"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 8 */}
          {image8 && (
            <div className="coloring-sheet-image image-8">
              <img
                src={image8}
                alt="Coloring sheet 8"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image8"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 9 */}
          {image9 && (
            <div className="coloring-sheet-image image-9">
              <img
                src={image9}
                alt="Coloring sheet 9"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image9"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 10 */}
          {image10 && (
            <div className="coloring-sheet-image image-10">
              <img
                src={image10}
                alt="Coloring sheet 10"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image10"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 11 */}
          {image11 && (
            <div className="coloring-sheet-image image-11">
              <img
                src={image11}
                alt="Coloring sheet 11"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image11"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
          
          {/* Image 12 */}
          {image12 && (
            <div className="coloring-sheet-image image-12">
              <img
                src={image12}
                alt="Coloring sheet 12"
                className="coloring-image"
              />
              <ImageUploadOverlay
                fieldId="image12"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EtsyDisplayColoringSheet;