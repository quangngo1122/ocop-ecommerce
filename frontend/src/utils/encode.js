// utils/encode.js
export const encodeId = (id) => btoa(id); // mã hóa ID sang Base64
export const decodeId = (str) => atob(str); // giải mã ID từ Base64
