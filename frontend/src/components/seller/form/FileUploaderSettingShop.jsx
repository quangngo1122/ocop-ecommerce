import React from "react";

const FileUploader = ({
  label,
  id,
  name,
  fileRef,
  onFileChange,
  onChooseFileClick,
  fileName,
  preview,
  existingImage,
  required = false,
}) => (
  <div className="grid grid-cols-3 items-center border-b border-gray-200 py-3 mb-0">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-700 col-span-1"
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="col-span-2 flex items-center">
      <div>
        <input
          type="file"
          id={id}
          name={name}
          ref={fileRef}
          onChange={onFileChange}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={onChooseFileClick}
          className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Chọn tệp
        </button>
        <span className="ml-3 text-sm text-gray-500">{fileName}</span>
        {preview ? (
          <img
            src={preview}
            alt={`${label} preview`}
            className="h-32 rounded border border-gray-200 shadow mt-1"
          />
        ) : existingImage ? (
          <img
            src={existingImage}
            alt={`${label} hiện tại`}
            className="h-32 rounded border border-gray-200 shadow mt-1"
          />
        ) : null}
      </div>
    </div>
  </div>
);

export default FileUploader;
