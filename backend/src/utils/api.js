import axios from "axios";
import "dotenv/config";
import { ApolloError } from "apollo-server-errors";

import { compareObjectId } from "./mongoose.js";

export const getAddressId = async ({ province, district, ward }) => {
  const resProvince = await axios.get(`${process.env.GHN_URL}province`, {
    headers: {
      token: process.env.GHN_TOKEN,
      "Content-Type": "application/json",
    },
  });
  const provinceId = resProvince.data.data.find(
    (item) => item.ProvinceName === province
  )?.ProvinceID;
  if (!provinceId) {
    throw new ApolloError("Province not found", "NOT_FOUND");
  }
  const resDistrict = await axios.get(
    `${process.env.GHN_URL}district?province_id=${provinceId}`,
    {
      headers: {
        token: process.env.GHN_TOKEN,
        "Content-Type": "application/json",
      },
    }
  );
  const districtId = resDistrict.data.data.find(
    (item) => item.DistrictName === district
  )?.DistrictID;
  if (!districtId) {
    throw new ApolloError("District not found", "NOT_FOUND");
  }
  const resWard = await axios.get(
    `${process.env.GHN_URL}ward?district_id=${districtId}`,
    {
      headers: {
        token: process.env.GHN_TOKEN,
        "Content-Type": "application/json",
      },
    }
  );
  const wardCode = resWard.data.data.find(
    (item) => item.WardName === ward
  )?.WardCode;
  if (!wardCode) {
    throw new ApolloError("Ward not found", "NOT_FOUND");
  }
  return { provinceId, districtId, wardCode };
};

export const getServiceShipping = async ({ fromDistrictId, toDistrictId }) => {
  fromDistrictId = parseInt(fromDistrictId);
  toDistrictId = parseInt(toDistrictId);
  const shopId = parseInt(process.env.GHN_SHOP_ID);
  const res = await axios.get(
    `${process.env.GHN_URL_SHIP}available-services?shop_id=${shopId}&from_district=${fromDistrictId}&to_district=${toDistrictId}`,
    {
      headers: {
        token: process.env.GHN_TOKEN,
      },
    }
  );
  return res.data.data;
};

// export const getShippingFee = async ({
//   fromDistrictId,
//   fromWardCode,
//   toDistrictId,
//   toWardCode,
//   weight,
//   serviceId,
//   serviceTypeId,
// }) => {
//   const url = `${process.env.GHN_URL_SHIP}fee?from_district_id=${fromDistrictId}&from_ward_code=${fromWardCode}&to_ward_code=${toWardCode}&to_district_id=${toDistrictId}&weight=${weight}&service_id=${serviceId}&service_type_id=${serviceTypeId}`;
//   const res = await axios.get(url, {
//     headers: {
//       token: process.env.GHN_TOKEN,
//       shop_id: process.env.GHN_SHOP_ID,
//     },
//   });
//   return res.data.data.total;
// };

export async function getShippingFee({
  fromDistrictId,
  fromWardCode,
  toDistrictId,
  toWardCode,
  serviceId,
  serviceTypeId,
}) {
  try {
    const url = `${process.env.GHN_URL_SHIP}fee`;
    const body = {
      shop_id: `${process.env.GHN_SHOP_ID}`,
      from_district_id: fromDistrictId,
      from_ward_code: String(fromWardCode),
      to_district_id: toDistrictId,
      to_ward_code: String(toWardCode),
      height: 10,
      length: 10,
      weight: 10,
      width: 10,
      cod_failed_amount: 20000,
      pick_station_id: null,
      document_return: false,
      double_check: false,
      service_id: serviceId,
      service_type_id: serviceTypeId,
      items: [
        {
          quantity: 1,
          weight: 500,
          calculate_weight: 500,
          convert_weight: 200,
        },
      ],
      source: "5sao",
    };

    const res = await axios.post(url, body, {
      headers: {
        Token: process.env.GHN_TOKEN,
        ShopId: process.env.GHN_SHOP_ID,
      },
    });

    return res.data.data.total;
  } catch (err) {
    console.error("GHN Fee Error:", err.response?.data || err.message);
    throw new Error("GHN: Lỗi tính phí ship - " + err.message);
  }
}

export const createGHN = async (shopOrder, variantsInfo) => {
  const fromAddress = shopOrder.shippingFrom;
  const toAddress = shopOrder.shippingTo;

  // Validate required fields
  if (
    !toAddress?.name ||
    !toAddress?.phone ||
    !toAddress?.address ||
    !shopOrder?.weight ||
    !fromAddress?.name ||
    !fromAddress?.phone
  ) {
    console.log(
      toAddress?.name,
      toAddress?.phone,
      toAddress?.address,
      shopOrder?.weight,
      fromAddress?.name,
      fromAddress?.phone
    );
    throw new ApolloError(
      "Missing required shipping information",
      "VALIDATION_ERROR"
    );
  }

  let contentGHN = "";
  const items = shopOrder.orderItems.map((orderItem) => {
    const variant = variantsInfo.find((variant) =>
      compareObjectId(variant._id, orderItem.variantId)
    );
    const attributes = variant.attributes.map(
      (attr) => `${attr.name}: ${attr.value}`
    );
    contentGHN += `${variant.productName}, Phân loại: ${attributes}, SL: ${orderItem.quantity}; `;

    return {
      name: variant.productName,
      code: variant._id.toString(),
      quantity: parseInt(orderItem.quantity),
      price: parseInt(orderItem.price),
      length: 10, // Default dimensions if not available
      width: 10,
      height: 10,
      weight: parseInt(orderItem.weight || 200),
      category: {
        level1: "Other",
      },
    };
  });

  const params = {
    payment_type_id: 2,
    note: shopOrder.note || "",
    required_note: "KHONGCHOXEMHANG",
    from_name: fromAddress.name.trim(),
    from_phone: fromAddress.phone.trim(),
    from_address:
      `${fromAddress.address}, ${fromAddress.ward}, ${fromAddress.district}`.trim(),
    from_ward_name: fromAddress.ward,
    from_district_name: fromAddress.district,
    from_province_name: fromAddress.province,
    return_phone: fromAddress.phone.trim(),
    return_address: fromAddress.address,
    return_district_id: null,
    return_ward_code: "",
    to_name: toAddress.name.trim(),
    to_phone: toAddress.phone.trim(),
    to_address:
      `${toAddress.address}, ${toAddress.ward}, ${toAddress.district}`.trim(),
    to_ward_code: String(toAddress.wardCode), // Convert to string as required
    to_district_id: parseInt(toAddress.districtId),
    cod_amount: parseInt(
      shopOrder.payment === "cod" ? shopOrder.price.final : 0
    ),
    content: contentGHN.trim(),
    weight: parseInt(shopOrder.weight),
    length: 20, // Default dimensions
    width: 20,
    height: 20,
    insurance_value: Math.min(5000000, parseInt(shopOrder.price.final)),
    service_id: 0,
    service_type_id: 2,
    items: items,
  };
  try {
    const res = await axios.post(`${process.env.GHN_URL_SHIP}create`, params, {
      headers: {
        Token: process.env.GHN_TOKEN,
        ShopId: process.env.GHN_SHOP_ID,
        "Content-Type": "application/json",
      },
    });

    if (!res.data?.data?.order_code) {
      throw new Error("No order code returned from GHN");
    }

    return res.data.data.order_code;
    // return "123";
  } catch (error) {
    console.error("GHN API Error:", error.response?.data || error.message);
    throw new ApolloError("Failed to create shipping order", "GHN_API_ERROR", {
      details: error.response?.data,
    });
  }
};

export const createGHNOrder = async (shopOrder, variantsInfo) => {
  const fromAddress = shopOrder.shippingFrom;
  const toAddress = shopOrder.shippingTo;

  // Validate
  if (
    !toAddress?.name ||
    !toAddress?.phone ||
    !toAddress?.address ||
    !toAddress?.districtId ||
    !toAddress?.wardCode ||
    !shopOrder?.weight ||
    !fromAddress?.name ||
    !fromAddress?.phone
  ) {
    console.error("Thiếu thông tin GHN:", {
      toAddress,
      fromAddress,
      weight: shopOrder?.weight,
    });
    throw new ApolloError(
      "Thiếu thông tin bắt buộc để tạo vận đơn GHN",
      "VALIDATION_ERROR"
    );
  }

  let contentGHN = "";
  const items = shopOrder.orderItems.map((orderItem) => {
    const variant = variantsInfo.find((variant) =>
      compareObjectId(variant._id, orderItem.variantId)
    );

    const productName = variant.product_id?.name || "Sản phẩm";
    const attributes = variant.attributes
      .map((attr) => `${attr.name}: ${attr.value}`)
      .join(", ");

    // content cho GHN
    contentGHN += `${productName}, Phân loại: ${attributes}, SL: ${orderItem.quantity}; `;

    return {
      name: productName, // ✅ fix: product_id.name
      code: variant._id.toString(),
      quantity: parseInt(orderItem.quantity),
      price: parseInt(orderItem.price),
      weight: parseInt(variant.weight || 200),
      length: variant.length || 10,
      width: variant.width || 10,
      height: variant.height || 10,
      category: { level1: "Other" },
    };
  });

  const params = {
    payment_type_id: 2,
    note: shopOrder.note || "",
    required_note: "KHONGCHOXEMHANG",
    from_name: fromAddress.name.trim(),
    from_phone: fromAddress.phone.trim(),
    from_address:
      `${fromAddress.address}, ${fromAddress.ward}, ${fromAddress.district}`.trim(),
    from_ward_name: fromAddress.ward,
    from_district_name: fromAddress.district,
    from_province_name: fromAddress.province,
    return_phone: fromAddress.phone.trim(),
    return_address: fromAddress.address,
    to_name: toAddress.name.trim(),
    to_phone: toAddress.phone.trim(),
    to_address:
      `${toAddress.address}, ${toAddress.ward}, ${toAddress.district}`.trim(),
    to_ward_code: String(toAddress.wardCode),
    to_district_id: parseInt(toAddress.districtId),
    cod_amount:
      shopOrder.payment === "cod" ? parseInt(shopOrder.price.final) : 0,
    content: contentGHN.trim(),
    weight: parseInt(shopOrder.weight),
    length: 20,
    width: 20,
    height: 20,
    insurance_value: Math.min(5000000, parseInt(shopOrder.price.final)),
    service_id: shopOrder.serviceId || 0,
    service_type_id: shopOrder.serviceTypeId || 2,
    items,
  };

  try {
    const res = await axios.post(`${process.env.GHN_URL_SHIP}create`, params, {
      headers: {
        Token: process.env.GHN_TOKEN,
        ShopId: process.env.GHN_SHOP_ID,
        "Content-Type": "application/json",
      },
    });

    if (!res.data?.data?.order_code) {
      throw new Error("No order code returned from GHN");
    }

    return res.data.data.order_code;
  } catch (error) {
    console.error("GHN API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    throw new ApolloError("Failed to create shipping order", "GHN_API_ERROR", {
      details: error.response?.data || error.message,
    });
  }
};

export function validateGHNInput(shopOrder, fromAddress, toAddress) {
  const missing = [];

  if (!toAddress?.name) missing.push("toAddress.name");
  if (!toAddress?.phone) missing.push("toAddress.phone");
  if (!toAddress?.address) missing.push("toAddress.address");
  if (!toAddress?.districtId) missing.push("toAddress.districtId");
  if (!toAddress?.wardCode) missing.push("toAddress.wardCode");
  if (!shopOrder?.weight) missing.push("shopOrder.weight");

  if (!fromAddress?.name) missing.push("fromAddress.name");
  if (!fromAddress?.phone) missing.push("fromAddress.phone");
  if (!fromAddress?.address) missing.push("fromAddress.address");

  return missing;
}

export function mapAddressToGHN(address) {
  if (!address) return null;

  return {
    name: address.name,
    phone: address.phone,
    address: address.address,
    province: address.province,
    district: address.district,
    ward: address.ward,
    districtId: address.district_id, // map từ district_id -> districtId
    wardCode: address.ward_code, // map từ ward_code -> wardCode
  };
}
