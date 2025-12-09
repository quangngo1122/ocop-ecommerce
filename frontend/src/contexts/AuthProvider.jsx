import React, { createContext, useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { useMutation, useQuery, gql } from "@apollo/client";

// -----------------------------GQL-----------------------------
const VERIFY_USER_ID = gql`
  query User($firebaseUid: String!) {
    userByFirebaseUid(firebaseUid: $firebaseUid) {
      _id
      fullName
      email
      avatar
      address {
        district
        isDefault
        ward
        name
        phone
        province
        ward_code
        province_id
        address
        district_id
        _id
      }
      role
      isActive
      provider
      gender
      dateOfBirth
    }
  }
`;

const REGISTER_USER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        _id
      }
    }
  }
`;

const GET_SHOP_BY_USER_ID = gql`
  query Query {
    myShop {
      _id
      name
      description
      logo
      coverImage
      status
    }
  }
`;

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
      }
      shop {
        name
      }
    }
  }
`;

// -----------------------------Component-----------------------------
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // firebase user
  const [userData, setUserData] = useState(() => {
    // load từ localStorage khi init
    const storedUser = localStorage.getItem("userData");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [shopData, setShopData] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const auth = getAuth();
  const [register] = useMutation(REGISTER_USER);

  const { data: shopQueryData } = useQuery(GET_SHOP_BY_USER_ID, {
    skip: !userData?._id,
    fetchPolicy: "network-only",
  });

  const {
    data: verifyData,
    refetch: refetchUser,
    loading: loadingVerify,
  } = useQuery(VERIFY_USER_ID, {
    variables: { firebaseUid: user?.uid || "" },
    skip: !user?.uid,
    fetchPolicy: "network-only",
  });

  const { data: cartData, refetch: refetchCart } = useQuery(GET_CART, {
    skip: !userData?.fullName,
    fetchPolicy: "network-only",
  });

  // Listen Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (firebaseUser) => {
      if (firebaseUser?.uid) {
        const token = await firebaseUser.getIdToken(true);
        localStorage.setItem("accessToken", token); // giữ token trong localStorage
        setUser(firebaseUser);
      } else {
        setUser(null);
        setUserData(null);
        setShopData(null);
        setTotalItems(0);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
      }
    });
    return () => unsubscribe();
  }, []);

  // Khi query VERIFY_USER_ID load xong
  useEffect(() => {
    if (!loadingVerify && verifyData?.userByFirebaseUid) {
      const basicUser = {
        fullName: verifyData.userByFirebaseUid.fullName,
        email: verifyData.userByFirebaseUid.email,
        avatar: verifyData.userByFirebaseUid.avatar,
        role: verifyData.userByFirebaseUid.role,
      };

      setUserData(verifyData.userByFirebaseUid);
      localStorage.setItem("userData", JSON.stringify(basicUser));
    }
    setLoadingAuth(false);
  }, [verifyData, loadingVerify]);

  // Tự động register nếu user mới
  useEffect(() => {
    if (!user?.uid || loadingVerify || userData?.fullName) return;
    register({ variables: { input: { firebaseUid: user.uid } } })
      .then(() => refetchUser())
      .catch(console.error);
  }, [user?.uid, userData?.fullName, loadingVerify, refetchUser, register]);

  // Lấy shop data
  useEffect(() => {
    if (shopQueryData?.myShop) {
      setShopData(shopQueryData.myShop);
    }
  }, [shopQueryData]);

  // Tính tổng sản phẩm trong cart
  useEffect(() => {
    if (cartData?.myCart) {
      const total = cartData?.myCart?.reduce((sumShop, shop) => {
        const shopTotal = shop.items.reduce(
          (sumItem, item) => sumItem + (item.quantity || 0),
          0
        );
        return sumShop + shopTotal;
      }, 0);
      setTotalItems(total);
    }
  }, [cartData]);
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        userData,
        shopData,
        refetch: refetchUser,
        refetchCart,
        totalItems,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
