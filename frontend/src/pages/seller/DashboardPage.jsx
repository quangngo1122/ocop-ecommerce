import React, { useState, useContext } from "react";
import { useQuery, gql } from "@apollo/client";
import { AuthContext } from "../../contexts/AuthProvider";
import useCounterAnimation from "../../components/seller/CounterAnimation";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LatestProductList from "../../components/admin/LatestProductList";
import LatestOrderList from "../../components/admin/LatestOrderList";
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
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import RevenueChart from "../../components/common/RevenueChart";
import BestSellingProductsChart from "../../components/common/BestSellingProductsChart";
import RatingChart from "../../components/common/RatingChart";

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

function getBestSellingProducts(orders) {
  const deliveredOrders = orders.filter((order) =>
    order.status_history?.some((s) => s.status === "delivered"),
  );

  const productMap = new Map();

  deliveredOrders.forEach((order) => {
    order.items?.forEach((item) => {
      const productName =
        item.variant?.product_id?.name || "Sản phẩm không tên";
      const quantity = item.quantity || 0;

      if (!productMap.has(productName)) {
        productMap.set(productName, 0);
      }
      productMap.set(productName, productMap.get(productName) + quantity);
    });
  });

  // Convert map -> array
  let products = Array.from(productMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // Sort desc by quantity
  products.sort((a, b) => b.value - a.value);

  // Lấy top 10
  const top10 = products.slice(0, 10);

  // Tính tổng chỉ trong top 10
  const totalTop10 = top10.reduce((sum, p) => sum + p.value, 0);

  // Tính lại % dựa trên tổng top 10
  return top10.map((p) => ({
    ...p,
    percent: totalTop10 > 0 ? ((p.value / totalTop10) * 100).toFixed(0) : 0,
  }));
}

// -----------------------GRAPQL-----------------------

// const GET_CURRENT_USER = gql`
//   query {
//     getCurrentUser {
//       id
//       role
//     }
//   }
// `;

const SHOPS_QUERY = gql`
  query Shops {
    shops {
      items {
        _id
        name
        owner {
          _id
        }
      }
    }
  }
`;

// const MY_SHOP_ORDERS_QUERY = gql`
//   query MyShopOrders {
//     myShopOrders {
//       total
//       items {
//         _id
//         amounts {
//           total
//         }
//       }
//     }
//   }
// `;

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
      # shop_id {
      #   _id
      #   name
      #   owner {
      #     _id
      #   }
      # }
      createdAt
    }
  }
  # }
`;

const MY_SHOP_RAITING = gql`
  query Items($filter: ReviewsFilter) {
    reviews(filter: $filter) {
      items {
        _id
        rating
        product_id {
          _id
          name
        }
      }
    }
  }
`;

const PRODUCTS_QUERY = gql`
  query Products($filter: ProductFilter) {
    products(filter: $filter) {
      total
      # items {
      #   _id
      #   variants {
      #     stock_quantity
      #   }
      # }
      items {
        _id
        name
        images
        price {
          # regular
          max_price
          min_price
        }
        variants {
          stock_quantity
        }
        category_id {
          _id
          name
          parent {
            _id
          }
        }
        # shop_id {
        #   _id
        #   name
        # }
        stock
        status
        createdAt
      }
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

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
];

export default function DashboardPage() {
  const [isConfigInfoExpanded, setIsConfigInfoExpanded] = useState(true);
  const [isConfigChart, setIsConfigChart] = useState(true);
  const [isConfigRating, setIsConfigRating] = useState(true);

  const [chartType, setChartType] = useState("daily");

  // const { data: orderData } = useQuery(MY_SHOP_ORDERS_QUERY);

  //    const { data: currentUserData, loading: userLoading } = useQuery(GET_CURRENT_USER);
  //    const userId = currentUserData?.getCurrentUser?.id;

  const { userData } = useContext(AuthContext);
  const userId = userData?._id;

  //    const { data: shopsData } = useQuery(SHOPS_QUERY);
  //    const shopId = shopsData?.shops?.items?.find(
  //      (shop) => shop.owner?.id === userId
  //    )?.id;

  const { data: shopsData } = useQuery(SHOPS_QUERY);
  const shopId = shopsData?.shops?.items?.find(
    (shop) => shop.owner?._id === userId,
  )?._id;
  const { data: productsData, loading: productsLoading } = useQuery(
    PRODUCTS_QUERY,
    {
      variables: { filter: { shopId } },
      skip: !shopId,
      // fetchPolicy: "network-only",
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    },
  );

  const { data: myShopRaiting } = useQuery(MY_SHOP_RAITING, {
    variables: { filter: { shop_id: shopId } },
    // fetchPolicy: "network-only",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const ratingsData = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  if (myShopRaiting?.reviews?.items) {
    myShopRaiting.reviews.items.forEach((review) => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        ratingsData[rating] += 1;
      }
    });
  }

  const totalRatings = Object.values(ratingsData).reduce(
    (acc, val) => acc + val,
    0,
  );

  const averageRating =
    totalRatings > 0
      ? Object.entries(ratingsData).reduce(
          (sum, [star, count]) => sum + parseInt(star) * count,
          0,
        ) / totalRatings
      : 0;

  const roundedUpRating = Math.ceil(averageRating);

  const formattedAverageRating = averageRating.toFixed(2);

  const ratingPercentages = Object.entries(ratingsData).map(
    ([star, count]) => ({
      star: parseInt(star),
      count,
      percent: totalRatings > 0 ? ((count / totalRatings) * 100).toFixed(0) : 0,
    }),
  );

  const { data: orderData } = useQuery(MY_SHOP_ORDERS_QUERY, {
    variables: { filter: { shopId } },
    // fetchPolicy: "network-only",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  // const totalorder = orderData?.myShopOrders?.total ?? 0;
  // const orders = orderData?.myShopOrders?.items || [];

  const orders = orderData?.shopOrders || [];
  const totalorder = orders.length;

  const deliveredOrders = orders.filter((order) =>
    order.status_history?.some((s) => s.status === "delivered"),
  );

  // Doanh thu chỉ lấy từ order delivered
  const revenue = deliveredOrders.reduce(
    (sum, order) => sum + (order.amounts?.total || 0),
    0,
  );

  // const revenue = orders.reduce(
  //   (sum, order) => sum + (order.amounts?.total || 0),
  //   0
  // );

  const dataStock = productsData?.products?.items || [];

  const totalStock = dataStock.reduce((sum, product) => {
    const productStock = product.variants?.reduce(
      (variantSum, variant) => variantSum + (variant.stock_quantity || 0),
      0,
    );
    return sum + productStock;
  }, 0);

  const totalProducts = productsData?.products?.total || 0;
  const productCount = useCounterAnimation(totalProducts);
  const orderCount = useCounterAnimation(totalorder);
  const revenueCount = useCounterAnimation(revenue);

  const stockCount = useCounterAnimation(totalStock);

  // ---------------------------------------------------
  // const revenueData = getRevenueDataFromOrders(orders);
  const revenueData = getRevenueDataFromOrders(deliveredOrders, chartType);
  // const revenueData = getRevenueDataFromOrders(orders, chartType);

  const bestSellingProducts = getBestSellingProducts(orders);
  // ---------------------------------------------------

  const currentMonth = dayjs().format("MM");
  const currentYear = dayjs().format("YYYY");

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const categories = categoriesData?.categories?.items || [];
  const categoriesMap = categories.reduce((map, cat) => {
    map[cat._id] = cat.name;
    return map;
  }, {});

  const latestProducts = Array.isArray(dataStock)
    ? [...dataStock]
        .filter((prod) => prod.status === "pending")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    : [];

  // Lấy 10 đơn hàng gần nhất
  const latestOrders = Array.isArray(orders)
    ? [...orders]
        .filter(
          (order) => order.current_status === "pending",
          // ||
          //   order.current_status === "confirmed" ||
          //   order.current_status === "preparing" ||
          //   order.current_status === "transit"
        )
        .sort(
          (a, b) =>
            new Date(b.status_history?.[0]?.updatedAt || b.createdAt) -
            new Date(a.status_history?.[0]?.updatedAt || a.createdAt),
        )
        .slice(0, 10)
    : [];

  const navigate = useNavigate();
  const handleReiview = () => {
    navigate("/seller/reviews");
  };

  // Cấu hình danh sách card
  const statsCards = [
    {
      title: "Tổng Doanh Thu",
      value: revenueCount.toLocaleString("vi-VN") + "đ",
      bgColor: "bg-red-500",
      icon: "💰",
      desc: "Thống kê bán hàng",
      link: "/seller/statistical",
    },
    {
      title: "Tổng Tồn Kho",
      value: stockCount,
      bgColor: "bg-yellow-500",
      icon: "📦",
      desc: "",
      link: "",
    },
    {
      title: "Tổng Đơn Hàng",
      value: orderCount,
      bgColor: "bg-green-500",
      icon: "🛒",
      desc: "Quản lý đơn hàng",
      link: "/seller/orders",
    },
    {
      title: "Tổng Sản Phẩm",
      value: productCount,
      bgColor: "bg-blue-500",
      icon: "🏪",
      desc: "Quản lý sản phẩm",
      link: "/seller/products",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bảng Điều Khiển</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4  gap-6 mb-6">
        {statsCards.map((card, index) => (
          <div
            key={index}
            onClick={() => navigate(`${card.link}`)}
            className={`${card.bgColor} ${card.bgColor} ${
              card.link ? "cursor-pointer" : ""
            } text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-transform-shadow hover:scale-102`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-75">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
              <div className="text-4xl opacity-75">{card.icon}</div>
            </div>
            {card.desc && (
              <div
                onClick={() => navigate(`${card.link}`)}
                className="cursor-pointer hover:text-[blue] text-sm text-gray-700 mt-2"
              >
                {card.desc}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section */}

      <div className="grid grid-cols-1 gap-6 mb-8">
        {/* Biểu đồ doanh thu */}
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
      {/* 10 đơn hàng mới nhất */}
      <LatestOrderList orders={latestOrders} />
      {/* 10 sản phẩm mới nhất */}
      <LatestProductList
        products={latestProducts}
        categoriesMap={categoriesMap}
      />
    </div>
  );
}
