import React from "react";

const FormInput = ({
  label,
  id,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  isTextarea = false,
}) => (
  <div className="grid grid-cols-3 items-center border-b border-gray-200 py-3 mb-0">
    <label
      htmlFor={id}
      className="text-sm font-medium text-gray-700 col-span-1"
    >
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <div className="col-span-2">
      {isTextarea ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      ) : (
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      )}
    </div>
  </div>
);

export default FormInput;
