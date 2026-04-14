import { ref, computed } from "vue";

export interface Position {
  id: string;
  side: "LONG" | "SHORT";
  amount: number;
  entryPrice: number;
  entryTime: number;
}

export interface TradeRecord {
  id: string;
  time: string;
  action: "BUY" | "SELL" | "CLOSE";
  side?: "LONG" | "SHORT";
  amount: number;
  price: number;
  realizedPnl?: number;
  fee: number;
}

export function useTrainingTrade() {
  const balance = ref(0);
  const positions = ref<Position[]>([]);
  const tradeRecords = ref<TradeRecord[]>([]);
  const currentPrice = ref(0);
  const feeRate = ref(0.001);
  const leverage = ref(1);

  const unrealizedPnl = computed(() => {
    return positions.value.reduce((total, p) => {
      const diff =
        p.side === "LONG"
          ? currentPrice.value - p.entryPrice
          : p.entryPrice - currentPrice.value;
      return total + diff * p.amount;
    }, 0);
  });

  const equity = computed(() => balance.value + unrealizedPnl.value);

  const usedMargin = computed(() => {
    return positions.value.reduce((total, p) => {
      return total + (p.entryPrice * p.amount) / leverage.value;
    }, 0);
  });

  const freeMargin = computed(() => equity.value - usedMargin.value);

  const riskRate = computed(() => {
    if (usedMargin.value === 0) return Infinity;
    return (equity.value / usedMargin.value) * 100;
  });

  function init(initialBalance: number) {
    balance.value = initialBalance;
    positions.value = [];
    tradeRecords.value = [];
  }

  function openPosition(
    side: "LONG" | "SHORT",
    amount: number,
    price: number,
    time: number,
  ) {
    const notional = amount * price;
    const fee = notional * feeRate.value;
    const requiredMargin = notional / leverage.value;

    if (freeMargin.value < requiredMargin + fee) {
      throw new Error("Insufficient free margin");
    }

    balance.value -= fee;

    const newPos: Position = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      side,
      amount,
      entryPrice: price,
      entryTime: time,
    };

    positions.value.push(newPos);

    tradeRecords.value.unshift({
      id: newPos.id,
      time: new Date(time).toISOString(),
      action: side === "LONG" ? "BUY" : "SELL",
      side,
      amount,
      price,
      fee,
    });

    return newPos;
  }

  function closePosition(
    id: string,
    closeAmount: number,
    price: number,
    time: number,
  ) {
    const index = positions.value.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Position not found");

    const p = positions.value[index];
    if (closeAmount > p.amount) {
      throw new Error("Close amount exceeds position amount");
    }

    const notional = closeAmount * price;
    const fee = notional * feeRate.value;

    const diff =
      p.side === "LONG" ? price - p.entryPrice : p.entryPrice - price;
    const pnl = diff * closeAmount;

    balance.value = balance.value + pnl - fee;

    tradeRecords.value.unshift({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      time: new Date(time).toISOString(),
      action: "CLOSE",
      side: p.side,
      amount: closeAmount,
      price,
      realizedPnl: pnl,
      fee,
    });

    p.amount -= closeAmount;
    if (p.amount <= 0) {
      positions.value.splice(index, 1);
    }
  }

  function reversePosition(id: string, price: number, time: number) {
    const p = positions.value.find((pos) => pos.id === id);
    if (!p) throw new Error("Position not found");

    const originalSide = p.side;
    const originalAmount = p.amount;

    closePosition(id, originalAmount, price, time);

    const newSide = originalSide === "LONG" ? "SHORT" : "LONG";
    return openPosition(newSide, originalAmount, price, time);
  }

  function closeAll(price: number, time: number) {
    const posList = [...positions.value];
    for (const p of posList) {
      closePosition(p.id, p.amount, price, time);
    }
  }

  return {
    balance,
    positions,
    tradeRecords,
    currentPrice,
    feeRate,
    leverage,
    unrealizedPnl,
    equity,
    usedMargin,
    freeMargin,
    riskRate,
    init,
    openPosition,
    closePosition,
    reversePosition,
    closeAll,
  };
}
