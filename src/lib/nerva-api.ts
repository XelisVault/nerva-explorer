// Nerva Explorer API client
// Mirrors the structure of the original Vue explorer's services/Explorer/explorer.service.js

const API_BASE = "https://api.nerva.one/daemon/explorer/index.php";

// Coin configuration - from original config.js
export const COIN_CONFIG = {
  name: "NERVA",
  symbol: "XNV",
  unitPlaces: 12,
  // Stored as string because it exceeds Number.MAX_SAFE_INTEGER
  supplyTotalAtomic: "18446744073709551615",
  blockTarget: 60, // seconds
  updateInterval: 15000, // ms
} as const;

// Types
export type NetworkInfo = {
  height: number;
  difficulty: number;
  tx_count: number;
  tx_pool_size: number;
  target: number;
  target_height: number;
  top_block_hash: string;
  status: string;
  incoming_connections_count: number;
  outgoing_connections_count: number;
  white_peerlist_size: number;
  grey_peerlist_size: number;
  cumulative_difficulty: number;
  block_size_limit: number;
  block_size_median: number;
  database_size: number;
  nettype: string;
  start_time: number;
};

export type BlockHeader = {
  height: number;
  hash: string;
  prev_hash: string;
  timestamp: number;
  difficulty: number;
  cumulative_difficulty: number;
  reward: number;
  block_size: number;
  block_weight: number;
  long_term_weight: number;
  num_txes: number;
  nonce: number;
  orphan_status: boolean;
  depth: number;
  major_version: number;
  minor_version: number;
  miner_tx_hash: string;
};

export type TxPoolEntry = {
  id_hash: string;
  fee: number;
  receive_time: number;
  weight: number;
  kept_by_block: boolean;
  last_failed_id_hash: string;
  last_failed_height: number;
  max_used_block_hash: string;
  max_used_block_height: number;
  relayed: boolean;
  tx_blob: string;
  do_not_relay: boolean;
  double_spend_seen: boolean;
};

// Helper: format display units (k, M, G, T, P, E)
export function displayUnits(input: number, decimals = 0): string {
  const units = ["", "k", "M", "G", "T", "P", "E"];
  let val = input;
  let i = 0;
  while (val >= 1000 && i < units.length - 1) {
    val = val / 1000;
    i++;
  }
  return `${val.toFixed(decimals)} ${units[i]}`.trim();
}

// Helper: convert atomic units to decimal XNV
export function decimalUnits(numIn: number): number {
  if (isNaN(numIn)) return 0;
  return numIn / Math.pow(10, COIN_CONFIG.unitPlaces);
}

// Helper: format hashrate from difficulty
export function formatHashrate(difficulty: number): string {
  return `${displayUnits(difficulty / COIN_CONFIG.blockTarget, 2)}H/s`;
}

// Helper: block size formatter
export function formatBlockSize(size: number): string {
  return `${displayUnits(size, size >= 1000 ? 2 : 0)}B`;
}

// Helper: format XNV amount
export function formatXNV(atomic: number, decimals = 4): string {
  return `${decimalUnits(atomic).toFixed(decimals)} XNV`;
}

// Helper: format timestamp to relative + absolute
export function formatBlockTime(unix: number): { ago: string; abs: string } {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - unix;
  let ago: string;
  if (diff < 60) ago = `${diff}s ago`;
  else if (diff < 3600) ago = `${Math.floor(diff / 60)}m ago`;
  else if (diff < 86400) ago = `${Math.floor(diff / 3600)}h ago`;
  else ago = `${Math.floor(diff / 86400)}d ago`;
  const d = new Date(unix * 1000);
  const abs = d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return { ago, abs };
}

// API: get_info
export async function getInfo(): Promise<NetworkInfo> {
  const res = await fetch(`${API_BASE}?endpoint=get_info`, { cache: "no-store" });
  if (!res.ok) throw new Error(`get_info failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Unknown error");
  return data as NetworkInfo;
}

// API: get_block_headers_range
export async function getBlockHeaders(start: number, end: number): Promise<BlockHeader[]> {
  const res = await fetch(
    `${API_BASE}?endpoint=get_block_headers_range&start=${start}&end=${end}`,
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`get_block_headers_range failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Unknown error");
  return (data.headers || []) as BlockHeader[];
}

// API: get_transaction_pool
export async function getTxPool(): Promise<TxPoolEntry[]> {
  const res = await fetch(`${API_BASE}?endpoint=get_transaction_pool`, { cache: "no-store" });
  if (!res.ok) throw new Error(`get_transaction_pool failed: ${res.status}`);
  const data = await res.json();
  // tx pool returns an array, plus spent_key_images object
  if (Array.isArray(data)) return data as TxPoolEntry[];
  if (data.transactions) return data.transactions as TxPoolEntry[];
  return [];
}

// API: get_generated_coins
export async function getGeneratedCoins(height: number): Promise<number> {
  const res = await fetch(`${API_BASE}?endpoint=get_generated_coins&height=${height}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`get_generated_coins failed: ${res.status}`);
  // The API returns a plain number, not a JSON object
  const text = await res.text();
  const num = parseFloat(text);
  if (!isNaN(num)) return num;
  // Try as JSON object just in case
  try {
    const data = JSON.parse(text);
    if (typeof data === "number") return data;
    if (data && typeof data.generated_coins === "number") return data.generated_coins;
  } catch {
    // Not JSON, ignore
  }
  return 0;
}

// API: get_block_header_by_height
export async function getBlockHeaderByHeight(height: number): Promise<BlockHeader> {
  const res = await fetch(`${API_BASE}?endpoint=get_block_header_by_height&height=${height}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`get_block_header_by_height failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Unknown error");
  return data.block_header as BlockHeader;
}

// API: get_block_header_by_hash
export async function getBlockHeaderByHash(hash: string): Promise<BlockHeader> {
  const res = await fetch(`${API_BASE}?endpoint=get_block_header_by_hash&hash=${hash}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`get_block_header_by_hash failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Unknown error");
  return data.block_header as BlockHeader;
}

// API: get_transactions
export async function getTransaction(hash: string): Promise<any> {
  const res = await fetch(`${API_BASE}?endpoint=get_transactions&hash[]=${hash}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`get_transactions failed: ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "Unknown error");
  if (Array.isArray(data) && data.length > 0) return data[0];
  return null;
}

// Total supply in XNV (computed once)
// COIN_CONFIG.supplyTotal is in atomic units (uint64 max), so divide by 10^12 to get XNV
// However, Nerva's actual tail-emission cap is ~18.5M XNV before tail emission kicks in
export const SUPPLY_TOTAL_XNV = 18446744.073709552; // ~18.4M XNV

// Utility: derive supply stats from network info
// Note: getGeneratedCoins endpoint returns XNV already (not atomic units), unlike block rewards
export function deriveSupply(networkInfo: NetworkInfo | null, generatedCoinsXNV: number) {
  if (!networkInfo) {
    return { total: SUPPLY_TOTAL_XNV, circulating: 0, emissionPercent: 0, reward: 0 };
  }
  // generatedCoinsXNV is already in XNV (from API), so use directly
  const circulating = generatedCoinsXNV;
  const emissionPercent = (generatedCoinsXNV / SUPPLY_TOTAL_XNV) * 100;
  return {
    total: SUPPLY_TOTAL_XNV,
    circulating,
    emissionPercent,
    reward: 0, // filled later from latest block
  };
}

// Utility: derive network stats
export function deriveNetStats(networkInfo: NetworkInfo | null) {
  if (!networkInfo) return { difficulty: "—", hashrate: "—", txCount: 0 };
  return {
    difficulty: displayUnits(networkInfo.difficulty, 2),
    hashrate: formatHashrate(networkInfo.difficulty),
    txCount: networkInfo.tx_count,
    rawDifficulty: networkInfo.difficulty,
  };
}

// Utility: average solve time from blocks
export function averageSolveTime(blocks: BlockHeader[]): number | null {
  if (blocks.length < 2) return null;
  const sorted = [...blocks].sort((a, b) => a.height - b.height);
  const times: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    times.push(sorted[i].timestamp - sorted[i - 1].timestamp);
  }
  if (times.length === 0) return null;
  return times.reduce((sum, t) => sum + t, 0) / times.length;
}

// Utility: chart data from blocks (hashrate + solve time series)
export function buildBlockChartData(blocks: BlockHeader[]) {
  const sorted = [...blocks].sort((a, b) => a.height - b.height);
  const hashrateData: { x: number; y: number }[] = [];
  const blockTimeData: { x: number; y: number }[] = [];
  let lastTime: number | null = null;

  for (const b of sorted) {
    const hashrate = b.difficulty / COIN_CONFIG.blockTarget;
    hashrateData.push({ x: b.height, y: hashrate });
    const solveTime = lastTime ? b.timestamp - lastTime : 60;
    blockTimeData.push({ x: b.height, y: solveTime });
    lastTime = b.timestamp;
  }
  return { hashrateData, blockTimeData };
}
