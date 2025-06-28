import api from "./api";

export async function getProductQuantity(name: string) {
  const response = await api.get("/product/quantity", {
    params: { name },
  });
  const quantidade = response.data.quantity?.[0]?.quantity;
  return quantidade;
}

export async function addProduct(
  name: string,
  quantity: number
): Promise<number> {
  const response = await api.post("/product/add", {
    name,
    quantity,
  });

  return response.data.product.quantity;
}

export async function removeProduct(
  name: string,
  quantity: number
): Promise<number> {
  const response = await api.post("/product/remove", {
    name,
    quantity,
  });

  return response.data.product.quantity;
}
