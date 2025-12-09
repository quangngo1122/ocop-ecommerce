import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "44e60f2443d4.ngrok-free.app", // thêm domain ngrok
    ],
  },
});
