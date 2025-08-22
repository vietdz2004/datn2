const jwt = require("jsonwebtoken");
const { sequelize } = require("../models/database");
const { QueryTypes } = require("sequelize");
const { OAuth2Client } = require("google-auth-library");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id_NguoiDung,
      email: user.email,
      vaiTro: user.vaiTro,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
};

const formatUserData = (user) => {
  return {
    id_NguoiDung: user.id_NguoiDung,
    ten: user.ten,
    email: user.email,
    soDienThoai: user.soDienThoai,
    diaChi: user.diaChi,
    vaiTro: user.vaiTro,
    trangThai: user.trangThai,
  };
};

// Expose current Google config for quick diagnostics
exports.googleConfig = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        googleClientId: process.env.GOOGLE_CLIENT_ID || null,
        nodeEnv: process.env.NODE_ENV || null,
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "ID Token không được cung cấp",
      });
    }

    const expectedAudience = process.env.GOOGLE_CLIENT_ID;
    if (!expectedAudience) {
      console.error("Google Login Error: GOOGLE_CLIENT_ID is not configured in backend env");
      return res.status(500).json({
        success: false,
        message: "Server chưa cấu hình GOOGLE_CLIENT_ID",
      });
    }

    // Initialize client with expected audience
    const client = new OAuth2Client(expectedAudience);

    console.log("[GoogleLogin] Verifying ID token...", {
      tokenLength: idToken?.length,
      expectedAudience,
    });

    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: expectedAudience,
    });

    const payload = ticket.getPayload();

    // Extra validation & diagnostics
    const { aud, iss, email, email_verified, sub } = payload || {};
    console.log("[GoogleLogin] Token payload:", {
      aud,
      iss,
      email,
      email_verified,
      sub,
    });
    if (aud !== expectedAudience) {
      console.error("[GoogleLogin] Audience mismatch", { aud, expectedAudience });
      return res.status(400).json({
        success: false,
        message: "Token không hợp lệ (audience mismatch)",
      });
    }
    const validIssuers = ["accounts.google.com", "https://accounts.google.com"];
    if (iss && !validIssuers.includes(iss)) {
      console.error("[GoogleLogin] Invalid issuer", { iss });
      return res.status(400).json({ success: false, message: "Token không hợp lệ (issuer)" });
    }

    if (!payload.email_verified) {
      return res.status(400).json({
        success: false,
        message: "Email chưa được xác thực bởi Google",
      });
    }

    const googleUser = {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      verified: payload.email_verified,
    };

    const existingUserQuery = `
      SELECT * FROM nguoidung 
      WHERE email = ?
      LIMIT 1
    `;

    const existingUsers = await sequelize.query(existingUserQuery, {
      replacements: [googleUser.email],
      type: QueryTypes.SELECT,
    });

    let user;

    if (existingUsers.length > 0) {
      user = existingUsers[0];
    } else {
      const insertQuery = `
        INSERT INTO nguoidung (
          ten, email, vaiTro, trangThai, ngayTao
        ) VALUES (?, ?, 'KHACH_HANG', 'HOAT_DONG', NOW())
      `;

      const result = await sequelize.query(insertQuery, {
        replacements: [googleUser.name, googleUser.email],
        type: QueryTypes.INSERT,
      });

      const newUserQuery = `
        SELECT * FROM nguoidung WHERE id_NguoiDung = ?
      `;

      const newUsers = await sequelize.query(newUserQuery, {
        replacements: [result[0]],
        type: QueryTypes.SELECT,
      });

      user = newUsers[0];
    }

    const token = generateToken(user);
    const userData = formatUserData(user);

    res.json({
      success: true,
      data: {
        token,
        user: userData,
      },
      message: "Đăng nhập Google thành công",
    });
  } catch (error) {
    console.error("Google Login Error:", {
      message: error?.message,
      name: error?.name,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
    const status = error?.message?.includes("Wrong recipient") || error?.message?.includes("audience")
      ? 400
      : 400;
    res.status(status).json({
      success: false,
      message: "Lỗi xác thực Google",
      error: error.message,
    });
  }
};

module.exports = exports;
