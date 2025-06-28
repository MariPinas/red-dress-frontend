// src/components/ProductInfo.tsx
import React, { useEffect, useState } from "react";
import { getProductQuantity } from "../api/productApi";
import vestidoImg from "../assets/vestidoVermelho.jpg";

export default function ProductInfo() {
  const [quantity, setQuantity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuantity() {
      try {
        const quantidade = await getProductQuantity("vestidovermelho");
        setQuantity(quantidade);
      } catch (error) {
        console.error("Erro ao buscar a quantidade:", error);
        setQuantity(null);
      } finally {
        setLoading(false);
      }
    }

    fetchQuantity();
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Vestido Vermelho</h1>
      <img src={vestidoImg} alt="Vestido vermelho" style={styles.image} />
      <p style={styles.text}>
        {loading
          ? "Carregando estoque..."
          : quantity !== null
          ? `Quantidade em estoque: ${quantity}`
          : "Erro ao carregar estoque."}
      </p>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#722F37", // rosinha bebê
    borderRadius: "1rem",
    maxWidth: "400px",
    margin: "2rem auto",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#e2e1e1",
  },
  image: {
    borderRadius: "1rem",
    marginBottom: "1rem",
    width: "20rem",
  },
  text: {
    fontSize: "1.1rem",
    color: "#e2e1e1",
  },
};
