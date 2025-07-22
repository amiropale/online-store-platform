import axios from "axios";

const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL;

export const getOrderById = async (orderId: string, token: string) => {
  try {
    const res = await axios.get(`${ORDER_SERVICE_URL}/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    console.error("❌ Failed to fetch order:", err);
    throw new Error("Order fetch failed");
  }
};