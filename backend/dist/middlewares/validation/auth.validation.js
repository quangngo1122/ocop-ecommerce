"use strict";

// const { UserInputError } = require("apollo-server-express");

function validateRegisterInput(input) {
  var errors = {};

  // Validate email
  if (!input.email) {
    errors.email = "Email là bắt buộc";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    errors.email = "Email không hợp lệ";
  }

  // Validate password
  if (!input.password) {
    errors.password = "Mật khẩu là bắt buộc";
  } else if (input.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }
  // Validate fullName
  if (!input.fullName) {
    errors.fullName = "Họ tên là bắt buộc";
  } else if (input.fullName.length < 2 || input.fullName.length > 50) {
    errors.fullName = "Họ tên phải từ 2-50 ký tự";
  }

  // Validate phoneNumber (optional)
  if (input.phoneNumber && input.phoneNumber.trim()) {
    if (!/^(0|\+84)[0-9]{9}$/.test(input.phoneNumber.replace(/\s+/g, ""))) {
      errors.phoneNumber = "Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx)";
    }
  }
  return {
    errors: errors,
    isValid: Object.keys(errors).length === 0
  };
}
module.exports = {
  validateRegisterInput: validateRegisterInput
};