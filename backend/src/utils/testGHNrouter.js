import express from "express";
import { createGHNOrder } from "./api.js";

const router = express.Router();

router.post("/test-ghn", async (req, res) => {
  try {
    const { shopOrder, variantsInfo } = req.body;

    const orderCode = await createGHNOrder(shopOrder, variantsInfo);
    res.json({ success: true, orderCode });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
      details: error.details || null,
    });
  }
});

export default router;
