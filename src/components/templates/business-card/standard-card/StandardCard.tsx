import React from "react";
import EditableText from "../../../editor/EditableText";
import ImageUploadOverlay from "../../../editor/ImageUploadOverlay";
import { StandardCardProps } from "../../../../types/components";
import "./style.css";

/**
 * Standard Business Card template component with multiple designs
 */
const StandardCard: React.FC<StandardCardProps> = ({
  values,
  onValueChange,
  isEditMode,
  cardStyle = "standard",
}) => {
  // Render the appropriate design
  switch (cardStyle) {
    case "modern":
      return (
        <div className="relative">
          <div className="business-card card-for-download bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md w-[350px] h-[200px] flex flex-col p-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">
                  <EditableText
                    value={values.name}
                    fieldId="name"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </h2>
                <p className="text-indigo-100">
                  <EditableText
                    value={values.title}
                    fieldId="title"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </p>
              </div>
              <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {values.logo && (
                  <>
                    <img
                      src={values.logo}
                      alt="Logo"
                      className="w-12 h-12 object-contain"
                    />
                    <ImageUploadOverlay
                      fieldId="logo"
                      onValueChange={onValueChange}
                      isEditMode={isEditMode}
                    />
                  </>
                )}
              </div>
            </div>
            <div className="text-sm text-white mt-2">
              <p className="font-semibold">
                <EditableText
                  value={values.company}
                  fieldId="company"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
              <p>
                <EditableText
                  value={values.address}
                  fieldId="address"
                  className="block text-indigo-100"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
              <div className="flex flex-col mt-2">
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
      );

    case "minimal":
      return (
        <div className="relative">
          <div className="business-card card-for-download bg-white rounded-lg shadow-md w-[350px] h-[200px] flex flex-col p-2 border-l-4 border-gray-800">
            <div>
              <h2 className="text-2xl font-light text-gray-800 mb-1">
                <EditableText
                  value={values.name}
                  fieldId="name"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                <EditableText
                  value={values.title}
                  fieldId="title"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
              <p className="font-medium text-gray-800 text-sm">
                <EditableText
                  value={values.company}
                  fieldId="company"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
            </div>

            <div className="flex justify-between items-end">
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <EditableText
                    value={values.phone}
                    fieldId="phone"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
                <div>
                  <EditableText
                    value={values.email}
                    fieldId="email"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
                <div>
                  <EditableText
                    value={values.website}
                    fieldId="website"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
                <div>
                  <EditableText
                    value={values.address}
                    fieldId="address"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
              </div>

              <div className="relative w-16 h-16">
                {values.logo && (
                  <>
                    <img
                      src={values.logo}
                      alt="Logo"
                      className="w-16 h-16 object-contain opacity-70"
                    />
                    <ImageUploadOverlay
                      fieldId="logo"
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

    // Standard design (default)
    default:
      return (
        <div className="relative">
          <div className="business-card card-for-download bg-white rounded-lg shadow-md w-[350px] h-[200px] flex flex-col p-2 border border-gray-200">
            <div className="flex justify-between items-start">
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
              </div>
              <div className="relative w-16 h-16">
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
            </div>
            <div className="text-sm text-gray-700 mt-2">
              <p className="font-semibold">
                <EditableText
                  value={values.company}
                  fieldId="company"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
              <p>
                <EditableText
                  value={values.address}
                  fieldId="address"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
              <div className="flex flex-col mt-2">
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
      );
  }
};

export default StandardCard;
