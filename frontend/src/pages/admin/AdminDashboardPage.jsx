import React, { useState, useEffect } from "react";
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
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import VisibilityIcon from "@mui/icons-material/Visibility";

import { useQuery, gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import useCounterAnimation from "../../components/seller/CounterAnimation";
import ColAllPageSeller from "../../components/seller/ColAllPageSeller";

import PaidIcon from "@mui/icons-material/Paid";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import StorefrontIcon from "@mui/icons-material/Storefront";
import GroupIcon from "@mui/icons-material/Group";
import Face4Icon from "@mui/icons-material/Face4";
import LatestProductList from "../../components/admin/LatestProductList";
import LatestOrderList from "../../components/admin/LatestOrderList";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import RevenueChart from "../../components/common/RevenueChart";
import BestSellingProductsChart from "../../components/common/BestSellingProductsChart";
import RatingChart from "../../components/common/RatingChart";

// -----------------------GRAPQL-----------------------
const PRODUCTS_QUERY = gql`
  query Products($pagination: PaginationInput) {
    products(pagination: $pagination) {
      total
      items {
        _id
        name
        images
        price {
          # regular
          max_price
          min_price
        }
        category_id {
          _id
          name
          parent {
            _id
          }
        }
        shop_id {
          _id
          name
        }
        stock
        status
        createdAt
      }
    }
  }
`;
const SHOP_ORDERS_QUERY = gql`
  # query ShopOrders {
  #   shopOrders {
  #     total
  #     items {
  #       _id
  #       amounts {
  #         total
  #       }
  #     }
  #   }
  # }

  query ShopOrders {
    shopOrders {
      # _id
      # amounts {
      #   total
      # }

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
      shop_id {
        _id
        name
        owner {
          _id
        }
      }
      createdAt
    }
  }
`;
const USERS_QUERY = gql`
  query Users {
    users {
      _id
      role
    }
  }
`;

const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      items {
        _id
        name
        parent {
          _id
          name
        }
      }
    }
  }
`;

const SHOPS_QUERY = gql`
  query Shops {
    shops {
      total
    }
  }
`;

const ALL_REVIEWS_QUERY = gql`
  query AllReviews {
    reviews {
      items {
        _id
        rating
      }
    }
  }
`;
// -----------------------end GRAPQL-----------------------
const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
];
// Hàm lấy dữ liệu doanh thu theo ngày/tháng
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
      const orderDate = dayjs(
        order.status_history?.[0]?.updatedAt || order.createdAt
      );
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
      const orderDate = dayjs(
        order.status_history?.[0]?.updatedAt || order.createdAt
      );
      if (orderDate.year() === currentYear) {
        const monthIndex = orderDate.month();
        chartData[monthIndex].total += order.amounts?.total || 0;
      }
    });

    return chartData;
  }
}

// Hàm lấy sản phẩm bán chạy nhất
function getBestSellingProducts(orders) {
  const deliveredOrders = orders.filter((order) =>
    order.status_history?.some((s) => s.status === "delivered")
  );

  const productMap = new Map();

  deliveredOrders.forEach((order) => {
    order.items?.forEach((item) => {
      const productName =
        item.variant?.product_id?.name ||
        item.product?.name ||
        "Sản phẩm không tên";
      const quantity = item.quantity || 0;

      if (!productMap.has(productName)) {
        productMap.set(productName, 0);
      }
      productMap.set(productName, productMap.get(productName) + quantity);
    });
  });

  let products = Array.from(productMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  products.sort((a, b) => b.value - a.value);

  const top10 = products.slice(0, 10);
  const totalTop10 = top10.reduce((sum, p) => sum + p.value, 0);

  return top10.map((p) => ({
    ...p,
    percent: totalTop10 > 0 ? ((p.value / totalTop10) * 100).toFixed(0) : 0,
  }));
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [isConfigInfoExpanded, setIsConfigInfoExpanded] = useState(true);
  const [isConfigChart, setIsConfigChart] = useState(true);
  const [isConfigRating, setIsConfigRating] = useState(true);
  const [chartType, setChartType] = useState("daily");
  // Query 8 sản phẩm mới nhất
  const { data: productsData, loading: productsLoading } = useQuery(
    PRODUCTS_QUERY,
    {
      variables: { pagination: { limit: 10, offset: 0 } },
      fetchPolicy: "network-only",
    }
  );

  const { data: ordersData, loading: ordersLoading } =
    useQuery(SHOP_ORDERS_QUERY);

  const { data, loading, error } = useQuery(USERS_QUERY);
  // const [displayNumber, setDisplayNumber] = useState(0);
  // const [displayShops, setDisplayShops] = useState(0);

  // Query danh mục
  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const categories = categoriesData?.categories?.items || [];

  // Tạo map để tra nhanh tên danh mục theo _id
  const categoriesMap = categories.reduce((map, cat) => {
    map[cat._id] = cat.name;
    return map;
  }, {});
  const products = productsData?.products?.items || [];
  const customer = data?.users?.filter((u) => u.role === "user").length || 0;

  const seller = data?.users?.filter((u) => u.role === "seller").length || 0;

  // Query tổng shop
  const { data: shopsData } = useQuery(SHOPS_QUERY);
  const totalShops = shopsData?.shops?.total ?? 0;
  const totalproduct = productsData?.products?.total ?? 0;

  // const totalorder = ordersData?.shopOrders?.total ?? 0;
  // const orders = ordersData?.shopOrders?.items || [];

  const orders = ordersData?.shopOrders || [];
  const totalorder = orders.length;
  // const totalorder = ordersData?.shopOrders?.filter((u) => u._id !== "undifine").length ?? 0;

  // Lọc ra order đã giao thành công
  const deliveredOrders = orders.filter((order) =>
    order.status_history?.some((s) => s.status === "delivered")
  );

  // Doanh thu chỉ lấy từ order delivered
  const revenue = deliveredOrders.reduce(
    (sum, order) => sum + (order.amounts?.total || 0),
    0
  );

  // const revenue = orders.reduce(
  //   (sum, order) => sum + (order.amounts?.total || 0),
  //   0
  // );

  const { data: allReviewsData } = useQuery(ALL_REVIEWS_QUERY, {
    fetchPolicy: "network-only",
  });
  const ratingsData = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (allReviewsData?.reviews?.items) {
    allReviewsData.reviews.items.forEach((review) => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingsData[rating] += 1;
      }
    });
  }
  const totalRatings = Object.values(ratingsData).reduce(
    (acc, val) => acc + val,
    0
  );
  const averageRating =
    totalRatings > 0
      ? Object.entries(ratingsData).reduce(
          (sum, [star, count]) => sum + parseInt(star) * count,
          0
        ) / totalRatings
      : 0;
  const roundedUpRating = Math.ceil(averageRating);
  const formattedAverageRating = averageRating.toFixed(2);
  const ratingPercentages = Object.entries(ratingsData).map(
    ([star, count]) => ({
      star: parseInt(star),
      count,
      percent: totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(0) : 0,
    })
  );
  // const revenueCount = revenue.toLocaleString("vi-VN") + "đ";
  const revenueCount = useCounterAnimation(revenue);

  // useEffect(() => {
  //   if (customer > 0) {
  //     let current = 0;
  //     const interval = setInterval(() => {
  //       current += 1;
  //       setDisplayNumber(current);
  //       if (current >= customer) {
  //         clearInterval(interval);
  //       }
  //     }, 50); // tốc độ (ms)
  //     return () => clearInterval(interval);
  //   }
  // }, [customer]);

  //  useEffect(() => {
  //   if (totalShops > 0) {
  //     let current = 0;
  //     const interval = setInterval(() => {
  //       current += 1;
  //       setDisplayShops(current);
  //       if (current >= totalShops) {
  //         clearInterval(interval);
  //       }
  //     }, 50);
  //     return () => clearInterval(interval);
  //   }
  // }, [totalShops]);

  const customerCount = useCounterAnimation(customer);
  const sellerCount = useCounterAnimation(seller);
  const productCount = useCounterAnimation(totalproduct);
  const shopCount = useCounterAnimation(totalShops);
  const orderCount = useCounterAnimation(totalorder);

  const stats = [
    {
      label: "DOANH THU",
      value: revenueCount.toLocaleString("vi-VN") + "đ",
      // desc: "View all transactions",
      desc: "",
      icon: <PaidIcon />,
      iconColor: "",
      textColor: "text-green-800",
      bgColor: "bg-green-500",
      link: "",
    },
    {
      label: "ĐƠN HÀNG",
      value: orderCount,
      desc: "Quản lý đơn hàng",
      icon: <ShoppingBagIcon />,
      iconColor: "",
      textColor: "text-red-800",
      bgColor: "bg-red-500",
      link: "/admin/order/",
    },
    {
      label: "CỬA HÀNG",
      value: shopCount,
      // value: displayShops,
      desc: "Quản lý cửa hàng",
      icon: <StorefrontIcon />,
      iconColor: "",

      textColor: "text-orange-800",
      bgColor: "bg-orange-400",
      link: "/admin/shop/",
    },
    {
      label: "KHÁCH HÀNG",
      value: customerCount,
      // value: displayNumber,
      desc: "Quản lý khách hàng",
      icon: <GroupIcon />,
      iconColor: "",
      textColor: "text-yellow-800",
      bgColor: "bg-yellow-500",
      link: "/admin/user/",
    },
    {
      label: "SẢN PHẨM",
      value: productCount,
      // value: displayNumber,
      desc: "Quản lý sản phẩm",
      icon: <ShoppingCartIcon />,
      iconColor: "",
      textColor: "text-teal-800",
      bgColor: "bg-teal-400",
      link: "/admin/product/",
    },
    {
      label: "NGƯỜI BÁN",
      value: sellerCount,
      // value: displayNumber,
      desc: "Quản lý người bán",
      icon: <Face4Icon />,
      iconColor: "",
      textColor: "text-blue-800",
      bgColor: "bg-blue-500",
      link: "/admin/seller/",
    },
  ];

  // const revenueData = getRevenueDataFromOrders(orders, chartType);

  const revenueData = getRevenueDataFromOrders(deliveredOrders, chartType);

  const bestSellingProducts = getBestSellingProducts(orders);

  const latestOrders = Array.isArray(orders)
    ? [...orders]
        .filter(
          (order) =>
            order.current_status === "pending" ||
            order.current_status === "confirmed"
        )
        .sort(
          (a, b) =>
            new Date(b.status_history?.[0]?.updatedAt || b.createdAt) -
            new Date(a.status_history?.[0]?.updatedAt || a.createdAt)
        )
        .slice(0, 10)
    : [];
  const latestProducts = Array.isArray(products)
    ? [...products]
        .filter((prod) => prod.status === "pending")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-orange-200 rounded-sm inline-block" />
        Dashboard
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            onClick={() => navigate(`${stat.link}`)}
            className={`${stat.bgColor} ${
              stat.link ? "cursor-pointer" : ""
            } text-white p-6 rounded-lg shadow-lg hover:shadow-xl  hover:scale-102 transition-transform-shadow `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-semibold opacity-75 ${stat.textColor}`}
                >
                  {stat.label}
                </p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`text-4xl opacity-75 ${stat.iconColor}`}>
                {stat.icon}
              </div>
            </div>
            {stat.desc && (
              <div
                onClick={() => navigate(`${stat.link}`)}
                className="cursor-pointer hover:text-[blue] text-sm text-gray-700 mt-2"
              >
                {stat.desc}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Biểu đồ doanh thu */}

        <RevenueChart
          data={revenueData}
          chartType={chartType}
          onChartTypeChange={setChartType}
          title={
            chartType === "daily"
              ? `Doanh Thu Tháng ${dayjs().format("MM/YYYY")}`
              : `Doanh Thu Theo Tháng Năm ${dayjs().format("YYYY")}`
          }
          expanded={isConfigInfoExpanded}
          onToggleExpand={() => setIsConfigInfoExpanded(!isConfigInfoExpanded)}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Biểu đồ sản phẩm bán chạy */}

        <BestSellingProductsChart
          data={bestSellingProducts}
          expanded={isConfigChart}
          onToggleExpand={() => setIsConfigChart(!isConfigChart)}
        />

        {/* biểu đồ đánh giá */}

        <RatingChart
          average={formattedAverageRating}
          roundedUp={roundedUpRating}
          total={totalRatings}
          percentages={ratingPercentages}
          expanded={isConfigRating}
          onToggleExpand={() => setIsConfigRating(!isConfigRating)}
        />
      </div>
      {/* Sản phẩm mới nhất */}
      <LatestOrderList orders={latestOrders} />
      <LatestProductList
        products={latestProducts}
        categoriesMap={categoriesMap}
      />
      {/* order mới nhất */}
    </div>
  );
}
