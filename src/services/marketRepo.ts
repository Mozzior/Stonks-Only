import {
  appwrite,
  appwriteConfig,
  assertAppwriteCoreConfigured,
  Query,
} from "../utils/appwrite";
import { fail, ok } from "../utils/backendError";

const {
  databaseId,
  stockInfoCollectionId,
  stockKlineCollectionId,
} =
  appwriteConfig;

function getMarketRepoConfig() {
  assertAppwriteCoreConfigured();
  if (!databaseId) {
    throw new Error("Missing Appwrite config: VITE_APPWRITE_DATABASE_ID");
  }
  if (!stockInfoCollectionId) {
    throw new Error("Missing Appwrite config: VITE_APPWRITE_STOCK_INFO_COLLECTION_ID");
  }
  if (!stockKlineCollectionId) {
    throw new Error("Missing Appwrite config: VITE_APPWRITE_STOCK_KLINE_COLLECTION_ID");
  }
  return {
    databaseId,
    stockInfoCollectionId,
    stockKlineCollectionId,
  };
}

export interface StockInfo {
  ts_code: string;
  symbol: string;
  name: string;
}

export interface StockKline {
  ts_code: string;
  period: string;
  trade_date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
}

function toStockInfo(doc: Record<string, unknown>): StockInfo {
  return {
    ts_code: String(doc.ts_code ?? ""),
    symbol: String(doc.symbol ?? ""),
    name: String(doc.name ?? ""),
  };
}

function toStockKline(doc: Record<string, unknown>): StockKline {
  return {
    ts_code: String(doc.ts_code ?? ""),
    period: String(doc.period ?? ""),
    trade_date: String(doc.trade_date ?? ""),
    open: Number(doc.open ?? 0),
    high: Number(doc.high ?? 0),
    low: Number(doc.low ?? 0),
    close: Number(doc.close ?? 0),
    volume: Number(doc.volume ?? 0),
    amount: Number(doc.amount ?? 0),
  };
}

export async function fetchRandomStock(offset: number) {
  try {
    const config = getMarketRepoConfig();
    const result = await appwrite.databases.listDocuments(
      config.databaseId,
      config.stockInfoCollectionId,
      [Query.limit(1), Query.offset(offset)],
    );
    const stock = result.documents[0];
    return ok(stock ? toStockInfo(stock) : null);
  } catch (error) {
    return fail(error);
  }
}

export async function listStockKlineByPeriod(tsCode: string, period: string) {
  try {
    const config = getMarketRepoConfig();
    const result = await appwrite.databases.listDocuments(
      config.databaseId,
      config.stockKlineCollectionId,
      [
        Query.equal("ts_code", [tsCode]),
        Query.equal("period", [period]),
        Query.orderAsc("trade_date"),
        Query.limit(5000),
      ],
    );
    return ok(result.documents.map(toStockKline));
  } catch (error) {
    return fail(error);
  }
}
