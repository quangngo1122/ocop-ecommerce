import React, { useState, useContext, useMemo } from "react";
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
  LineChart,
  Line,
} from "recharts";
import { AuthContext } from "../../../contexts/AuthProvider";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import useCounterAnimation from "../../../components/seller/CounterAnimation";
import RevenueChart from "../../../components/common/RevenueChart";
import BestSellingProductsChart from "../../../components/common/BestSellingProductsChart";
import RevenueLineChart from "../../../components/common/RevenueLineChart";
import OrderStatusPieChart from "../../../components/common/OrderStatusPieChart";

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
  "#FFCC00", // vàng
  "#4ECDC4", // xanh ngọc
  "#45B7D1", // xanh dương nhạt
  "#FF6B6B", // đỏ
  "#28A745", // xanh lá
  "#6C757D", // xám
  "#E74C3C", // đỏ đậm
  "#F39C12", // cam
];

function formatCurrency(value) {
  return value?.toLocaleString("vi-VN") + " đ";
}

export default function StatisticalPage() {
  const { userData } = useContext(AuthContext);
  const [isConfigInfoExpanded, setIsConfigInfoExpanded] = useState(true);
  const [isRevenuaLineExpanded, setIsRevenuaLineExpanded] = useState(true);
  const [isBestSellingExpanded, setIsBestSellingExpanded] = useState(true);
  const [isProductSalesExpanded, setIsProductSalesExpanded] = useState(true);
  const [isOrderStatusExpanded, setIsOrderStatusExpanded] = useState(true);
  const [chartType, setChartType] = useState("daily");
  const { data: myshop } = useQuery(MY_SHOP);
  const [dateRange, setDateRange] = useState([
    dayjs().startOf("month"),
    dayjs(),
  ]);
  const [compareType, setCompareType] = useState("day"); // Kích hoạt phần so sánh

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

  const { data: compareDataFull } = useQuery(GET_STATISTICS, {
    variables: {
      shopId,
    },
    skip: !shopId,
    fetchPolicy: "network-only",
  });

  const statsFull = compareDataFull?.getStatistics || {};

  const orders = orderData?.shopOrders || [];
  const totalOrders = orders.length;

  const deliveredOrders = orders.filter((order) =>
    order.status_history?.some((s) => s.status === "delivered"),
  );

  const revenue = deliveredOrders.reduce(
    (sum, order) => sum + (order.amounts?.total || 0),
    0,
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

  // nóte *: if code này sai dùng lại code trên (code dưới so sánh ngày bắt đầu, code trên so sánh ngày hiện tại)
  const getCompareRange = () => {
    const baseDate = dateRange[0] || dayjs();
    if (compareType === "day") {
      const prevDay = baseDate.subtract(1, "day");
      return [prevDay.startOf("day"), prevDay.endOf("day")];
    }
    if (compareType === "month") {
      const prevMonth = baseDate.subtract(1, "month");
      return [prevMonth.startOf("month"), prevMonth.endOf("month")];
    }
    if (compareType === "year") {
      const prevYear = baseDate.subtract(1, "year");
      return [prevYear.startOf("year"), prevYear.endOf("year")];
    }
    return [null, null];
  };
  // --------------------

  const [compareFrom, compareTo] = getCompareRange();

  const { data: compareData } = useQuery(GET_STATISTICS, {
    variables: {
      shopId,
      fromDate: compareFrom?.format("YYYY-MM-DDTHH:mm:ss[Z]"),
      toDate: compareTo?.format("YYYY-MM-DDTHH:mm:ss[Z]"),
    },
    skip: !shopId || !compareFrom,
    fetchPolicy: "network-only",
  });

  const stats = data?.getStatistics || {};
  const compareStats = compareData?.getStatistics || {};

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

  // Pie chart data for top selling products
  const pieData = useMemo(() => {
    if (!stats.topSellingProducts) return [];
    const total = stats.topSellingProducts.reduce(
      (sum, item) => sum + item.totalQuantity,
      0,
    );
    return stats.topSellingProducts.map((item, idx) => ({
      name: item.name,
      value: item.totalQuantity,
      fill: COLORS[idx % COLORS.length],
      percent: total ? ((item.totalQuantity / total) * 100).toFixed(0) : 0,
    }));
  }, [stats.topSellingProducts]);

  // Additional stats from orders
  const uniqueCustomers = useMemo(() => {
    const customerSet = new Set();
    orders.forEach((order) => {
      if (order.order_id?.user_id?._id) {
        customerSet.add(order.order_id.user_id._id);
      }
    });
    return customerSet.size;
  }, [orders]);

  const averageOrderValue =
    stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;

  const canceledOrders = orders.filter((order) =>
    order.status_history?.some((s) => s.status === "cancelled_by_shop"),
  ).length;

  const canceledOrdersByBuyer = orders.filter((order) =>
    order.status_history?.some((s) => s.status === "cancelled_by_buyer"),
  ).length;

  const orderStatuses = useMemo(() => {
    const statusCounts = {
      pending: 0,
      confirmed: 0,
      preparing: 0,
      transit: 0,
      delivered: 0,
      failed: 0,

      cancelled_by_shop: 0,
      cancelled_by_buyer: 0,
    };
    orders.forEach((order) => {
      const status = order.current_status || "other";
      if (status in statusCounts) {
        statusCounts[status]++;
      } else {
        statusCounts.other++;
      }
    });
    return Object.entries(statusCounts).map(([name, value], idx) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: COLORS[idx % COLORS.length],
    }));
  }, [orders]);

  const enhancedTopRevenueProducts = useMemo(() => {
    const productImages = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.variant?.product_id?._id;
        const image = item.variant?.image;
        if (productId && image && !productImages[productId]) {
          productImages[productId] = image;
        }
      });
    });
    return (
      stats.topRevenueProducts?.map((product) => ({
        ...product,
        image: productImages[product.product_id],
      })) || []
    );
  }, [stats.topRevenueProducts, orders]);

  const enhancedTopSellingProducts = useMemo(() => {
    const productImages = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.variant?.product_id?._id;
        const image = item.variant?.image;
        if (productId && image && !productImages[productId]) {
          productImages[productId] = image;
        }
      });
    });
    return (
      stats.topSellingProducts?.map((product) => ({
        ...product,
        image: productImages[product.product_id],
      })) || []
    );
  }, [stats.topSellingProducts, orders]);

  const topRevenueColumns = [
    { title: "Hình ảnh", dataIndex: "image", key: "image" },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    {
      title: "Doanh thu",
      dataIndex: "totalRevenue",
      key: "totalRevenue",
      render: formatCurrency,
    },
  ];

  const topSellingColumns = [
    { title: "Hình ảnh", dataIndex: "image", key: "image" },
    { title: "Tên sản phẩm", dataIndex: "name", key: "name" },
    { title: "Số lượng bán", dataIndex: "totalQuantity", key: "totalQuantity" },
  ];

  const ordersByShopColumns = [
    { title: "Shop ID", dataIndex: "shop_id", key: "shop_id" },
    { title: "Tổng đơn hàng", dataIndex: "totalOrders", key: "totalOrders" },
  ];

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

  const statsCards = [
    {
      title: "Tổng Đơn Hàng",
      value: useCounterAnimation(stats.totalOrders || 0),
      bgColor: "bg-green-500",
      icon: "🛒",
      percent: getPercentChange(stats.totalOrders, compareStats.totalOrders),
      up: getPercentChange(stats.totalOrders, compareStats.totalOrders) >= 0,
    },
    {
      title: "Tổng Doanh Thu",
      value: formatCurrency(useCounterAnimation(stats.totalRevenue)),
      bgColor: "bg-red-500",
      icon: "💰",
      percent: getPercentChange(stats.totalRevenue, compareStats.totalRevenue),
      up: getPercentChange(stats.totalRevenue, compareStats.totalRevenue) >= 0,
    },
    {
      title: "Tổng Lợi Nhuận",
      value: formatCurrency(useCounterAnimation(stats.netRevenue)),
      bgColor: "bg-blue-500",
      icon: "💵",
      percent: getPercentChange(stats.netRevenue, compareStats.netRevenue),
      up: getPercentChange(stats.netRevenue, compareStats.netRevenue) >= 0,
    },
    {
      title: "Tỉ lệ hoàn thành đơn hàng",
      value: useCounterAnimation(stats.completionRate?.toFixed(2) || 0) + "%",
      bgColor: "bg-teal-500",
      icon: "✅",
      percent: getPercentChange(
        stats.completionRate,
        compareStats.completionRate,
      ),
      up:
        getPercentChange(stats.completionRate, compareStats.completionRate) >=
        0,
    },
    {
      title: "Tổng Giảm Giá",
      value: formatCurrency(useCounterAnimation(stats.totalDiscount)),
      bgColor: "bg-yellow-500",
      icon: "🏷️",
      percent: getPercentChange(
        stats.totalDiscount,
        compareStats.totalDiscount,
      ),
      up:
        getPercentChange(stats.totalDiscount, compareStats.totalDiscount) >= 0,
    },
    // {
    //   title: "Khách Hàng",
    //   value: useCounterAnimation(uniqueCustomers),
    //   bgColor: "bg-purple-500",
    //   icon: "👥",
    //   percent: getPercentChange(
    //     uniqueCustomers,
    //     compareStats.uniqueCustomers || uniqueCustomers
    //   ), // Giả sử compareStats không có, dùng giá trị hiện tại
    //   up: true,
    // },
    {
      title: "Giá Trị Đơn Hàng Trung Bình",
      value: formatCurrency(useCounterAnimation(averageOrderValue)),
      bgColor: "bg-orange-500",
      icon: "📊",
      percent: getPercentChange(
        averageOrderValue,
        compareStats.averageOrderValue || averageOrderValue,
      ),
      up: true,
    },
    // {
    //   title: "Đơn Hàng Bị Hủy",
    //   value: useCounterAnimation(canceledOrders),
    //   bgColor: "bg-red-600",
    //   icon: "❌",
    //   percent: getPercentChange(
    //     canceledOrders,
    //     compareStats.canceledOrders || canceledOrders
    //   ),
    //   up: false,
    // },
  ];

  const extraStatsCards = [
    {
      title: "Khách Hàng",
      value: useCounterAnimation(uniqueCustomers),
      bgColor: "bg-purple-500",
      icon: "👥",
      // percent: getPercentChange(
      //   uniqueCustomers,
      //   compareStats.uniqueCustomers || uniqueCustomers
      // ),
      up: true,
    },
    {
      title: "Đơn Hàng",
      value: useCounterAnimation(statsFull.totalOrders || 0),
      bgColor: "bg-green-500",
      icon: "🛒",
      up: false,
    },
    {
      title: "Đơn Hàng Bị Hủy Bởi Shop",
      value: useCounterAnimation(canceledOrders),
      bgColor: "bg-red-600",
      icon: "❌",
      // percent: getPercentChange(
      //   canceledOrders,
      //   compareStats.canceledOrders || canceledOrders
      // ),
      up: false,
    },
    {
      title: "Đơn Hàng Bị Hủy Bởi Khách",
      value: useCounterAnimation(canceledOrdersByBuyer),
      bgColor: "bg-orange-600",
      icon: "✖️",
      // percent: getPercentChange(
      //   canceledOrdersByBuyer,
      //   compareStats.canceledOrdersByBuyer || canceledOrdersByBuyer
      // ),
      up: false,
    },
  ];

  if (loading)
    return (
      <div className="fixed w-full min-h-screen inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center z-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-white text-lg">Đang tải dữ liệu...</p>
        </div>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 shadow-text">
        Thống Kê Bán Hàng
      </h1>

      {/* Bộ lọc ngày tháng - Cải thiện UI */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0 mb-6 bg-white p-4 rounded-lg shadow">
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
        <select
          value={compareType}
          onChange={(e) => setCompareType(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-48"
        >
          <option value="day">So với hôm qua</option>
          <option value="month">So với tháng trước</option>
          <option value="year">So với năm trước</option>
        </select>
      </div>
      <h1 className="text-xl font-bold mb-6 text-gray-800">
        Thống Kê Theo Khoản Thời Gian:
      </h1>

      {/* Thống kê tổng quan dạng thẻ - Grid responsive hơn, thêm card mới */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.bgColor} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-75">{card.title}</p>
                <p className="text-2xl font-bold">{card?.value}</p>
              </div>
              <div className="text-4xl opacity-75">{card.icon}</div>
            </div>
            {card.percent && (
              <div className="flex items-center mt-2">
                <span
                  className={`text-sm ${
                    card.up ? "text-green-200" : "text-red-200"
                  } flex items-center`}
                >
                  {card.percent}%
                  {card.up ? (
                    <ArrowUpward fontSize="small" className="ml-1" />
                  ) : (
                    <ArrowDownward fontSize="small" className="ml-1" />
                  )}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Grid cho biểu đồ - Cải thiện layout */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Biểu đồ cột: Số lượng bán theo sản phẩm - Thêm animation */}
        {/* <div className="bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl">
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
              <Bar
                dataKey="Số_lượng_bán"
                fill="#00CAFF"
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div> */}

        <div
          className={`bg-white p-6 rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl ${
            isProductSalesExpanded ? "h-auto" : "h-26"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-800 ">
              Số lượng bán theo sản phẩm
            </h2>
            <button
              onClick={() => setIsProductSalesExpanded(!isProductSalesExpanded)}
              className="p-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              {isProductSalesExpanded ? (
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
          {barData.length > 0 ? (
            <div>
              {isProductSalesExpanded && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="Số_lượng_bán"
                      fill="#00CAFF"
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          ) : (
            <div className="bg-white p-6  text-center text-gray-500">
              Không có dữ liệu để hiển thị
            </div>
          )}
        </div>

        {/* Biểu đồ tròn: Top sản phẩm bán chạy */}
        <BestSellingProductsChart
          data={pieData}
          expanded={isBestSellingExpanded}
          onToggleExpand={() =>
            setIsBestSellingExpanded(!isBestSellingExpanded)
          }
        />
      </div>

      {/* Bảng: Top sản phẩm doanh thu cao nhất - Thêm ảnh */}

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
              {/* {stats.topRevenueProducts?.map((item) => ( */}
              {enhancedTopRevenueProducts.map((item) => (
                <tr
                  key={item.product_id}
                  className="border border-gray-300 hover:bg-gray-50"
                >
                  {/* ---------------- */}
                  <td className="p-3 lg:w-[10%] w-[20%]  border border-gray-300">
                    <div className="flex justify-center items-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 italic">
                          Không có ảnh
                        </span>
                      )}
                    </div>
                  </td>
                  {/* ---------------- */}
                  <td className="p-3 border lg:w-[65%] w-[55%] border-gray-300">
                    {item.name}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Top sản phẩm doanh thu cao nhất
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
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
              {enhancedTopRevenueProducts.map((item) => (
                <tr
                  key={item.product_id}
                  className="border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 border border-gray-300">
                    {col.render ? col.render(item.image) : item.image}
                  </td>
                  <td className="p-3 border border-gray-300">{item.name}</td>
                  <td className="p-3 border border-gray-300">
                    {formatCurrency(item.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      {/* Bảng: Top sản phẩm bán chạy nhất - Cải thiện UI */}
      <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Top sản phẩm bán chạy nhất
        </h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-200">
                {topSellingColumns.map((col) => (
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
              {/* {stats.topSellingProducts?.map((item) => ( */}
              {enhancedTopSellingProducts.map((item) => (
                <tr
                  key={item.product_id}
                  className="border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 lg:w-[10%] w-[20%] border border-gray-300">
                    <div className="flex justify-center items-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <span className="text-gray-400 italic">
                          Không có ảnh
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border lg:w-[65%] w-[55%] border-gray-300">
                    {item.name}
                  </td>
                  <td className="p-3 border border-gray-300">
                    {item.totalQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {stats.totalOrdersByShop?.length > 1 && (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Tổng đơn hàng theo từng shop
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  {ordersByShopColumns.map((col) => (
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
                {stats.totalOrdersByShop?.map((item) => (
                  <tr
                    key={item.shop_id}
                    className="border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 border border-gray-300">
                      {item.shop_id}
                    </td>
                    <td className="p-3 border border-gray-300">
                      {item.totalOrders}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <h1 className="text-xl font-bold mb-6 text-gray-800">
        Thống Kê Cố Định:
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {extraStatsCards.map((card, idx) => (
          <div
            key={idx}
            className={`${card.bgColor} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-75">{card.title}</p>
                <p className="text-2xl font-bold">{card?.value}</p>
              </div>
              <div className="text-4xl opacity-75">{card.icon}</div>
            </div>
            {card.percent && (
              <div className="flex items-center mt-2">
                <span
                  className={`text-sm ${
                    card.up ? "text-green-200" : "text-red-200"
                  } flex items-center`}
                >
                  {card.percent}%
                  {card.up ? (
                    <ArrowUpward fontSize="small" className="ml-1" />
                  ) : (
                    <ArrowDownward fontSize="small" className="ml-1" />
                  )}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <RevenueChart
          data={revenueData}
          chartType={chartType}
          onChartTypeChange={setChartType}
          title={
            chartType === "daily"
              ? `Doanh Thu Tháng ${currentMonth} Năm ${currentYear}`
              : `Doanh Thu Theo Tháng Năm ${currentYear}`
          }
          expanded={isConfigInfoExpanded}
          onToggleExpand={() => setIsConfigInfoExpanded(!isConfigInfoExpanded)}
        />
      </div>
      <RevenueLineChart
        data={revenueData}
        chartType={chartType}
        onChartTypeChange={setChartType}
        title={
          chartType === "daily"
            ? `Xu Hướng Doanh Thu Tháng ${currentMonth} Năm ${currentYear}`
            : `Xu Hướng Doanh Thu Theo Tháng Năm ${currentYear}`
        }
        expanded={isRevenuaLineExpanded}
        onToggleExpand={() => setIsRevenuaLineExpanded(!isRevenuaLineExpanded)}
      />

      <OrderStatusPieChart
        data={orderStatuses}
        title="Phân Bố Trạng Thái Đơn Hàng"
        expanded={isOrderStatusExpanded}
        onToggleExpand={() => setIsOrderStatusExpanded(!isOrderStatusExpanded)}
      />
    </div>
  );
}
