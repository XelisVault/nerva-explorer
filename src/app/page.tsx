"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  type TransactionDetail,
  getBlockHeaderByHash,
  getBlockHeaderByHeight,
  getTransaction,
} from "@/lib/nerva-api";

// Initial-load URL matching: opens a detail modal when the user lands on
// `/block/<id>` or `/tx/<hash>` (e.g. from an external link or refresh).
function matchInitialPath(pathname: string): { kind: "block" | "tx"; id: string } | null {
  const blockMatch = pathname.match(/^\/block\/(.+)$/);
  if (blockMatch) return { kind: "block", id: decodeURIComponent(blockMatch[1]) };
  const txMatch = pathname.match(/^\/tx\/(.+)$/);
  if (txMatch) return { kind: "tx", id: decodeURIComponent(txMatch[1]) };
  return null;
}

export default function Home() {
  const { networkInfo, blocks, txPool, generatedCoins, loading, error } =
    useExplorerData(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState<BlockHeader | null>(null);
  const [txDetail, setTxDetail] = useState<TransactionDetail | null>(null);
  const [loadingTx, setLoadingTx] = useState(false);

  // Track whether the current modal session was triggered by us (so we know
  // to push a history entry) vs. by a popstate event (so we don't push again).
  const internalNavRef = useRef(false);

  // Open a block modal and push a /block/<id> history entry.
  const onSelectBlock = useCallback((block: BlockHeader) => {
    setSelectedBlock(block);
    setTxDetail(null);
    setLoadingTx(false);
    setModalOpen(true);
    internalNavRef.current = true;
    history.pushState({ modal: "block", id: block.hash }, "", `/block/${block.hash}`);
  }, []);

  // Open a transaction modal and push a /tx/<hash> history entry.
  const onSelectTx = useCallback(async (hash: string) => {
    setSelectedBlock(null);
    setTxDetail(null);
    setLoadingTx(true);
    setModalOpen(true);
    internalNavRef.current = true;
    history.pushState({ modal: "tx", id: hash }, "", `/tx/${hash}`);
    try {
      const tx = await getTransaction(hash);
      setTxDetail(tx);
    } catch {
      setTxDetail(null);
    } finally {
      setLoadingTx(false);
    }
  }, []);

  // Close the modal. When the close is user-initiated (not a popstate), pop
  // the history entry we pushed so the URL returns to "/".
  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedBlock(null);
    setTxDetail(null);
    setLoadingTx(false);
    if (internalNavRef.current) {
      internalNavRef.current = false;
      history.back();
    }
  }, []);

  // popstate handler: if the user hits Back while a modal is open, just close
  // the modal without navigating away from "/".
  useEffect(() => {
    const onPopState = () => {
      internalNavRef.current = false;
      setModalOpen(false);
      setSelectedBlock(null);
      setTxDetail(null);
      setLoadingTx(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Initial-load: if the user landed on /block/<id> or /tx/<hash>, open the
  // corresponding modal and replace the history entry with "/" so the back
  // button returns to the plain explorer rather than re-entering the modal.
  useEffect(() => {
    const match = matchInitialPath(window.location.pathname);
    if (!match) return;

    // Replace the URL with "/" so back/forward behave naturally.
    history.replaceState({}, "", "/");

    if (match.kind === "block") {
      // Try numeric height first, then hash. The actual setState calls happen
      // inside .then() callbacks so they don't trip the set-state-in-effect
      // rule (they're async, not synchronous in the effect body).
      const fetchFn = /^\d+$/.test(match.id)
        ? getBlockHeaderByHeight(parseInt(match.id, 10))
        : getBlockHeaderByHash(match.id);
      fetchFn
        .then((block) => onSelectBlock(block))
        .catch(() => {
          // not found - leave modal closed
        });
    } else {
      // tx - onSelectTx opens the modal and pushes history state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void onSelectTx(match.id);
    }
  }, [onSelectBlock, onSelectTx]);

  const onSearch = useCallback(
    async (q: string) => {
      // Determine if search is a number (height) or hash
      if (/^\d+$/.test(q)) {
        // Height
        try {
          const block = await getBlockHeaderByHeight(parseInt(q, 10));
          onSelectBlock(block);
          return;
        } catch {
          // fallthrough to try as hash
        }
      }
      // Try as block hash first (64 hex chars)
      if (/^[0-9a-fA-F]{64}$/.test(q)) {
        try {
          const block = await getBlockHeaderByHash(q);
          onSelectBlock(block);
          return;
        } catch {
          // maybe it's a tx hash
        }
        // Try as transaction
        try {
          await onSelectTx(q);
          return;
        } catch {
          // fallthrough
        }
      }
      // If short string, try as tx
      try {
        await onSelectTx(q);
      } catch {
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

        <ToolsSection networkInfo={networkInfo} />
      </main>

      <Footer />

      <DetailModal
        open={modalOpen}
        block={selectedBlock}
        txDetail={txDetail}
        loadingTx={loadingTx}
        onClose={closeModal}
      />
    </div>
  );
}
