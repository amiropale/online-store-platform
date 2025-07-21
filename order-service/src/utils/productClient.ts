import axios from "axios";
import { Product } from "../types/product";

const PRODUCT_SERVICE_URL = "http://product-service:3002";

export const checkProductAvailability = async (
  productId: string,
  quantity: number,
  token?: string
): Promise<boolean> => {
  try {
    const res = await axios.get<Product>(`${PRODUCT_SERVICE_URL}/products/${productId}`, {
      headers: token ? { Authorization: token } : {},
    });

    const product = res.data;

    return product.inStock >= quantity;
  } catch (err) {
    console.error(`❌ Error checking product ${productId}:`, err);
    return false;
  }
};