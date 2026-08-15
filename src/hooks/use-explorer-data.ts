"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getInfo,
  getBlockHeaders,
  getTxPool,
  getGeneratedCoins,
  type NetworkInfo,
  type BlockHeader,
  type TxPoolEntry,
  COIN_CONFIG,
} from "@/lib/nerva-api";

export type ExplorerData = {
  networkInfo: NetworkInfo | null;
  blocks: BlockHeader[];
  txPool: TxPoolEntry[];
  generatedCoins: number;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => void;
};

const BLOCK_FETCH_COUNT = 60;

export function useExplorerData(autoRefresh = true): ExplorerData {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
  const [blocks, setBlocks] = useState<BlockHeader[]>([]);
  const [txPool, setTxPool] = useState<TxPoolEntry[]>([]);
  const [generatedCoins, setGeneratedCoins] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const mountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      // Don't set loading true on subsequent refreshes (avoids flashing skeletons)
      const info = await getInfo();
      if (!mountedRef.current) return;

      setNetworkInfo(info);

      // The Nerva API rejects ranges where end >= current height, so use height - 1
      const endHeight = info.height - 1;
      const startHeight = Math.max(0, endHeight - BLOCK_FETCH_COUNT + 1);
      const [headers, pool] = await Promise.all([
        getBlockHeaders(startHeight, endHeight),
        getTxPool(),
      ]);
      if (!mountedRef.current) return;

      // Sort newest first
      const sortedBlocks = headers.sort((a, b) => b.height - a.height);
      setBlocks(sortedBlocks);
      setTxPool(pool);

      // Get generated coins at current height
      try {
        const coins = await getGeneratedCoins(endHeight);
        if (mountedRef.current) {
          setGeneratedCoins(coins);
        }
      } catch (e) {
        // Not critical
      }

      setLastUpdated(Date.now());
    } catch (e) {
      if (mountedRef.current) {
        setError(e instanceof Error ? e.message : "Failed to fetch data");
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAll();

    if (autoRefresh) {
      const interval = setInterval(fetchAll, COIN_CONFIG.updateInterval);
      return () => {
        mountedRef.current = false;
        clearInterval(interval);
      };
    }
    return () => {
      mountedRef.current = false;
    };
  }, [fetchAll, autoRefresh]);

  return {
    networkInfo,
    blocks,
    txPool,
    generatedCoins,
    loading,
    error,
    lastUpdated,
    refresh: fetchAll,
  };
}
