import React, { useState, useEffect, useContext } from "react";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import CircularProgress from "@mui/material/CircularProgress";
import AddressCard from "../../../components/address/AddressCard.jsx";
import AddressModal from "../../../components/address/AddressModal.jsx";
import { AuthContext } from "../../../contexts/AuthProvider";
import { useToast } from "../../../contexts/ToastProvider";

const GHN_API_BASE_URL = import.meta.env.VITE_GHN_API_BASE_URL;
const GHN_API_TOKEN = import.meta.env.VITE_GHN_API_TOKEN;

// -----------------------GRAPHQL-----------------------
const ADD_ADDRESS_USER = gql`
  mutation AddAddress($userId: ID!, $input: AddressInput!) {
    addAddress(userId: $userId, input: $input) {
      _id
    }
  }
`;

const GET_ADDRESS_USER = gql`
  query Query($userId: ID!) {
    user(_id: $userId) {
      address {
        name
        phone
        province
        ward
        district
        isDefault
        _id
      }
    }
  }
`;

const UPDATE_STATUS_ADDRESS = gql`
  mutation SetDefaultAddress($userId: ID!, $addressId: ID!) {
    setDefaultAddress(userId: $userId, addressId: $addressId) {
      name
    }
  }
`;

const DETAIL_ADDRESS_USER = gql`
  query Query($userId: ID!, $addressId: ID!) {
    address(userId: $userId, addressId: $addressId) {
      _id
      district
      district_id
      isDefault
      address
      name
      phone
      province
      province_id
      ward
      ward_code
    }
  }
`;

const UPDATE_ADDRESS_USER = gql`
  mutation Mutation($userId: ID!, $addressId: ID!, $input: AddressInput!) {
    updateAddress(userId: $userId, addressId: $addressId, input: $input) {
      name
    }
  }
`;

const DELETE_ADDRESS_USER = gql`
  mutation DeleteAddress($userId: ID!, $addressId: ID!) {
    deleteAddress(userId: $userId, addressId: $addressId) {
      name
    }
  }
`;
// ----------------------------------------------

export default function ProfileAddressPage() {
  const { userData, refetch } = useContext(AuthContext);
  const { showToast } = useToast();

  const [addressUser] = useMutation(ADD_ADDRESS_USER);
  const [deleteAddressUser] = useMutation(DELETE_ADDRESS_USER);
  const [updateAddressUser] = useMutation(UPDATE_ADDRESS_USER);
  const [updateStatusAddress] = useMutation(UPDATE_STATUS_ADDRESS);

  const {
    data: getAddress,
    refetch: refetchAddress,
    loading: loadingAddress,
  } = useQuery(GET_ADDRESS_USER, {
    variables: { userId: userData?._id },
    skip: !userData?._id,
    fetchPolicy: "network-only",
  });

  const [loadDetailAddress, { data: detailAddress }] =
    useLazyQuery(DETAIL_ADDRESS_USER);

  const [address, setAddress] = useState({
    provinces: [],
    districts: [],
    wards: [],
    selectedProvince: null,
    selectedDistrict: null,
    selectedWard: null,
    isDefault: false,
    loading: { province: false, district: false, ward: false },
    error: null,
  });

  const [form, setForm] = useState({
    id: "",
    fullName: "",
    phone: "",
    address: "",
    province: "",
    provinceId: "",
    district: "",
    districtId: "",
    ward: "",
    wardCode: "",
    isDefault: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // -------------------FETCH GHN-------------------
  useEffect(() => {
    setAddress((prev) => ({
      ...prev,
      loading: { ...prev.loading, province: true },
      error: null,
    }));
    fetch(`${GHN_API_BASE_URL}province`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_API_TOKEN,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 200) {
          setAddress((prev) => ({
            ...prev,
            provinces: data.data || [],
            districts: [],
            wards: [],
            loading: { ...prev.loading, province: false },
          }));
        } else {
          throw new Error(data.message || "Không thể lấy danh sách tỉnh/thành");
        }
      })
      .catch((err) => {
        setAddress((prev) => ({
          ...prev,
          error: err.message,
          loading: { ...prev.loading, province: false },
        }));
      });
  }, []);

  useEffect(() => {
    if (!form?.provinceId) return;
    setAddress((prev) => ({
      ...prev,
      loading: { ...prev.loading, district: true },
      error: null,
    }));

    fetch(`${GHN_API_BASE_URL}district`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_API_TOKEN,
      },
      body: JSON.stringify({ province_id: Number(form?.provinceId) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAddress((prev) => ({
          ...prev,
          districts: data.data || [],
          loading: { ...prev.loading, district: false },
        }));
      })
      .catch((err) => {
        setAddress((prev) => ({
          ...prev,
          error: err.message,
          loading: { ...prev.loading, district: false },
        }));
      });
  }, [form?.provinceId]);

  useEffect(() => {
    if (!form?.districtId) return;
    setAddress((prev) => ({
      ...prev,
      loading: { ...prev.loading, ward: true },
      error: null,
    }));
    const districtId = Number(form?.districtId);
    fetch(`${GHN_API_BASE_URL}ward?district_id=${districtId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Token: GHN_API_TOKEN,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setAddress((prev) => ({
          ...prev,
          wards: data.data || [],
          loading: { ...prev.loading, ward: false },
        }));
      })
      .catch((err) => {
        setAddress((prev) => ({
          ...prev,
          error: err.message,
          loading: { ...prev.loading, ward: false },
        }));
      });
  }, [form?.districtId]);

  useEffect(() => {
    if (detailAddress?.address) {
      setForm({
        id: detailAddress.address._id || "",
        fullName: detailAddress.address.name || "",
        phone: detailAddress.address.phone || "",
        address: detailAddress.address.address || "",
        province: detailAddress.address.province || "",
        provinceId: detailAddress.address.province_id || "",
        district: detailAddress.address.district || "",
        districtId: detailAddress.address.district_id || "",
        ward: detailAddress.address.ward || "",
        wardCode: detailAddress.address.ward_code || "",
        isDefault: detailAddress.address.isDefault || false,
      });
    }
  }, [detailAddress]);

  // -------------------HANDLE ACTION-------------------
  const handleAddAddress = async () => {
    setModalLoading(true);
    try {
      await addressUser({
        variables: {
          userId: userData?._id,
          input: {
            district_id: Number(form.districtId),
            district: form.district?.trim(),
            isDefault: form.isDefault || false,
            name: form.fullName?.trim(),
            phone: form.phone?.trim(),
            province: form.province?.trim(),
            province_id: Number(form.provinceId),
            ward: form.ward?.trim(),
            ward_code: Number(form.wardCode),
            address: form.address?.trim(),
          },
        },
      });
      refetch();
      refetchAddress();
      setIsModalOpen(false);
      showToast("Thêm địa chỉ thành công");
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateAddress = async (id) => {
    setModalLoading(true);
    try {
      await updateAddressUser({
        variables: {
          userId: userData?._id,
          addressId: id,
          input: {
            district_id: Number(form.districtId),
            district: form.district?.trim(),
            isDefault: form.isDefault || false,
            name: form.fullName?.trim(),
            phone: form.phone?.trim(),
            province: form.province?.trim(),
            province_id: Number(form.provinceId),
            ward: form.ward?.trim(),
            ward_code: Number(form.wardCode),
            address: form.address?.trim(),
          },
        },
      });
      refetch();
      refetchAddress();
      setIsModalOpen(false);
      showToast("Cập nhật địa chỉ thành công");
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    setModalLoading(true);
    try {
      await deleteAddressUser({
        variables: { userId: userData?._id, addressId: id },
      });
      refetchAddress();
      showToast("Xóa địa chỉ thành công");
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleChangeStatus = async (id) => {
    setModalLoading(true);
    try {
      await updateStatusAddress({
        variables: { userId: userData?._id, addressId: id },
      });
      refetchAddress();
      showToast("Đổi địa chỉ thành công");
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="w-230 h-auto mt-5 bg-white rounded">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[16px]">Địa chỉ của tôi</h1>
          <button
            onClick={() => {
              setForm({});
              setIsModalOpen(true);
            }}
            className="px-4 cursor-pointer bg-[#5aa32a] h-10 text-white text-[14px]"
          >
            + Thêm địa chỉ mới
          </button>
        </div>
        <hr className="my-5 border-t border-gray-300" />

        <div className="mt-6">
          {loadingAddress ? (
            <div className="flex justify-center mt-4">
              <CircularProgress size={24} />
            </div>
          ) : getAddress?.user?.address?.length > 0 ? (
            getAddress.user.address
              .slice()
              .sort((a, b) => (a.isDefault ? -1 : b.isDefault ? 1 : 0))
              .map((addr) => (
                <AddressCard
                  key={addr._id}
                  address={addr}
                  form={form}
                  setForm={setForm}
                  loadDetailAddress={loadDetailAddress}
                  setIsModalOpen={setIsModalOpen}
                  handleChangeStatus={() => handleChangeStatus(addr._id)}
                  handleDeleteAddress={() => handleDeleteAddress(addr._id)}
                  userData={userData}
                  modalLoading={modalLoading}
                />
              ))
          ) : (
            <p className="text-gray-500 text-center text-[14px]">
              Chưa có địa chỉ được thêm
            </p>
          )}
        </div>

        <AddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={() => {
            if (form.id) handleUpdateAddress(form.id);
            else handleAddAddress();
          }}
          address={address}
          setAddress={setAddress}
          form={form}
          setForm={setForm}
          modalLoading={modalLoading}
        />
      </div>
    </div>
  );
}
