"use client";

import { useState, useCallback } from "react";
import Header from "@/components/explorer/header";
import NetworkStats from "@/components/explorer/network-stats";
import BlocksTable from "@/components/explorer/blocks-table";
import MempoolTable from "@/components/explorer/mempool-table";
import NetworkCharts from "@/components/explorer/network-charts";
import ToolsSection from "@/components/explorer/tools";
import Footer from "@/components/explorer/footer";
import DetailModal from "@/components/explorer/detail-modal";
import { useExplorerData } from "@/hooks/use-explorer-data";
import {
  type BlockHeader,
  getBlockHeaderByHash,
  getBlockHeaderByHeight,
  getTransaction,
} from "@/lib/nerva-api";

export default function Home() {
  const { networkInfo, blocks, txPool, generatedCoins, loading, error, lastUpdated, refresh } =
    useExplorerData(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockHeader | null>(null);
  const [txDetail, setTxDetail] = useState<any | null>(null);
  const [loadingTx, setLoadingTx] = useState(false);

  const onSelectBlock = useCallback((block: BlockHeader) => {
    setSelectedBlock(block);
    setTxDetail(null);
    setLoadingTx(false);
    setModalOpen(true);
  }, []);

  const onSelectTx = useCallback(async (hash: string) => {
    setSelectedBlock(null);
    setTxDetail(null);
    setLoadingTx(true);
    setModalOpen(true);
    try {
      const tx = await getTransaction(hash);
      setTxDetail(tx);
    } catch (e) {
      setTxDetail(null);
    } finally {
      setLoadingTx(false);
    }
  }, []);

  const onSearch = useCallback(
    async (q: string) => {
      // Determine if search is a number (height) or hash
      if (/^\d+$/.test(q)) {
        // Height
        try {
          const block = await getBlockHeaderByHeight(parseInt(q, 10));
          onSelectBlock(block);
          return;
        } catch (e) {
          // fallthrough to try as hash
        }
      }
      // Try as block hash first (64 hex chars)
      if (/^[0-9a-fA-F]{64}$/.test(q)) {
        try {
          const block = await getBlockHeaderByHash(q);
          onSelectBlock(block);
          return;
        } catch (e) {
          // maybe it's a tx hash
        }
        // Try as transaction
        try {
          await onSelectTx(q);
          return;
        } catch (e) {
          // fallthrough
        }
      }
      // If short string, try as tx
      try {
        await onSelectTx(q);
      } catch (e) {
        // ignored
      }
    },
    [onSelectBlock, onSelectTx]
  );

  return (
    <div id="top" className="min-h-screen flex flex-col">
      <Header onSearch={onSearch} />

      <main className="flex-1">
        {error && (
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <div
              className="rounded-lg border p-4 text-sm"
              style={{
                borderColor: "rgba(239, 68, 68, 0.3)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#ef4444",
              }}
            >
              ⚠ Connection error: {error}. Retrying automatically...
            </div>
          </div>
        )}

        <NetworkStats
          networkInfo={networkInfo}
          blocks={blocks}
          generatedCoins={generatedCoins}
          loading={loading}
        />

        <NetworkCharts blocks={blocks} />

        <BlocksTable blocks={blocks} loading={loading} onSelectBlock={onSelectBlock} />

        <MempoolTable txPool={txPool} loading={loading} onSelectTx={onSelectTx} />

        <ToolsSection />
      </main>

      <Footer />

      <DetailModal
        open={modalOpen}
        block={selectedBlock}
        txDetail={txDetail}
        loadingTx={loadingTx}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
