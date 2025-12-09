import React, { useState, useContext } from "react";
import { useQuery, gql } from "@apollo/client";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { AuthContext } from "../../../contexts/AuthProvider";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import useCounterAnimation from "../../../components/seller/CounterAnimation";

// GraphQL -----------------------------------
const GET_STATISTICS = gql`
  query GetStatistics($shopId: ID, $toDate: String, $fromDate: String) {
    getStatistics(shopId: $shopId, toDate: $toDate, fromDate: $fromDate) {
      completionRate
      netRevenue
      totalDiscount
      totalOrders
      totalOrdersByShop {
        shop_id
        totalOrders
      }
      totalRevenue
      productSales {
        name
        product_id
        totalQuantity
      }
      topSellingProducts {
        totalQuantity
        product_id
        name
      }
      topRevenueProducts {
        totalRevenue
        product_id
        name
      }
    }
  }
`;

const MY_SHOP_ORDERS_QUERY = gql`
  # query MyShopOrders {
  #   myShopOrders {
  #     total
  #     items {
  query shopOrders($filter: ShopOrdersInput) {
    shopOrders(filter: $filter) {
      _id
      amounts {
        shippingFee
        subtotal
        total
        total_discount
      }
      current_status
      status_history {
        status
        updatedAt
      }
      items {
        price

        quantity
        variant {
          _id
          product_id {
            _id
            name
          }
          image
          attributes {
            _id
            name
            value
          }
        }
      }
      order_id {
        _id
        order_code
        payment {
          method
          paid_at
          transactionId
          status
        }
        status
        user_id {
          _id
        }
      }
      createdAt
    }
  }
  # }
`;

const MY_SHOP = gql`
  query MyShop {
    myShop {
      _id
    }
  }
`;
// end GraphQL -----------------------------------

function getRevenueDataFromOrders(orders, chartType = "daily") {
  const today = dayjs();
  const currentYear = today.year();
  const currentMonth = today.month();

  if (chartType === "daily") {
    const daysInMonth = today.daysInMonth();
    const chartData = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      return {
        day,
        date: dayjs(new Date(currentYear, currentMonth, day)).format("DD/MM"),
        total: 0,
      };
    });

    orders.forEach((order) => {
      const orderDate = dayjs(order.createdAt);
      if (
        orderDate.month() === currentMonth &&
        orderDate.year() === currentYear
      ) {
        const dayIndex = orderDate.date() - 1;
        chartData[dayIndex].total += order.amounts?.total || 0;
      }
    });

    return chartData;
  } else {
    const chartData = Array.from({ length: 12 }, (_, i) => ({
      month: dayjs().month(i).format("MM/YYYY"),
      total: 0,
    }));

    orders.forEach((order) => {
      const orderDate = dayjs(order.createdAt);
      if (orderDate.year() === currentYear) {
        const monthIndex = orderDate.month();
        chartData[monthIndex].total += order.amounts?.total || 0;
      }
    });

    return chartData;
  }
}

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
];

function formatCurrency(value) {
  return value?.toLocaleString("vi-VN") + " đ";
}

export default function StatisticalPage() {
  const { userData } = useContext(AuthContext);
  const [isConfigInfoExpanded, setIsConfigInfoExpanded] = useState(true);
  const [chartType, setChartType] = useState("daily");
  const { data: myshop } = useQuery(MY_SHOP);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  // const [compareType, setCompareType] = useState("day");

  // Get shopId
  const shopId = myshop?.myShop._id;

  // Fetch current statistics
  const { data, loading, refetch } = useQuery(GET_STATISTICS, {
    // variables: {
    //   shopId,
    //   fromDate: dateRange[0]?.format("YYYY-MM-DD"),
    //   toDate: dateRange[1]?.format("YYYY-MM-DD"),
    // },
    variables: {
      shopId,
      fromDate: dateRange[0]
        ?.startOf("day")
        .subtract(7, "hour")
        .format("YYYY-MM-DDTHH:mm:ss[Z]"),
      toDate: dateRange[1]
        ?.endOf("day")
        .subtract(7, "hour")
        .format("YYYY-MM-DDTHH:mm:ss[Z]"),
    },
    skip: !shopId,
    fetchPolicy: "network-only",
  });

  const { data: orderData } = useQuery(MY_SHOP_ORDERS_QUERY, {
    variables: { filter: { shopId } },
    fetchPolicy: "network-only",
  });

  const orders = orderData?.shopOrders || [];
  const totalorder = orders.length;

  const deliveredOrders = orders.filter((order) =>
    order.status_history?.some((s) => s.status === "delivered")
  );

  const revenue = deliveredOrders.reduce(
    (sum, order) => sum + (order.amounts?.total || 0),
    0
  );
  const revenueData = getRevenueDataFromOrders(deliveredOrders, chartType);
  const currentMonth = dayjs().format("MM");
  const currentYear = dayjs().format("YYYY");

  // const getCompareRange = () => {
  //   if (compareType === "day") {
  //     const today = dayjs();
  //     const yesterday = today.subtract(1, "day");
  //     return [yesterday.startOf("day"), yesterday.endOf("day")];
  //   }
  //   if (compareType === "month") {
  //     const lastMonth = dayjs().subtract(1, "month");
  //     return [lastMonth.startOf("month"), lastMonth.endOf("month")];
  //   }
  //   if (compareType === "year") {
  //     const lastYear = dayjs().subtract(1, "year");
  //     return [lastYear.startOf("year"), lastYear.endOf("year")];
  //   }
  //   return [null, null];
  // };

  // const [compareFrom, compareTo] = getCompareRange();

  // const { data: compareData } = useQuery(GET_STATISTICS, {
  //   variables: {
  //     shopId,
  //     fromDate: compareFrom?.format("YYYY-MM-DD"),
  //     toDate: compareTo?.format("YYYY-MM-DD"),
  //   },
  //   skip: !shopId || !compareFrom,
  //   fetchPolicy: "network-only",
  // });

  const stats = data?.getStatistics || {};
  // const compareStats = compareData?.getStatistics || {};

  // Calculate percentage change
  function getPercentChange(current, prev) {
    if (!prev || prev === 0) return current > 0 ? 100 : 0;
    return (((current - prev) / prev) * 100).toFixed(2);
  }

  // Bar chart data
  const barData =
    stats.productSales?.map((item) => ({
      name: item.name,
      Số_lượng_bán: item.totalQuantity,
    })) || [];

  // Pie chart data
  const pieData =
    stats.topSellingProducts?.map((item, idx) => ({
      name: item.name,
      value: item.totalQuantity,
      fill: COLORS[idx % COLORS.length],
    })) || [];

  // Table columns configuration
  const topRevenueColumns = [
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: formatCurrency,
    },
  ];

  const topSellingColumns = [
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Số lượng bán", dataIndex: "totalQuantity", key: "totalQuantity" },
  ];

  const ordersByShopColumns = [
    { title: "Shop ID", dataIndex: "shop_id", key: "shop_id" },
    { title: "Tổng đơn hàng", dataIndex: "totalOrders", key: "totalOrders" },
  ];

  // Handle date change
  const handleDateChange = (e, index) => {
    const newDate = e.target.value ? dayjs(e.target.value) : null;
    const newDateRange = [...dateRange];
    newDateRange[index] = newDate;
    if (
      newDateRange[0] &&
      newDateRange[1] &&
      newDateRange[0].isAfter(newDateRange[1])
    ) {
      alert("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
      return;
    }
    setDateRange(newDateRange);
    if (newDateRange[0] && newDateRange[1]) {
      refetch({
        shopId,
        fromDate: newDateRange[0]?.format("YYYY-MM-DD"),
        toDate: newDateRange[1]?.format("YYYY-MM-DD"),
      });
    }
  };

  // Card config (đồng nhất với DashboardPage)
  const statsCards = [
    {
      title: "Tổng Đơn Hàng",
      value: useCounterAnimation(stats.totalOrders || 0),
      bgColor: "bg-green-500",
      icon: "🛒",
      // percent: getPercentChange(stats.totalOrders, compareStats.totalOrders),
      // up: getPercentChange(stats.totalOrders, compareStats.totalOrders) >= 0,
    },
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(useCounterAnimation(stats.totalRevenue)),
      bgColor: "bg-red-500",
      icon: "💰",
      // percent: getPercentChange(stats.totalRevenue, compareStats.totalRevenue),
      // up: getPercentChange(stats.totalRevenue, compareStats.totalRevenue) >= 0,
    },
    {
      title: "Tổng Lợi Nhuận",
      value: formatCurrency(useCounterAnimation(stats.netRevenue)),
      bgColor: "bg-blue-500",
      icon: "💵",
      // percent: getPercentChange(stats.netRevenue, compareStats.netRevenue),
      // up: getPercentChange(stats.netRevenue, compareStats.netRevenue) >= 0,
    },
    {
      title: "Tỉ lệ hoàn thành đơn hàng",
      value: useCounterAnimation(stats.completionRate?.toFixed(2) || 0) + "%",
      bgColor: "bg-teal-500",
      icon: "✅",
      percent: null,
      up: null,
    },
    {
      title: "Tổng Giảm Giá",
      value: formatCurrency(useCounterAnimation(stats.totalDiscount)),
      bgColor: "bg-yellow-500",
      icon: "🏷️",
      // percent: getPercentChange(
      //   stats.totalDiscount,
      //   compareStats.totalDiscount
      // ),
      // up:
      // getPercentChange(stats.totalDiscount, compareStats.totalDiscount) >= 0,
    },
  ];
  if (loading)
    return (
      <div className=" w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Thống Kê Bán Hàng
      </h1>
      {/* Bộ lọc ngày tháng */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-6">
        <span className="font-semibold text-gray-700">
          Chọn khoảng thời gian:
        </span>
        <div className="flex space-x-2">
          <input
            type="date"
            value={dateRange[0]?.format("YYYY-MM-DD") || ""}
            onChange={(e) => handleDateChange(e, 0)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={dateRange[1]?.format("YYYY-MM-DD") || ""}
            onChange={(e) => handleDateChange(e, 1)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* <select
          value={compareType}
          onChange={(e) => setCompareType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
        >
          <option value="day">So với hôm qua</option>
          <option value="month">So với tháng trước</option>
          <option value="year">So với năm trước</option>
        </select> */}
      </div>

      {/* Thống kê tổng quan dạng thẻ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.bgColor} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-102`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-75">{card.title}</p>
                <p className="text-2xl font-bold">{card?.value}</p>
              </div>
              <div className="text-4xl opacity-75">{card.icon}</div>
            </div>
            {/* {card.percent !== null && ( */}
            {card.percent && (
              <div className="flex items-center mt-2">
                <span
                  className={`text-sm ${
                    card.up ? "text-green-200" : "text-red-200"
                  }`}
                >
                  {card.percent}%
                  {card.up ? (
                    <ArrowUpward fontSize="small" />
                  ) : (
                    <ArrowDownward fontSize="small" />
                  )}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Biểu đồ cột: Số lượng bán theo sản phẩm */}
      <div className="grid lg:grid-cols-2 lg:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Số lượng bán theo sản phẩm
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Số_lượng_bán" fill="#00CAFF" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Biểu đồ tròn: Top sản phẩm bán chạy */}
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Top sản phẩm bán chạy nhất
          </h2>
          <div className="h-[300px] flex">
            <div className="flex-1">
              {/* <div className="mt-4 grid grid-cols-3 items-center mb-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center mb-2">
                <div
                  style={{
                    width: "15px",
                    height: "15px",
                    backgroundColor: COLORS[index % COLORS.length],
                    marginRight: "8px",
                  }}
                ></div>
                <span className="text-sm">
                  {item.name.length > 20
                    ? item.name.slice(0, 20) + "..."
                    : item.name}{" "}
                </span>
              </div>
            ))}
          </div> */}
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      ` ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} sản phẩm`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/3 pl-4 overflow-y-auto">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center mb-2">
                  <div
                    style={{
                      width: "12px",
                      height: "12px",
                      backgroundColor: COLORS[index % COLORS.length],
                      marginRight: "8px",
                    }}
                  ></div>
                  <span className="text-sm">
                    {item.name.length > 20
                      ? item.name.slice(0, 20) + "..."
                      : item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bảng: Top sản phẩm doanh thu cao nhất */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Top sản phẩm doanh thu cao nhất
        </h2>
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                {topRevenueColumns.map((col) => (
                  <th
                    key={col.key}
                    className="p-3 font-semibold text-gray-700 border border-gray-300"
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.topRevenueProducts?.map((item) => (
                <tr
                  key={item.product_id}
                  className="border border-gray-300 hover:bg-gray-50"
                >
                  <td className="p-3 border border-gray-300">{item.name}</td>
                  <td className="p-3 border border-gray-300">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bảng: Top sản phẩm bán chạy nhất */}
      {/* <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Top sản phẩm bán chạy nhất
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {topSellingColumns.map((col) => (
                  <th
                    key={col.key}
                    className="p-3 font-semibold text-gray-700 border-b"
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stats.topSellingProducts?.map((item) => (
                <tr key={item.product_id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.totalQuantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* {stats.totalOrdersByShop?.length > 1 && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Tổng đơn hàng theo từng shop
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  {ordersByShopColumns.map((col) => (
                    <th
                      key={col.key}
                      className="p-3 font-semibold text-gray-700 border-b"
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.totalOrdersByShop?.map((item) => (
                  <tr key={item.shop_id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{item.shop_id}</td>
                    <td className="p-3">{item.totalOrders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}
      <h1 className="text-xl font-bold mb-6 text-gray-800">
        Thống Kê Cố Định:
      </h1>
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div
          className={`bg-white p-6 rounded-lg shadow-lg ${
            isConfigInfoExpanded ? "h-auto" : "h-26"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {chartType === "daily"
                ? `Doanh Thu Tháng ${currentMonth} Năm ${currentYear}`
                : `Doanh Thu Theo Tháng Năm ${currentYear}`}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType("daily")}
                className={`cursor-pointer px-4 whitespace-nowrap py-2 rounded ${
                  chartType === "daily"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Theo Ngày
              </button>
              <button
                onClick={() => setChartType("monthly")}
                className={`cursor-pointer px-4 whitespace-nowrap py-2 rounded ${
                  chartType === "monthly"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                Theo Tháng
              </button>
              <button
                onClick={() => setIsConfigInfoExpanded(!isConfigInfoExpanded)}
                className="p-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                {isConfigInfoExpanded ? (
                  <span className="w-5 h-5">
                    <RemoveIcon />
                  </span>
                ) : (
                  <span className="w-5 h-5">
                    <AddIcon />
                  </span>
                )}
              </button>
            </div>
          </div>
          {isConfigInfoExpanded && (
            <div className="h-[300px] lg:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey={chartType === "daily" ? "date" : "month"} />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(value)
                    }
                  />
                  <Legend />
                  <Bar dataKey="total" name="Doanh Thu" fill="#00CAFF" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
