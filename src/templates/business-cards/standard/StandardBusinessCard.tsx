import React from 'react';
import EditableText from '../../../components/editor/EditableText';
import ImageUploadOverlay from '../../../components/editor/ImageUploadOverlay';
import { TemplateComponentProps } from '../../_core/types';
import './styles.css';

/**
 * Standard Business Card template component
 * Supports multiple design variants: standard, modern, minimal
 */
const StandardBusinessCard: React.FC<TemplateComponentProps> = ({
  values,
  onValueChange,
  isEditMode,
  variant = 'standard',
}) => {
  // Get the business card values
  const {
    name,
    title,
    company,
    address,
    phone,
    email,
    website,
    logo,
  } = values;

  // Render the appropriate design based on the variant
  switch (variant) {
    case 'modern':
      return (
        <div className="relative">
          <div className="business-card card-for-download modern-variant bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md w-[350px] h-[200px] flex flex-col p-2">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-white">
                  <EditableText
                    value={name}
                    fieldId="name"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </h2>
                <p className="text-indigo-100">
                  <EditableText
                    value={title}
                    fieldId="title"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </p>
              </div>
              <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {logo && (
                  <>
                    <img
                      src={logo}
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
                  className="block text-indigo-100"
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

    case 'minimal':
      return (
        <div className="relative">
          <div className="business-card card-for-download minimal-variant bg-white rounded-lg shadow-md w-[350px] h-[200px] flex flex-col p-2 border-l-4 border-gray-800">
            <div>
              <h2 className="text-2xl font-light text-gray-800 mb-1">
                <EditableText
                  value={name}
                  fieldId="name"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </h2>
              <p className="text-gray-500 text-sm mb-3">
                <EditableText
                  value={title}
                  fieldId="title"
                  className="block"
                  onValueChange={onValueChange}
                  isEditMode={isEditMode}
                />
              </p>
              <p className="font-medium text-gray-800 text-sm">
                <EditableText
                  value={company}
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
                    value={phone}
                    fieldId="phone"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
                <div>
                  <EditableText
                    value={email}
                    fieldId="email"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
                <div>
                  <EditableText
                    value={website}
                    fieldId="website"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
                <div>
                  <EditableText
                    value={address}
                    fieldId="address"
                    className="block"
                    onValueChange={onValueChange}
                    isEditMode={isEditMode}
                  />
                </div>
              </div>

              <div className="relative w-16 h-16">
                {logo && (
                  <>
                    <img
                      src={logo}
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
          <div className="business-card card-for-download standard-variant bg-white rounded-lg shadow-md w-[350px] h-[200px] flex flex-col p-2 border border-gray-200">
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
  }
};

export default StandardBusinessCard;