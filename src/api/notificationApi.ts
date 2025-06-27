import api from "./api";

export async function subscribe(email: string, product: string) {
  const response = await api.post("/notify/subscribe", {
    email,
    product,
  });
  return response.data;
}

export async function unsubscribe(email: string, product: string) {
  const response = await api.post("/notify/unsubscribe", {
    email,
    product,
  });
  return response.data;
}
