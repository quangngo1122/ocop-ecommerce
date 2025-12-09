import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import ColAllPageSeller from "../../components/seller/ColAllPageSeller";
import { useToast } from "../../contexts/ToastProvider";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

// -----------------------GRAPQL-----------------------

const GET_CATEGORIES = gql`
  query Categories($filter: CategoryFilter) {
    categories(filter: $filter) {
      items {
        _id
        name
        parent {
          _id
          name
        }
        status
        createdAt
        updatedAt
        slug
      }
      total
      hasMore
    }
  }
`;
// backup-----------------

// query Categories($pagination: PaginationInput, $filter: CategoryFilter) {
//     categories(pagination: $pagination, filter: $filter) {
//       items {
//         id
//         name
//         parent {
//           id
//           name
//         }
//         status
//         createdAt
//         updatedAt
//         slug
//       }
//       total
//       hasMore
//     }
//   }

// backup-----------------

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      name
    }
  }
`;

const GET_PRODUCTS = gql`
  query Products {
    products {
      items {
        category_id {
          _id
        }
      }
    }
  }
`;

const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(_id: $id, input: $input) {
      name
    }
  }
`;
const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(_id: $id) {
      name
    }
  }
`;

// ----------------------------------------------------

function formatDate(dateVal) {
  if (!dateVal) return "";
  // Nếu là chuỗi số, chuyển sang số
  const d = new Date(Number(dateVal));
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}

// Hàm sinh slug từ tên
function toSlug(str) {
  return str
    .replace(/Đ/g, "D") // sau khi test thấy Đ bị loại bỏ luôn nên thêm đó đa
    .replace(/đ/g, "d")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sortCategoriesFlat(categories) {
  const map = {};
  categories.forEach((cat) => {
    map[cat._id] = { ...cat, children: [] };
  });

  categories.forEach((cat) => {
    if (cat.parent && map[cat.parent._id]) {
      map[cat.parent._id].children.push(map[cat._id]);
    }
  });

  const result = [];
  function flatten(cat, level = 0) {
    result.push({ ...cat, _level: level });
    cat.children.forEach((child) => flatten(child, level + 1));
  }

  categories.forEach((cat) => {
    if (!cat.parent || !map[cat.parent._id]) {
      flatten(map[cat._id], 0);
    }
  });

  return result;
}

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  // const limit = 8;
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchId, setSearchId] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const { showToast } = useToast();

  const [usedCategoryIds, setUsedCategoryIds] = useState(new Set());
  // const [showSuggestions, setShowSuggestions] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    status: "active",
  });

  // State cho form tạo mới
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    status: "active",
  });

  const {
    data: categoryData,
    loading: categoryLoading,
    refetch: refetchCategories,
  } = useQuery(GET_CATEGORIES, {
    variables: {
      pagination: { itemsPerPage, offset: (page - 1) * itemsPerPage },
      filter: { name: search || undefined, id: searchId || undefined },
    },
    fetchPolicy: "network-only",
  });

  const { data: productData, loading: productLoading } = useQuery(
    GET_PRODUCTS,
    {
      fetchPolicy: "network-only",
    }
  );

  const [createCategory, { loading: creating }] = useMutation(CREATE_CATEGORY);
  const [updateCategory, { loading: updating }] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory, { loading: deleting }] = useMutation(DELETE_CATEGORY);

  const categories = useMemo(() => {
    return (categoryData?.categories?.items || []).filter((cat) =>
      statusFilter ? cat.status === statusFilter : true
    );
  }, [categoryData, statusFilter]);
  const total = categories.length;

  const totalCategories = categories.length;
  const totalPages = Math.ceil(totalCategories / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage + 1;
  const endIndex = Math.min(page * itemsPerPage, totalCategories);

  useEffect(() => {
    if (productData?.products?.items) {
      const ids = new Set(
        productData.products.items.map((item) => item.category_id._id)
      );
      setUsedCategoryIds(ids);
    }
  }, [productData]);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [totalPages, page, itemsPerPage]);

  // Lấy danh sách danh mục cha (không phải chính nó, không phải con của nó)
  const parentOptions = categories.filter(
    (cat) => !cat.parent && cat._id !== editingId
  );
  const hasChild = (catId) =>
    categories.some((cat) => cat.parent && cat.parent._id === catId);

  const isDeletable = (catId) =>
    !usedCategoryIds.has(catId) && !hasChild(catId);

  //----------------------------------
  const hasProductInTree = (catId) => {
    if (usedCategoryIds.has(catId)) return true;
    const children = categories.filter((cat) => cat.parent?._id === catId);
    return children.some((child) => hasProductInTree(child._id));
  };
  //----------------------------------

  const handleEdit = (cat) => {
    setEditingId(cat._id);
    setEditForm({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parent?._id || "",
      status: cat.status,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({
      name: "",
      slug: "",
      parentId: "",
      status: "active",
    });
  };

  // Lưu cập nhật

  const handleSaveEdit = async () => {
    try {
      const currentCat = categories.find((cat) => cat._id === editingId);
      const oldStatus = currentCat.status;
      // Kiểm tra nếu cố set sang inactive khi có sản phẩm trong cây danh mục
      if (
        editForm.status !== oldStatus &&
        editForm.status === "inactive" &&
        hasProductInTree(editingId)
      ) {
        showToast(
          "Không thể ngừng danh mục chứa sản phẩm hoặc danh mục con chứa sản phẩm!",
          "warning"
        );
        return;
      }
      await updateCategory({
        variables: {
          id: editingId,
          input: {
            name: editForm.name,
            slug: editForm.slug,
            parentId: editForm.parentId ? String(editForm.parentId) : null,
            status: editForm.status,
          },
        },
      });
      // Chỉ set con inactive nếu cha set sang inactive và đã qua check (không có sản phẩm trong cây danh mục)
      if (editForm.status === "inactive" && editForm.status !== oldStatus) {
        const childCategories = categories.filter(
          (cat) => cat.parent && cat.parent._id === editingId
        );
        for (const child of childCategories) {
          await updateCategory({
            variables: {
              id: child._id,
              input: { status: "inactive" },
            },
          });
        }
      }
      setEditingId(null);
      refetchCategories();
      showToast("Cập nhật danh mục thành công!", "success");
    } catch (error) {
      showToast(`Cập nhật danh mục thất bại: ${error.message}`, "error");
    }
  };

  // Tạo mới danh mục
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast("Tên danh mục không được để trống!", "error");
      return;
    }

    // Kiểm tra tên trùng với danh mục cùng cấp ------------------------

    const isParent = !createForm.parentId;
    const sameLevelCategories = categories.filter(
      (cat) =>
        (isParent && !cat.parent) ||
        (cat.parent?._id === createForm.parentId && !isParent)
    );

    const isDuplicateName = sameLevelCategories.some(
      (cat) => cat.name.toLowerCase() === createForm.name.trim().toLowerCase()
    );

    if (isDuplicateName) {
      showToast(`Tên danh mục "${createForm.name}" đã tồn tại!`, "warning");
      return;
    }

    //---------------------------------

    // return;
    await createCategory({
      variables: {
        input: {
          name: createForm.name,
          slug: createForm.slug || toSlug(createForm.name),
          parentId: createForm.parentId || null,
          status: createForm.status,
        },
      },
    });
    setCreateForm({
      name: "",
      slug: "",
      parentId: "",
      status: "active",
    });
    // refetch();
    refetchCategories();
    showToast("Tạo danh mục thành công!", "success");
  };

  // Khi nhập tên thì tự động sinh slug nếu chưa sửa slug thủ công
  // Khi nhập tên thì slug tự động sinh lại từ tên (dù đã có slug trước đó)
  const handleCreateNameChange = (e) => {
    const name = e.target.value;
    setCreateForm((f) => ({
      ...f,
      name,
      slug: toSlug(name),
    }));
  };

  // Khi sửa tên trong form sửa, cũng tự động cập nhật slug
  const handleEditNameChange = (e) => {
    const name = e.target.value;
    setEditForm((f) => ({
      ...f,
      name,
      slug: toSlug(name),
    }));
  };

  const handleDeleteCategory = async (id) => {
    const isParent = categories.some((cat) => cat._id === id && !cat.parent);
    if (isParent && hasChild(id)) {
      // alert("Không thể xóa danh mục cha khi tồn tại danh mục con!");
      showToast(
        "Không thể xóa danh mục cha khi còn tồn tại danh mục con!",
        "warning"
      );
      return;
    }
    if (usedCategoryIds.has(id)) {
      // alert("Không thể xóa danh mục đang tồn tại sản phẩm!");
      showToast("Không thể xóa danh mục có sản phẩm sử dụng!", "warning");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      await deleteCategory({ variables: { id: id } });
      showToast("Xóa danh mục thành công!", "success");
      refetchCategories();
    }
  };

  const handleItemsPerPageChange = (e) => {
    const value =
      e.target.value === "all" ? totalCategories : Number(e.target.value);
    setItemsPerPage(value);
    setPage(1);
  };

  const sortedCategories = sortCategoriesFlat(categories);
  const paginatedCategories = sortedCategories.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="relative ">
      {productLoading && (
        <div className="absolute w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
          </div>
        </div>
      )}
      <div className="p-6  bg-gray-100">
        <div className="flex items-center gap-2 mb-6">
          <span className="w-1 h-6 bg-orange-300 rounded-sm inline-block" />
          <h1 className="text-2xl font-bold ">Danh Mục Sản Phẩm</h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Thêm Danh Mục Mới
          </h2>
          <form
            onSubmit={handleCreateCategory}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Tên danh mục
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tên danh mục"
                value={createForm.name}
                onChange={handleCreateNameChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Slug
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Slug"
                value={createForm.slug}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, slug: toSlug(e.target.value) }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Danh mục cha
              </label>
              <select
                className="cursor-pointer hover:border-blue-400  w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.parentId}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, parentId: e.target.value }))
                }
              >
                <option value="">-- Không có --</option>
                {categories
                  .filter((cat) => !cat.parent)
                  .map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Trạng thái
              </label>
              <select
                className="cursor-pointer hover:border-blue-400 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={createForm.status}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="active">Hoạt động</option>
                <option value="inactive">Ngừng</option>
              </select>
            </div>
            <button
              type="submit"
              className="cursor-pointer  col-span-1 md:col-span-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
              disabled={creating}
            >
              Thêm danh mục
            </button>
          </form>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* <div className="mb-4 justify-end flex flex-wrap gap-2"> */}
          <div className="flex-1">
            <input
              type="text"
              className="w-full border border-gray-400 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              // className="border border-gray-400 rounded px-3 py-1 w-64"
              placeholder="Tìm theo tên danh mục..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchId("");
                setPage(1);
              }}
              list="category-names"
            />
            <datalist id="category-names">
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name} />
              ))}
            </datalist>
          </div>

          {/* --------------------------- */}
          <div className="flex-1">
            <select
              className="w-full hover:border-blue-400 cursor-pointer border border-gray-400 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              // className=" cursor-pointer border border-gray-400 rounded px-3 py-1 w-64"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">-- Tất cả trạng thái --</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Ngừng</option>
            </select>

            {/* --------------------------- */}
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span>Số danh mục mỗi trang:</span>
            <select
              value={itemsPerPage === totalCategories ? "all" : itemsPerPage}
              onChange={handleItemsPerPageChange}
              className=" cursor-pointer border px-2 py-1 rounded border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              {/* <option value={8}>8</option> */}
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              {/* <option value={100}>100</option>
              <option value="all">Tất cả</option> */}
            </select>
          </div>
        </div>

        <div className="bg-white overflow-x-auto rounded shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <ColAllPageSeller type="category" />
            <tbody className="bg-white divide-y divide-gray-200">
              {/* {loading ? ( */}
              {categoryLoading || productLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    Không có danh mục nào.
                  </td>
                </tr>
              ) : (
                // categories.map((cat) => (
                // sortedCategories.map((cat) => (

                // backup ------------------

                // sortedCategories.map((cat, idx) => (

                // backup ------------------

                paginatedCategories.map((cat, idx) => (
                  <tr key={cat._id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 border border-gray-200 text-center">
                      {(page - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-3 py-3 border border-gray-200">
                      {editingId === cat._id ? (
                        <input
                          className="border border-gray-200 px-2 py-1 rounded w-full"
                          value={editForm.name}
                          onChange={handleEditNameChange}
                          disabled={updating}
                        />
                      ) : (
                        <>
                          <div>
                            {/* {cat.parent ? ( */}
                            {cat._level > 0 ? (
                              <div className="flex flex-row">
                                <span className="text-blue-600 font-bold mr-2 whitespace-nowrap">
                                  {/* ---{" "} */}
                                  {"--- ".repeat(cat._level)}
                                </span>
                                <span className="line-clamp-2 break-words">
                                  {cat.name}
                                </span>
                              </div>
                            ) : (
                              // ) : null}
                              <span
                                title={cat.name}
                                className="font-bold line-clamp-2 break-words"
                              >
                                {cat.name}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                    <td className="px-3 py-3 border border-gray-200">
                      {editingId === cat._id ? (
                        <input
                          className="border border-gray-200 px-2 py-1 rounded w-full"
                          value={editForm.slug}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              slug: toSlug(e.target.value),
                            }))
                          }
                          disabled={updating}
                        />
                      ) : (
                        // cat.slug
                        <span
                          className="line-clamp-2 break-words"
                          title={cat.slug}
                        >
                          {cat.slug}
                        </span>
                      )}
                    </td>

                    <td className="px-3  text-center py-3 border border-gray-200">
                      {editingId === cat._id ? (
                        <select
                          // có danh mục con thì ko chọn thêm danh mục cha đc nữa
                          className={` cursor-pointer border border-gray-200 px-2 py-1 rounded w-full ${
                            hasChild(cat._id)
                              ? "cursor-not-allowed opacity-50"
                              : "hover:border-blue-400"
                          }`}
                          value={editForm.parentId}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              parentId: e.target.value,
                            }))
                          }
                          disabled={updating || hasChild(cat._id)}
                          title={
                            hasChild(cat._id)
                              ? "Đang là danh mục cấp cao nhất"
                              : ""
                          }
                        >
                          <option value="">-- Không có --</option>
                          {parentOptions.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      ) : cat.parent ? (
                        <span
                          title={cat.parent.name}
                          className="bg-amber-100 text-gray-700 px-2 py-1 rounded line-clamp-2 break-words "
                        >
                          {cat.parent.name}
                        </span>
                      ) : (
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 break-all min-w-[100px] rounded whitespace-nowrap">
                          Không có
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-3 border border-gray-200 text-center">
                      {formatDate(cat.createdAt)}
                    </td>
                    <td className="px-3 py-3 border border-gray-200 text-center">
                      {formatDate(cat.updatedAt)}
                    </td>
                    <td className="px-3 py-3 border border-gray-200 text-center">
                      {editingId === cat._id ? (
                        <select
                          className="hover:border-blue-400 cursor-pointer border border-gray-200 px-2 py-1 rounded"
                          value={editForm.status}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              status: e.target.value,
                            }))
                          }
                          disabled={updating}
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Ngừng</option>
                        </select>
                      ) : (
                        <span
                          className={
                            cat.status === "active"
                              ? "bg-green-100 text-green-800 px-2 py-1 rounded whitespace-nowrap"
                              : "bg-red-100 text-red-600 px-2 py-1 rounded whitespace-nowrap"
                          }
                        >
                          {cat.status === "active" ? "Hoạt động" : "Ngừng"}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 border border-gray-200 text-center">
                      {editingId === cat._id ? (
                        <>
                          <button
                            className="bg-green-500 cursor-pointer  text-white px-2 py-1 rounded mr-2"
                            onClick={handleSaveEdit}
                            disabled={updating}
                          >
                            Lưu
                          </button>
                          <button
                            className="bg-gray-300 cursor-pointer  text-gray-700 px-2 py-1 rounded"
                            onClick={handleCancelEdit}
                            disabled={updating}
                          >
                            Hủy
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className=" cursor-pointer text-blue-600 hover:text-blue-900 mr-2"
                            onClick={() => handleEdit(cat)}
                          >
                            <DriveFileRenameOutlineIcon />
                          </button>
                          <button
                            className={`text-red-600 hover:text-red-900 ${
                              !isDeletable(cat._id)
                                ? "opacity-50 cursor-not-allowed"
                                : " cursor-pointer "
                            }`}
                            onClick={() => handleDeleteCategory(cat._id)}
                            title={
                              hasChild(cat._id)
                                ? "Không thể xóa danh mục cha khi còn danh mục con!"
                                : usedCategoryIds.has(cat._id)
                                ? "Không thể xóa danh mục đang tồn tại sản phẩm!"
                                : ""
                            }
                            // disabled={!isDeletable(cat.id) || deleting}
                          >
                            {/* <DeleteIcon /> */}
                            {!isDeletable(cat._id) ? (
                              <DeleteOutlineIcon />
                            ) : (
                              <DeleteIcon />
                            )}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
              {(updating || deleting || creating) && (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm p-6 flex justify-center items-center h-screen z-50">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-white text-lg">
                          Đang cập nhật...
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex justify-between items-center p-4">
            {/* <div>
            Trang {page} / {totalPages}
          </div> */}
            <div className="text-sm text-gray-700">
              Trang {page} / {totalPages}. Danh mục từ {startIndex} đến{" "}
              {endIndex} trong tổng cộng {total} danh mục
            </div>
            {/* {totalPages > 1 && ( */}
            {totalPages > 1 && itemsPerPage !== totalCategories && (
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 whitespace-nowrap rounded ${
                    page === 1
                      ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                      : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Trang trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      key={number}
                      onClick={() => setPage(number)}
                      className={`px-3 py-1 rounded ${
                        page === number
                          ? "bg-blue-500 text-white"
                          : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {number}
                    </button>
                  )
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-3 whitespace-nowrap py-1 rounded ${
                    page === totalPages
                      ? "bg-gray-100 text-gray-600 cursor-not-allowed"
                      : "bg-white cursor-pointer text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
