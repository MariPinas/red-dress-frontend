import React, { useEffect, useState } from "react";
import { getProductQuantity, removeProduct } from "../api/productApi";
import { subscribe, unsubscribe } from "../api/notificationApi";
import vestidoImg from "../assets/vestidoVermelho.jpg";

export default function ProductInfo() {
  const productName = "vestido vermelho";

  const [quantity, setQuantity] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [email, setEmail] = useState("");

  // Estados separados para diferentes tipos de notificação
  const [stockNotification, setStockNotification] = useState<string | null>(
    null
  );
  const [operationStatus, setOperationStatus] = useState<string | null>(null);

  const [isNotifying, setIsNotifying] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [wsStatus, setWsStatus] = useState("Conectando...");
  const [isSubscribed, setIsSubscribed] = useState(false);

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

    const savedSubscription = localStorage.getItem(`subscribed_${productName}`);
    if (savedSubscription) {
      setIsSubscribed(true);
      setEmail(savedSubscription);
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
        // Atualiza o estoque com o valor recebido do servidor
        setQuantity(data.quantity);

        // Mostra a notificação específica de estoque
        setStockNotification(data.message);

        // Remove após 10 segundos
        setTimeout(() => setStockNotification(null), 10000);
      }
    };

    socket.onerror = (error) => {
      console.error("Erro no WebSocket:", error);
      setOperationStatus("Erro na conexão em tempo real. Recarregue a página.");
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
      setOperationStatus("Por favor, insira um email válido.");
      return;
    }
    setIsNotifying(true);
    setOperationStatus(null);
    try {
      await subscribe(email, productName);
      setOperationStatus(
        "Inscrição realizada com sucesso! Você será notificado."
      );
      setIsSubscribed(true);
      localStorage.setItem(`subscribed_${productName}`, email);
    } catch (error) {
      setOperationStatus("Erro ao inscrever: " + (error || "Tente novamente"));
    } finally {
      setIsNotifying(false);
    }
  }

  async function handleUnsubscribe() {
    if (!email) {
      setOperationStatus("Erro ao cancelar inscrição: email não encontrado");
      return;
    }

    setIsUnsubscribing(true);
    setOperationStatus(null);
    try {
      await unsubscribe(email, productName);
      setOperationStatus("Inscrição cancelada com sucesso.");
      setIsSubscribed(false);
      localStorage.removeItem(`subscribed_${productName}`);
    } catch (error) {
      setOperationStatus(
        "Erro ao cancelar inscrição: " + (error || "Tente novamente")
      );
    } finally {
      setIsUnsubscribing(false);
    }
  }

  async function handleBuy() {
    if (!buyQuantity || buyQuantity < 1) {
      setOperationStatus("Informe uma quantidade válida para comprar.");
      return;
    }
    if (quantity === null || buyQuantity > quantity) {
      setOperationStatus("Quantidade indisponível em estoque.");
      return;
    }

    setIsBuying(true);
    setOperationStatus(null);
    try {
      await removeProduct(productName, buyQuantity);
      setQuantity((prev) => (prev !== null ? prev - buyQuantity : null));
      setOperationStatus("Compra realizada com sucesso!");
    } catch (error) {
      setOperationStatus("Erro ao realizar compra. Tente novamente." + error);
    } finally {
      setIsBuying(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.statusBar}>Conexão: {wsStatus}</div>

      {/* Notificação de atualização de estoque */}
      {stockNotification && (
        <div style={styles.stockNotification}>{stockNotification}</div>
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
        </div>
      )}

      {/* Mensagens de operação (inscrição/compra) */}
      {operationStatus && <p style={styles.notification}>{operationStatus}</p>}

      {quantity !== null && quantity === 0 && (
        <div style={{ marginTop: 20 }}>
          {isSubscribed ? (
            <div>
              <p style={{ color: "#e9e9e9", marginBottom: "1rem" }}>
                Você está inscrito para ser notificado quando este produto
                estiver disponível.
              </p>
              <button
                onClick={handleUnsubscribe}
                disabled={isUnsubscribing}
                style={styles.button}
              >
                {isUnsubscribing ? "Cancelando..." : "Cancelar Inscrição"}
              </button>
            </div>
          ) : (
            <div>
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
            </div>
          )}
        </div>
      )}

      {isSubscribed && quantity !== null && quantity > 0 && (
        <div style={{ marginTop: 20 }}>
          <p style={{ color: "#e9e9e9", marginBottom: "1rem" }}>
            Você está inscrito para receber notificações deste produto.
          </p>
          <button
            onClick={handleUnsubscribe}
            disabled={isUnsubscribing}
            style={styles.button}
          >
            {isUnsubscribing ? "Cancelando..." : "Cancelar Inscrição"}
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
    backgroundColor: "#5f1f29",
    borderRadius: "1rem",
    maxWidth: "400px",
    margin: "2rem auto",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    position: "relative",
  },
  statusBar: {
    position: "absolute",
    top: "10px",
    right: "10px",
    fontSize: "0.8rem",
    color: "#e9e9e9",
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: "2px 5px",
    borderRadius: "3px",
  },
  stockNotification: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    color: "white",
    padding: "10px",
    textAlign: "center",
    fontWeight: "bold",
    animation: "fadeInOut 10s forwards",
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
    backgroundColor: "#030303",
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
