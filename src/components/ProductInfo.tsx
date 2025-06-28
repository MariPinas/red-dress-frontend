import React, { useEffect, useState } from "react";
import { getProductQuantity, removeProduct } from "../api/productApi";
import { subscribe } from "../api/notificationApi";
import vestidoImg from "../assets/vestidoVermelho.jpg";

export default function ProductInfo() {
  const productName = "vestido vermelho";

  const [quantity, setQuantity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyQuantity, setBuyQuantity] = useState(1);

  const [email, setEmail] = useState("");
  const [notificationStatus, setNotificationStatus] = useState<string | null>(
    null
  );
  const [isNotifying, setIsNotifying] = useState(false);

  const [buyStatus, setBuyStatus] = useState<string | null>(null);
  const [isBuying, setIsBuying] = useState(false);

  useEffect(() => {
    async function fetchQuantity() {
      try {
        const quantityResponse = await getProductQuantity(productName);
        setQuantity(quantityResponse);
      } catch (error) {
        console.error("Erro ao buscar a quantidade:", error);
        setQuantity(null);
      } finally {
        setLoading(false);
      }
    }

    fetchQuantity();
  }, []);

  const [wsStatus, setWsStatus] = useState("Conectando...");

  useEffect(() => {
    async function fetchQuantity() {
      try {
        const quantityResponse = await getProductQuantity(productName);
        setQuantity(quantityResponse);
      } catch (error) {
        console.error("Erro ao buscar a quantidade:", error);
        setQuantity(null);
      } finally {
        setLoading(false);
      }
    }

    fetchQuantity();
  }, []);

  useEffect(() => {
    const socket = new WebSocket("wss://localhost:3040");

    socket.onopen = () => {
      console.log("...Conectado ao WebSocket do servidor.");
      setWsStatus("Conectado");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "STOCK_UPDATE") {
        setQuantity(data.quantity);
        setNotificationStatus(data.message);
        setTimeout(() => setNotificationStatus(null), 10000);
      }
    };

    socket.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
      setNotificationStatus(
        "Erro na conexão em tempo real. Recarregue a página."
      );
      setWsStatus("Erro na conexão");
    };

    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log(`Conexão fechada limpa, código=${event.code}`);
        setWsStatus("Desconectado");
      } else {
        console.error("Conexão perdida");
        setWsStatus("Conexão perdida");
      }
    };
    return () => socket.close();
  }, []);

  async function handleSubscribe() {
    if (!email) {
      setNotificationStatus("Por favor, insira um email válido.");
      return;
    }
    setIsNotifying(true);
    setNotificationStatus(null);
    try {
      await subscribe(email, productName);
      setNotificationStatus(
        "Inscrição realizada com sucesso! Você será notificado."
      );
      setEmail("");
    } catch (error) {
      setNotificationStatus(
        "Erro ao inscrever: " + (error || "Tente novamente")
      );
    } finally {
      setIsNotifying(false);
    }
  }

  async function handleBuy() {
    if (!buyQuantity || buyQuantity < 1) {
      setBuyStatus("Informe uma quantidade válida para comprar.");
      return;
    }
    if (quantity === null || buyQuantity > quantity) {
      setBuyStatus("Quantidade indisponível em estoque.");
      return;
    }

    setIsBuying(true);
    setBuyStatus(null);
    try {
      await removeProduct(productName, buyQuantity);
      setQuantity((prev) => (prev !== null ? prev - buyQuantity : null));
      setBuyStatus("Compra realizada com sucesso!");
    } catch (error) {
      setBuyStatus("Erro ao realizar compra. Tente novamente." + error);
    } finally {
      setIsBuying(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.statusBar}>Conexão: {wsStatus}</div>

      {notificationStatus && (
        <div style={styles.stockNotification}>{notificationStatus}</div>
      )}
      <h1 style={styles.title}>
        {productName.charAt(0).toUpperCase() + productName.slice(1)}
      </h1>
      <img src={vestidoImg} alt={productName} style={styles.image} />
      <p style={styles.text}>
        {loading
          ? "Carregando estoque..."
          : quantity !== null
          ? `Quantidade em estoque: ${quantity}`
          : "Erro ao carregar estoque."}
      </p>

      {quantity !== null && quantity > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <input
            type="number"
            min={1}
            max={quantity}
            value={buyQuantity}
            onChange={(e) => setBuyQuantity(Number(e.target.value))}
            style={styles.input}
            disabled={isBuying}
          />
          <button onClick={handleBuy} disabled={isBuying} style={styles.button}>
            {isBuying ? "Processando compra..." : "Comprar"}
          </button>
          {buyStatus && <p style={styles.notification}>{buyStatus}</p>}
        </div>
      )}

      {quantity === 0 && (
        <div style={{ marginTop: 20 }}>
          <input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            disabled={isNotifying}
          />
          <button
            onClick={handleSubscribe}
            disabled={isNotifying}
            style={styles.button}
          >
            {isNotifying
              ? "Inscrevendo..."
              : "Notificar quando estiver em estoque"}
          </button>
          {notificationStatus && (
            <p style={styles.notification}>{notificationStatus}</p>
          )}
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    textAlign: "center",
    padding: "2rem",
    backgroundColor: "#5f1f29", // rosinha bebê
    borderRadius: "1rem",
    maxWidth: "400px",
    margin: "2rem auto",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  title: {
    color: "#e9e9e9",
  },
  image: {
    borderRadius: "1rem",
    marginBottom: "1rem",
    width: "20rem",
  },
  text: {
    fontSize: "1.1rem",
    color: "#e9e9e9",
  },
  input: {
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #ccc",
    marginRight: "0.5rem",
    width: "80px",
    backgroundColor: "#030303", // fundo preto
    color: "#e9e9e9",
  },
  button: {
    padding: "0.5rem 1rem",
    marginTop: "1rem",
    fontSize: "1rem",
    borderRadius: "0.5rem",
    backgroundColor: "#030303",
    color: "#e9e9e9",
    border: "none",
    cursor: "pointer",
  },
  notification: {
    marginTop: "1rem",
    fontSize: "0.9rem",
    color: "#ffffff",
  },
};
