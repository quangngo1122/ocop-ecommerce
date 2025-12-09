import admin from "../config/firebase-admin.js";

const getTokenFromRequest = (req) => {
  // Lấy token từ header Authorization
  const authHeader = req.headers.authorization;
  // console.log("authHeader ====:", req.headers);
  if (!authHeader) return null;

  // Kiểm tra và xử lý token với hoặc không có prefix "Bearer"
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7); // Bỏ "Bearer " ở đầu
  }

  // Nếu không có "Bearer", sử dụng toàn bộ giá trị header
  return authHeader;
};

const authMiddleware = async (req) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return { token: null };

    // Verify token với Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Trả về token đã được verify và thông tin decoded
    return {
      token,
      decodedToken,
    };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return { token: null };
  }
};

export default authMiddleware;
