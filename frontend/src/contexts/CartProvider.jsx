import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useMutation, useQuery, gql } from "@apollo/client";
import { useToast } from "./ToastProvider";
import { AuthContext } from "./AuthProvider";

export const CartContext = createContext();

// ------------------------GRAPHQL------------------------
const GET_CART = gql`
  query MyCart {
    myCart {
      items {
        _id
        VariantId
        quantity
        product {
          name
          images
          price {
            min_price
            max_price
          }
        }
        attributes {
          name
          value
        }
      }
      shop {
        name
        _id
      }
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($input: CartInput!) {
    addToCart(input: $input) {
      items {
        _id
        VariantId
        quantity
      }
    }
  }
`;

// ------------------------END------------------------

export function CartProvider({ children }) {
  const { userData } = useContext(AuthContext);
  const { showToast } = useToast();

  const [localCart, setLocalCart] = useState(() => {
    const saved = localStorage.getItem("localCart");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState();

  // ---------------- GraphQL ----------------
  const { data, refetch } = useQuery(GET_CART, {
    fetchPolicy: "network-only",
    skip: !userData,
  });

  const [addCart] = useMutation(ADD_TO_CART);

  // ---------------- Effect: localStorage ----------------
  useEffect(() => {
    localStorage.setItem("localCart", JSON.stringify(localCart));
  }, [localCart]);

  // ---------------- Effect: update from server ----------------
  useEffect(() => {
    if (userData && data?.myCart?.length > 0) {
      const allItems = data.myCart.flatMap((cart) => cart.items);
      setCartItems(allItems);

      // ✅ số sản phẩm khác nhau (mỗi VariantId = 1)
      setCartCount(allItems.length);
    }
  }, [data, userData]);

  // ---------------- Effect: update from local ----------------
  useEffect(() => {
    if (!userData) {
      setCartItems(localCart);
      // ✅ số sản phẩm khác nhau
      setCartCount(localCart.length);
    }
  }, [localCart, userData]);

  // ---------------- Handle Add ----------------
  const handleAddToCart = async (product, e) => {
    if (e?.stopPropagation) e.stopPropagation();
    const variantId = product?.variantId || product?.VariantId;
    if (!variantId)
      return showToast("Sản phẩm không có Variant hợp lệ", "error");

    const qtyToAdd = product?.quantity || 1;

    if (!userData) {
      // ----- Local cart -----
      setLocalCart((prev) => {
        let newCart;
        const exist = prev.find((i) => i.VariantId === variantId);
        if (exist) {
          // Gộp quantity nếu trùng VariantId
          newCart = prev.map((i) =>
            i.VariantId === variantId
              ? { ...i, quantity: i.quantity + qtyToAdd }
              : i
          );
        } else {
          newCart = [
            ...prev,
            { ...product, VariantId: variantId, quantity: qtyToAdd },
          ];
        }

        localStorage.setItem("localCart", JSON.stringify(newCart));
        setCartItems(newCart);
        setCartCount(newCart.reduce((sum, i) => sum + (i.quantity || 0), 0));

        return newCart;
      });

      return showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
    }

    // ----- Server cart -----
    try {
      const exist = cartItems.find((i) => i.VariantId === variantId);
      const newQty = exist ? (exist.quantity || 0) + qtyToAdd : qtyToAdd;

      const res = await addCart({
        variables: {
          input: { VariantId: variantId, quantity: newQty },
        },
      });
      const items = res.data?.addToCart?.items || [];

      setCartItems(items);
      setCartCount(items.reduce((sum, i) => sum + (i.quantity || 0), 0));
      showToast("Đã thêm sản phẩm vào giỏ hàng", "success");
      await refetch();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Lỗi khi thêm sản phẩm", "error");
    }
  };

  // ---------------- Handle Remove ----------------
  // const handleRemoveFromCart = async (cartId, variantId) => {
  //   try {
  //     if (userData && cartId) {
  //       await removeCart({ variables: { cartId } });
  //       await refetch();
  //     } else {
  //       setLocalCart((prev) => prev.filter((i) => i.VariantId !== variantId));
  //     }
  //     showToast("Xóa sản phẩm thành công", "success");
  //   } catch (err) {
  //     console.error(err);
  //     showToast("Xóa sản phẩm thất bại", "error");
  //   }
  // };

  // ---------------- Sync localCart -> server khi login ----------------
  useEffect(() => {
    const syncLocal = async () => {
      if (userData && localCart.length > 0) {
        for (const item of localCart) {
          await addCart({
            variables: {
              input: { VariantId: item.VariantId, quantity: item.quantity },
            },
          });
        }
        setLocalCart([]);
        localStorage.removeItem("localCart");
        await refetch();
      }
    };
    syncLocal();
  }, [userData]);

  return (
    <CartContext.Provider
      value={{
        handleAddToCart,
        localCart,
        setLocalCart,
        cartItems,
        cartCount,
        setCartCount,
        refetch,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
