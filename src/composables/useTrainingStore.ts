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
  action: "LONG" | "SHORT" | "CLOSE";
  side?: "LONG" | "SHORT";
  amount: number;
  price: number;
  realizedPnl?: number;
  fee: number;
}

const balance = ref(0);
const positions = ref<Position[]>([]);
const tradeRecords = ref<TradeRecord[]>([]);
const currentPrice = ref(0);
const feeRate = ref(0);
const leverage = ref(1);

export function useTrainingStore() {
  const unrealizedPnl = computed(() => {
    return positions.value.reduce((total, p) => {
      const diff =
        p.side === "LONG"
          ? currentPrice.value - p.entryPrice
          : p.entryPrice - currentPrice.value;
      return total + diff * p.amount;
    }, 0);
  });

  const equity = computed(() => {
    let totalMargin = 0;
    for (const p of positions.value) {
      totalMargin += p.entryPrice * p.amount;
    }
    return balance.value + totalMargin + unrealizedPnl.value;
  });

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
    const requiredMargin = notional; // Full margin required in backend

    if (balance.value < requiredMargin + fee) {
      throw new Error("Insufficient free margin");
    }

    const newPos: Position = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      side,
      amount,
      entryPrice: price,
      entryTime: time,
    };

    return newPos;
  }

  function closePosition(
    id: string,
    closeAmount: number,
    _price: number,
    _time: number,
  ) {
    const index = positions.value.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Position not found");

    const p = positions.value[index];
    if (closeAmount > p.amount) {
      throw new Error("Close amount exceeds position amount");
    }
    
    p.amount -= closeAmount;
    if (p.amount <= 0) {
      positions.value.splice(index, 1);
    }

    const recordId = Date.now().toString() + Math.random().toString(36).substring(2, 7);

    return recordId;
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
