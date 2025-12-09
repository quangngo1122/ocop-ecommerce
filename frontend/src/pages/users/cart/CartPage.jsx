import React, { useState, useEffect, useContext, useRef } from "react";
import CartFooter from "../../../components/carts/CartFooter.jsx";
import CartProduct from "../../../components/carts/CartProduct.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { gql, useQuery, useMutation } from "@apollo/client";
import { AuthContext } from "../../../contexts/AuthProvider.jsx";
import { CartContext } from "../../../contexts/CartProvider.jsx";
import { useToast } from "../../../contexts/ToastProvider.jsx";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

// ------------------ GRAPHQL ------------------
const GET_CART = gql`
  query MyShop {
    myCart {
      items {
        quantity
        VariantId
        product {
          name
          images
          price {
            min_price
            max_price
          }
        }
        _id
        attributes {
          value
          name
        }
        stock_quantity
      }
      shop {
        name
        _id
      }
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation Mutation($cartId: ID!) {
    removeFromCart(cartId: $cartId) {
      items {
        _id
      }
    }
  }
`;

const UPDATE_QUANTITY = gql`
  mutation Mutation($quantity: Int!, $cartId: ID!) {
    updateCartItem(quantity: $quantity, cartId: $cartId) {
      items {
        _id
      }
    }
  }
`;
// ------------------ END ------------------

export default function CartPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useContext(AuthContext);
  const { setCartCount, setLocalCart } = useContext(CartContext);
  const autoCheckRef = useRef(true);
  const [deletingItems, setDeletingItems] = useState({});
  const { data, refetch, loading } = useQuery(GET_CART, {
    fetchPolicy: "network-only",
    skip: !userData?.fullName,
  });

  const [mutationUpdateQuatity] = useMutation(UPDATE_QUANTITY);
  const [removeFromCart] = useMutation(REMOVE_FROM_CART);

  const [cartItems, setCartItems] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [quantities, setQuantities] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [itemsToRemove, setItemsToRemove] = useState([]);

  // ------------------ Load cart ------------------
  useEffect(() => {
    let itemsToProcess = [];
    const newItemsIds = location.state?.newItems || [];
    if (userData?.fullName) {
      // ===================== User có đăng nhập =====================
      if (data?.myCart) {
        data.myCart.forEach((shop) => {
          shop.items.forEach((item) => {
            itemsToProcess.push({
              ...item,
              isNew: newItemsIds.includes(item.VariantId),
              shopInfo: {
                _id: shop.shop._id,
                name: shop.shop.name,
              },
            });
          });
        });
      }
    } else {
      // ===================== Local cart =====================
      const saved = JSON.parse(localStorage.getItem("localCart") || "[]");
      saved.forEach((p) => {
        const selectedVariant = p.variants?.find((v) => v._id === p.VariantId);
        const shopId = p.shop_id?._id || "local-shop";
        const shopName = p.shop_id?.name || "Cửa hàng";
        itemsToProcess.push({
          ...p,
          isNew: newItemsIds.includes(p.VariantId),
          shopInfo: {
            _id: shopId,
            name: shopName,
          },
          quantity: p.quantity,
          product: {
            name: p.name,
            images: p.images?.length ? p.images : [""],
            price: {
              min_price:
                selectedVariant?.selling_price || p.price?.min_price || 0,
              max_price:
                selectedVariant?.selling_price || p.price?.max_price || 0,
            },
          },
          attributes: selectedVariant?.attributes || [],
        });
      });
    }

    if (!itemsToProcess.length) return;

    // ===================== Sắp xếp sản phẩm mới lên đầu =====================
    itemsToProcess.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));

    // ===================== Gom theo shop =====================
    const shopMap = {};
    itemsToProcess.forEach((item) => {
      const shopKey = item.shopInfo._id;
      if (!shopMap[shopKey]) {
        shopMap[shopKey] = {
          shop: item.shopInfo,
          items: [],
        };
      }
      shopMap[shopKey].items.push(item);
    });

    const shops = Object.values(shopMap);
    setCartItems(shops);

    // ===================== Init checked & quantities =====================
    const initChecked = {};
    const initQty = {};
    itemsToProcess.forEach((item) => {
      initChecked[item.VariantId] = item.isNew ? true : false;
      initQty[item.VariantId] = item.quantity || 1;
    });
    setCheckedItems(initChecked);
    setQuantities(initQty);
    setSelectAll(false);

    // ===================== Xóa state.newItems =====================
    autoCheckRef.current = false;
    navigate(location.pathname, { replace: true, state: {} });
  }, [data, userData]);

  // ------------------ Handlers ------------------
  const handleSelectAll = (checked) => {
    const updated = {};
    cartItems
      .flatMap((s) => s.items)
      .forEach((item) => {
        updated[item.VariantId] = checked;
      });
    setCheckedItems(updated);
    setSelectAll(checked);
  };

  const handleItemChange = (VariantId, checked) => {
    setCheckedItems((prev) => ({ ...prev, [VariantId]: checked }));
  };

  const handleShopChange = (shopProducts, checked) => {
    const updated = { ...checkedItems };
    shopProducts.forEach((p) => {
      updated[p.VariantId] = checked;
    });
    setCheckedItems(updated);
  };

  const handleQuantityChange = async (VariantId, value) => {
    // Lấy cart item hiện tại
    const cartItem = cartItems
      .flatMap((shop) => shop.items)
      .find((i) => i.VariantId === VariantId);
    if (!cartItem) return;

    // Giới hạn số lượng
    const maxQty = cartItem.stock_quantity || 9999;
    const newValue = Math.min(Math.max(value, 1), maxQty);

    // Cập nhật giao diện
    setQuantities((prev) => ({ ...prev, [VariantId]: newValue }));

    if (!userData?.fullName) {
      // Local cart
      let saved = JSON.parse(localStorage.getItem("localCart") || "[]");
      saved = saved.map((p) =>
        p.VariantId === VariantId ? { ...p, quantity: newValue } : p
      );
      localStorage.setItem("localCart", JSON.stringify(saved));
      return;
    }

    // User đăng nhập -> update server
    if (!cartItem._id) return;
    try {
      await mutationUpdateQuatity({
        variables: { cartId: cartItem._id, quantity: newValue },
      });
      refetch();
    } catch (err) {
      showToast("Cập nhật số lượng thất bại");
    }
  };

  const handleRemoveFromCart = (VariantId) => {
    setItemsToRemove([VariantId]);
    setOpenConfirm(true);
  };

  const handleRemoveSelected = () => {
    const selected = Object.entries(checkedItems)
      .filter(([_, v]) => v)
      .map(([id]) => id);
    if (!selected.length) return showToast("Chưa chọn sản phẩm nào");

    // đánh dấu loading cho tất cả
    const newDeleting = {};
    selected.forEach((id) => (newDeleting[id] = true));
    setDeletingItems((prev) => ({ ...prev, ...newDeleting }));

    setItemsToRemove(selected);
    setOpenConfirm(true);
  };

  const confirmRemove = async () => {
    setOpenConfirm(false);

    let remainingItems = [];

    if (!userData?.fullName) {
      // ----- Local Cart -----
      let saved = JSON.parse(localStorage.getItem("localCart") || "[]");

      // Lọc bỏ các sản phẩm cần xóa
      const updatedCart = saved.filter(
        (p) => !itemsToRemove.includes(p.VariantId)
      );

      // Lưu vào localStorage
      localStorage.setItem("localCart", JSON.stringify(updatedCart));
      setLocalCart(updatedCart);
      // ✅ Cập nhật cartItems để render
      setCartItems((prev) =>
        prev
          .map((shop) => ({
            ...shop,
            items: shop.items.filter(
              (i) => !itemsToRemove.includes(i.VariantId)
            ),
          }))
          .filter((shop) => shop.items.length > 0)
      );

      remainingItems = updatedCart;
    } else {
      // ----- Server Cart -----
      for (let VariantId of itemsToRemove) {
        const cartItem = cartItems
          .flatMap((s) => s.items)
          .find((i) => i.VariantId === VariantId);

        if (cartItem?._id) {
          await removeFromCart({ variables: { cartId: cartItem._id } });
        }
      }

      // ✅ Cập nhật cartItems để render
      setCartItems((prev) =>
        prev
          .map((shop) => ({
            ...shop,
            items: shop.items.filter(
              (i) => !itemsToRemove.includes(i.VariantId)
            ),
          }))
          .filter((shop) => shop.items.length > 0)
      );

      remainingItems = cartItems
        .flatMap((s) => s.items)
        .filter((i) => !itemsToRemove.includes(i.VariantId));
    }

    // ----- Reset deletingItems -----
    const resetDeleting = {};
    itemsToRemove.forEach((id) => (resetDeleting[id] = false));
    setDeletingItems((prev) => ({ ...prev, ...resetDeleting }));

    // ----- Reset checkedItems -----
    const updatedChecked = { ...checkedItems };
    itemsToRemove.forEach((id) => delete updatedChecked[id]);
    setCheckedItems(updatedChecked);

    // ----- Cập nhật số sản phẩm còn lại -----
    setCartCount(remainingItems.length);

    showToast("Xóa sản phẩm thành công");
  };

  const totalSelectedPrice = () =>
    cartItems
      .flatMap((s) => s.items)
      .reduce((sum, product) => {
        if (checkedItems[product.VariantId]) {
          const price = product?.product?.price?.min_price || 0;
          const quantity = quantities[product.VariantId] || 1;
          return sum + price * quantity;
        }
        return sum;
      }, 0);

  const selectedCount = Object.values(checkedItems).filter(Boolean).length;

  const handleBuyNow = async () => {
    if (!userData?.fullName) {
      showToast("Vui lòng đăng nhập để thanh toán");
      navigate("/login");
      return;
    }

    try {
      // refetch trả về dữ liệu mới
      const { data: freshData } = await refetch();

      // map lại cartItems từ freshData
      const itemsToProcess = [];
      freshData.myCart.forEach((shop) => {
        shop.items.forEach((item) => {
          itemsToProcess.push({
            ...item,
            shop: shop.shop,
          });
        });
      });

      const selectedItems = itemsToProcess
        .filter((item) => checkedItems[item.VariantId])
        .map((item) => ({
          ...item,
          quantity: quantities[item.VariantId] || item.quantity,
        }));

      if (!selectedItems.length) return showToast("Vui lòng chọn sản phẩm");

      navigate("/checkout", { state: { selectedItems } });
    } catch (err) {
      showToast("Lấy giỏ hàng thất bại");
    }
  };

  // ------------------ Auto-check new items ------------------
  useEffect(() => {
    if (
      data?.myCart &&
      location.state?.newItems?.length > 0 &&
      autoCheckRef.current
    ) {
      const initChecked = { ...checkedItems };
      data.myCart.forEach((shop) => {
        shop.items.forEach((item) => {
          if (location.state.newItems.includes(item.VariantId))
            initChecked[item.VariantId] = true;
        });
      });
      setCheckedItems(initChecked);
      autoCheckRef.current = false;
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [data, location.state?.newItems]);

  // ------------------ Update selectAll ------------------
  useEffect(() => {
    const allChecked =
      cartItems.flatMap((s) => s.items).length > 0 &&
      cartItems.flatMap((s) => s.items).every((i) => checkedItems[i.VariantId]);
    setSelectAll(allChecked);
  }, [checkedItems, cartItems]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-[400px]">
        <CircularProgress size={50} />
      </div>
    );

  const hasProducts = cartItems.some((shop) => shop.items.length > 0);

  return (
    <div className={`${hasProducts ? "min-h-screen" : "h-auto"} flex flex-col`}>
      {hasProducts && (
        <div className="w-300 h-auto bg-white ml-40 mt-10">
          <div className="flex justify-between p-6 text-[14px]">
            <label>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="mr-2 cursor-pointer"
              />
              Sản phẩm
            </label>
            <div className="flex gap-30">
              <div>Phân loại</div>
              <div>Đơn giá</div>
              <div>Số lượng</div>
              <div>Số tiền</div>
              <div>Thao tác</div>
            </div>
          </div>
        </div>
      )}

      <div
        className={
          hasProducts ? "flex-1 pb-24" : "py-20 text-center text-gray-500"
        }
      >
        {hasProducts ? (
          cartItems.map(
            (shopCart, idx) =>
              shopCart.items.length > 0 && (
                <CartProduct
                  key={idx}
                  shop={shopCart.shop?.name}
                  products={shopCart.items}
                  checkedItems={checkedItems}
                  onItemChange={handleItemChange}
                  onShopChange={handleShopChange}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveFromCart}
                  deletingItems={deletingItems} // <- thêm prop này
                />
              )
          )
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p>Không có sản phẩm</p>
            <button
              onClick={() => navigate("/products")}
              className="px-6 py-2 cursor-pointer bg-[#5aa32a] text-white rounded-full hover:bg-[#4a8922] transition"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>

      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa {itemsToRemove.length} sản phẩm này khỏi
            giỏ hàng?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)} color="inherit">
            Hủy
          </Button>
          <Button onClick={confirmRemove} color="error">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {hasProducts && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-md">
          <CartFooter
            selectAll={selectAll}
            handleSelectAll={handleSelectAll}
            totalSelectedPrice={totalSelectedPrice()}
            selectedCount={selectedCount}
            handleBuyNow={handleBuyNow}
            handleRemoveSelected={handleRemoveSelected}
          />
        </div>
      )}
    </div>
  );
}
