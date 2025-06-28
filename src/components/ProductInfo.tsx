import React, { useEffect, useState } from "react";
import { getProductQuantity, removeProduct } from "../api/productApi";
import vestidoImg from "../assets/vestidoVermelho.jpg";

export default function ProductInfo() {
  const [quantity, setQuantity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyAmount, setBuyAmount] = useState<number>(1);
  const productName = "vestidovermelho";

  useEffect(() => {
    fetchQuantity();
  }, []);

  async function fetchQuantity() {
    try {
      const quantidade = await getProductQuantity(productName);
      setQuantity(quantidade);
    } catch (error) {
      console.error("Erro ao buscar a quantidade:", error);
      setQuantity(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleBuy() {
    if (buyAmount <= 0) return alert("Quantidade inválida.");
    if (quantity !== null && buyAmount > quantity) {
      return alert("Estoque insuficiente.");
    }

    try {
      await removeProduct(productName, buyAmount);
      alert(`Compra de ${buyAmount} unidade(s) realizada com sucesso!`);
      fetchQuantity(); // Atualiza estoque
    } catch (err) {
      console.error("Erro ao comprar:", err);
      alert("Erro ao realizar a compra.");
    }
  }

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

      {!loading && quantity !== null && quantity > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <input
            type="number"
            value={buyAmount}
            onChange={(e) => setBuyAmount(Number(e.target.value))}
            min={1}
            max={quantity}
            style={styles.input}
          />
          <button onClick={handleBuy} style={styles.button}>
            Comprar
          </button>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#722F37",
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
  input: {
    padding: "0.5rem",
    width: "4rem",
    marginRight: "1rem",
    borderRadius: "0.5rem",
  },
  button: {
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    backgroundColor: "#e9e1e1",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
