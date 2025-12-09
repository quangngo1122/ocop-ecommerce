import axios from "axios";
import { GraphQLError } from "graphql";

const GHN_TOKEN = process.env.GHN_TOKEN;
const GHN_URL = process.env.GHN_URL;

export async function getAddressId({ province, district, ward }) {
  //   console.log("Fetching GHN address IDs for:", { province, district, ward });
  try {
    // Lấy id tỉnh
    const provinces = await axios.get(`${GHN_URL}province`, {
      headers: { Token: GHN_TOKEN },
    });
    const provinceData = provinces.data.data.find(
      (p) => p.ProvinceName === province
    );

    // Lấy id quận/huyện
    const districts = await axios.get(`${GHN_URL}district`, {
      headers: {
        Token: GHN_TOKEN,
      },
      params: { province_id: provinceData.ProvinceID },
    });
    const districtData = districts.data.data.find(
      (d) => d.DistrictName === district
    );

    // Lấy id phường/xã
    const wards = await axios.get(`${GHN_URL}ward`, {
      headers: { Token: GHN_TOKEN, ShopId: process.env.GHN_SHOP_ID },
      params: { district_id: districtData.DistrictID },
    });
    const wardData = wards.data.data.find((w) => w.WardName === ward);

    return {
      provinceId: provinceData.ProvinceID,
      districtId: districtData.DistrictID,
      wardCode: wardData.WardCode,
    };
  } catch (err) {
    throw new Error("GHN: Lỗi lấy địa chỉ - " + err.message);
  }
}

export async function getServiceShipping({ fromDistrictId, toDistrictId }) {
  if (!fromDistrictId || !toDistrictId)
    try {
      const res = await axios.post(
        `${process.env.GHN_URL_SHIP}available-services`,
        {
          shop_id: Number(process.env.GHN_SHOP_ID),
          from_district: Number(fromDistrictId),
          to_district: Number(toDistrictId),
        },
        {
          headers: { Token: process.env.GHN_TOKEN },
        }
      );
      return res.data.data;
    } catch (err) {
      throw new Error("GHN: Lỗi lấy dịch vụ - " + err.message);
    }
}

export async function getShippingFee({
  fromDistrictId,
  fromWardCode,
  toDistrictId,
  toWardCode,
  weight,
  serviceId,
  serviceTypeId,
}) {
  try {
    const res = await axios.post(
      `${GHN_URL}/v2/shipping-order/fee`,
      {
        shop_id: Number(process.env.GHN_SHOP_ID),
        from_district_id: Number(fromDistrictId),
        from_ward_code: fromWardCode,
        to_district_id: Number(toDistrictId),
        to_ward_code: toWardCode,
        height: 10,
        length: 10,
        width: 10,
        weight,
        cod_failed_amount: 20000,
        pick_station_id: null,
        document_return: false,
        double_check: false,
        service_id: Number(serviceId),
        service_type_id: Number(serviceTypeId),
        items: [
          {
            quantity: 1,
            weight: 500,
            calculate_weight: 500,
            convert_weight: 200,
          },
        ],
        source: "5sao",
      },
      {
        headers: { Token: GHN_TOKEN, ShopId: process.env.GHN_SHOP_ID },
      }
    );
    return res.data.data.total;
  } catch (errors) {
    throw new GraphQLError("GHN: Lỗi tính phí ship - " + err.message, {
      extensions: { code: "GHN ERROR" },
    });
  }
}
