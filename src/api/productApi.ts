import api from "./api";

export async function getProductQuantity(name: string) {
  const response = await api.get("/product/quantity", {
    params: { name },
  });
  return response.data;
}

export async function addProduct(name: string, quantity: number) {
  const response = await api.post("/product/add", {
    name,
    quantity,
  });
  return response.data;
}

export async function removeProduct(name: string, quantity: number) {
  const response = await api.post("/product/remove", {
    name,
    quantity,
  });
  return response.data;
}
