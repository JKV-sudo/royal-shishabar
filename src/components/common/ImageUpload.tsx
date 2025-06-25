import React, { useState, useRef, useCallback } from "react";
import { ImageUploadService } from "../../services/imageUploadService";
import { toast } from "react-hot-toast";

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onError,
  className = "",
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        setIsUploading(true);
        setUploadProgress(0);

        const downloadURL = await ImageUploadService.uploadImage(
          file,
          "events",
          (progress) => setUploadProgress(progress)
        );

        setPreviewUrl(downloadURL);
        onChange(downloadURL);
        toast.success("Image uploaded successfully!");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to upload image";
        toast.error(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    },
    [onChange, onError]
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${isUploading ? "cursor-wait" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewUrl ? (
          // Image Preview
          <div className="relative">
            <img
              src={previewUrl}
              alt="Event preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                ×
              </button>
            )}
          </div>
        ) : (
          // Upload Area
          <div className="space-y-4">
            {isUploading ? (
              // Upload Progress
              <div className="space-y-3">
                <div className="w-12 h-12 mx-auto border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="text-sm text-gray-600">
                  Uploading... {Math.round(uploadProgress)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              // Upload Icon and Text
              <>
                <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">
                    Upload Event Image
                  </p>
                  <p className="text-sm text-gray-500">
                    Drag and drop an image here, or click to select
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports JPEG, PNG, WebP up to 5MB
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {previewUrl && (
        <div className="mt-3 text-center">
          <p className="text-sm text-gray-500">Image uploaded successfully</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
