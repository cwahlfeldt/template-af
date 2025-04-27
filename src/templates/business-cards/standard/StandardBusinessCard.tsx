import React from "react";
import EditableText from "../../../components/editor/EditableText";
import ImageUploadOverlay from "../../../components/editor/ImageUploadOverlay";
import { TemplateComponentProps } from "../../_core/types";
import "./styles.css";

/**
 * Standard Business Card template component
 * Supports multiple design variants: standard, modern, minimal
 */
const StandardBusinessCard: React.FC<TemplateComponentProps> = ({
  values,
  onValueChange,
  isEditMode,
}) => {
  // Get the business card values
  const { name, title, company, address, phone, email, website, logo } = values;

  // Render the appropriate design based on the variant

  return (
    <div className="relative">
      <div className="business-card card-for-download bg-white w-[350px] h-[200px] flex flex-col p-2">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              <EditableText
                value={name}
                fieldId="name"
                className="block"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </h2>
            <p className="text-gray-600">
              <EditableText
                value={title}
                fieldId="title"
                className="block"
                onValueChange={onValueChange}
                isEditMode={isEditMode}
              />
            </p>
          </div>
          <div className="relative w-16 h-16">
            {logo && (
              <>
                <img
                  src={logo}
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
              value={company}
              fieldId="company"
              className="block"
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </p>
          <p>
            <EditableText
              value={address}
              fieldId="address"
              className="block"
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
          </p>
          <div className="flex flex-col mt-2">
            <EditableText
              value={phone}
              fieldId="phone"
              className="block"
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
            <EditableText
              value={email}
              fieldId="email"
              className="block"
              onValueChange={onValueChange}
              isEditMode={isEditMode}
            />
            <EditableText
              value={website}
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
};

export default StandardBusinessCard;
