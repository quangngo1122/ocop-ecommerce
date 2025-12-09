// CategorySidebar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
}) {
  const navigate = useNavigate();
  const [openCategories, setOpenCategories] = useState({});

  if (!categories?.items) return null;

  const handleParentClick = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category._id]: !prev[category._id],
    }));

    if (!category.children || category.children.length === 0) {
      onSelectCategory(category._id);
    }
  };

  const handleChildClick = (child) => {
    onSelectCategory(child._id);
  };

  return (
    <div className="w-64 border border-gray-200 rounded p-3 bg-white max-h-[80vh] overflow-y-auto">
      <h3 className="font-bold text-lg mb-3">Danh mục sản phẩm</h3>
      <ul>
        {categories.items.map((category) => {
          const isOpen = openCategories[category._id] || false;
          const isSelected = selectedCategory === category._id;

          return (
            <li key={category._id} className="mb-1">
              {/* Parent */}
              <div
                onClick={() => handleParentClick(category)}
                className={`flex justify-between items-center px-3 py-2 rounded cursor-pointer font-medium ${
                  isSelected
                    ? "bg-[#5aa32a] text-white"
                    : "hover:bg-[#5aa32a] hover:text-white"
                }`}
              >
                <span>{category.name}</span>
                {category.children && category.children.length > 0 && (
                  <svg
                    className={`w-4 h-4 flex-shrink-0 transform transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                )}
              </div>

              {/* Children */}
              {isOpen && category.children && category.children.length > 0 && (
                <ul className="ml-4 mt-1 border-l border-gray-200">
                  {category.children.map((child) => {
                    const isChildSelected = selectedCategory === child._id;
                    return (
                      <li
                        key={child._id}
                        onClick={() => handleChildClick(child)}
                        className={`px-3 py-1 rounded cursor-pointer text-sm ${
                          isChildSelected
                            ? "bg-[#5aa32a] text-white"
                            : "hover:bg-[#5aa32a] hover:text-white"
                        }`}
                      >
                        {child.name}
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
