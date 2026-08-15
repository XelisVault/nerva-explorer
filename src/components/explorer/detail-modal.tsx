"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { type BlockHeader, formatBlockTime, formatBlockSize, decimalUnits, displayUnits } from "@/lib/nerva-api";
import { CopyIcon, CheckIcon, CloseIcon, CubeIcon, ExchangeIcon } from "./icons";

type Props = {
  open: boolean;
  block: BlockHeader | null;
  txDetail: any | null;
  loadingTx: boolean;
  onClose: () => void;
};

export default function DetailModal({ open, block, txDetail, loadingTx, onClose }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  const copy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  // Determine if we're showing a block or transaction
  const isTx = !!txDetail || loadingTx;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border shadow-2xl"
            style={{
              background: "var(--clr-bg-surface)",
              borderColor: "var(--clr-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between border-b p-5 backdrop-blur-xl"
              style={{
                background: "color-mix(in srgb, var(--clr-bg-surface) 90%, transparent)",
                borderColor: "var(--clr-border)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--brand-teal) 18%, transparent), color-mix(in srgb, var(--brand-purple) 18%, transparent))",
                    color: "var(--clr-accent)",
                  }}
                >
                  {isTx ? <ExchangeIcon className="h-5 w-5" /> : <CubeIcon className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold" style={{ color: "var(--clr-text)" }}>
                    {isTx ? "Transaction" : `Block #${block?.height.toLocaleString() || ""}`}
                  </h3>
                  <p className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
                    {isTx ? "Transaction details" : "Block details"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 transition-colors hover:bg-[var(--clr-bg-hover)]"
                aria-label="Close"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5">
              {isTx ? (
                <TxDetailContent txDetail={txDetail} loading={loadingTx} copied={copied} onCopy={copy} />
              ) : (
                block && <BlockDetailContent block={block} copied={copied} onCopy={copy} />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Row({
  label,
  children,
  copyValue,
  copyKey,
  copied,
  onCopy,
}: {
  label: string;
  children: React.ReactNode;
  copyValue?: string;
  copyKey?: string;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--clr-text-muted)" }}>
        {label}
      </div>
      <div className="flex items-start gap-2 text-sm" style={{ color: "var(--clr-text)" }}>
        <div className="flex-1 break-all">{children}</div>
        {copyValue && (
          <button
            type="button"
            onClick={() => onCopy(copyValue, copyKey || label)}
            className="flex-shrink-0 rounded p-1 transition-colors hover:bg-[var(--clr-bg-hover)]"
            aria-label="Copy"
            title="Copy to clipboard"
          >
            {copied === (copyKey || label) ? (
              <CheckIcon className="h-4 w-4" style={{ color: "#10b981" }} />
            ) : (
              <CopyIcon className="h-4 w-4" style={{ color: "var(--clr-text-muted)" }} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function BlockDetailContent({
  block,
  copied,
  onCopy,
}: {
  block: BlockHeader;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  const time = formatBlockTime(block.timestamp);
  return (
    <div className="divide-y" style={{ borderColor: "var(--clr-border-light)" }}>
      <Row label="Height" copyValue={String(block.height)} copyKey="height" copied={copied} onCopy={onCopy}>
        <span className="font-bold" style={{ color: "var(--clr-accent)" }}>
          {block.height.toLocaleString()}
        </span>
      </Row>
      <Row label="Timestamp" copied={copied} onCopy={onCopy}>
        <div>{time.abs}</div>
        <div className="text-xs" style={{ color: "var(--clr-text-muted)" }}>{time.ago}</div>
      </Row>
      <Row label="Hash" copyValue={block.hash} copyKey="hash" copied={copied} onCopy={onCopy}>
        <code className="text-xs">{block.hash}</code>
      </Row>
      <Row label="Previous Hash" copyValue={block.prev_hash} copyKey="prev" copied={copied} onCopy={onCopy}>
        <code className="text-xs">{block.prev_hash}</code>
      </Row>
      <Row label="Miner TX Hash" copyValue={block.miner_tx_hash} copyKey="miner" copied={copied} onCopy={onCopy}>
        <code className="text-xs">{block.miner_tx_hash}</code>
      </Row>
      <Row label="Difficulty" copied={copied} onCopy={onCopy}>
        <span className="font-semibold">{displayUnits(block.difficulty, 2)}</span>
        <span className="ml-2 text-xs" style={{ color: "var(--clr-text-muted)" }}>
          ({block.difficulty.toLocaleString()})
        </span>
      </Row>
      <Row label="Cumulative Diff" copied={copied} onCopy={onCopy}>
        <span className="font-semibold">{displayUnits(block.cumulative_difficulty, 2)}</span>
      </Row>
      <Row label="Reward" copyValue={String(block.reward)} copyKey="reward" copied={copied} onCopy={onCopy}>
        <span className="font-semibold" style={{ color: "#10b981" }}>
          {decimalUnits(block.reward).toFixed(4)} XNV
        </span>
      </Row>
      <Row label="Block Size" copied={copied} onCopy={onCopy}>
        {formatBlockSize(block.block_size)}
      </Row>
      <Row label="Block Weight" copied={copied} onCopy={onCopy}>
        {formatBlockSize(block.block_weight)}
      </Row>
      <Row label="Transactions" copied={copied} onCopy={onCopy}>
        {block.num_txes > 0 ? (
          <span className="badge badge-info">{block.num_txes}</span>
        ) : (
          <span style={{ color: "var(--clr-text-subtle)" }}>No transactions (miner only)</span>
        )}
      </Row>
      <Row label="Nonce" copyValue={String(block.nonce)} copyKey="nonce" copied={copied} onCopy={onCopy}>
        <code>{block.nonce.toLocaleString()}</code>
      </Row>
      <Row label="Version" copied={copied} onCopy={onCopy}>
        {block.major_version}.{block.minor_version}
      </Row>
      <Row label="Depth" copied={copied} onCopy={onCopy}>
        <span className="badge badge-success">{block.depth} blocks ago</span>
      </Row>
      <Row label="Orphan Status" copied={copied} onCopy={onCopy}>
        {block.orphan_status ? (
          <span className="badge badge-error">Orphaned</span>
        ) : (
          <span className="badge badge-success">Main chain</span>
        )}
      </Row>
    </div>
  );
}

function TxDetailContent({
  txDetail,
  loading,
  copied,
  onCopy,
}: {
  txDetail: any | null;
  loading: boolean;
  copied: string | null;
  onCopy: (text: string, key: string) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 rounded-xl shimmer" />
        ))}
      </div>
    );
  }

  if (!txDetail) {
    return (
      <div className="py-12 text-center">
        <p style={{ color: "var(--clr-text-muted)" }}>
          Transaction not found. It may have been dropped from the mempool or never existed.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y" style={{ borderColor: "var(--clr-border-light)" }}>
      <Row label="Tx Hash" copyValue={txDetail.tx_hash || txDetail.id_hash} copyKey="txhash" copied={copied} onCopy={onCopy}>
        <code className="text-xs">{txDetail.tx_hash || txDetail.id_hash}</code>
      </Row>
      {txDetail.block_height !== undefined && (
        <Row label="Block Height" copyValue={String(txDetail.block_height)} copyKey="bh" copied={copied} onCopy={onCopy}>
          <span className="font-bold" style={{ color: "var(--clr-accent)" }}>
            {txDetail.block_height.toLocaleString()}
          </span>
        </Row>
      )}
      {txDetail.block_timestamp && (
        <Row label="Timestamp" copied={copied} onCopy={onCopy}>
          {formatBlockTime(txDetail.block_timestamp).abs}
        </Row>
      )}
      {txDetail.fee !== undefined && (
        <Row label="Fee" copyValue={String(txDetail.fee)} copyKey="fee" copied={copied} onCopy={onCopy}>
          <span className="font-semibold" style={{ color: "#f59e0b" }}>
            {decimalUnits(txDetail.fee).toFixed(6)} XNV
          </span>
        </Row>
      )}
      {txDetail.tx_size !== undefined && (
        <Row label="Size" copied={copied} onCopy={onCopy}>
          {formatBlockSize(txDetail.tx_size)}
        </Row>
      )}
      {txDetail.unlock_time !== undefined && txDetail.unlock_time !== 0 && (
        <Row label="Unlock Time" copyValue={String(txDetail.unlock_time)} copyKey="ut" copied={copied} onCopy={onCopy}>
          {txDetail.unlock_time}
        </Row>
      )}
      {txDetail.vin && (
        <Row label="Inputs (VIN)" copied={copied} onCopy={onCopy}>
          <span className="badge badge-info">{txDetail.vin.length} input(s)</span>
        </Row>
      )}
      {txDetail.vout && (
        <Row label="Outputs (VOUT)" copied={copied} onCopy={onCopy}>
          <span className="badge badge-info">{txDetail.vout.length} output(s)</span>
        </Row>
      )}
      {txDetail.extra && (
        <Row label="Extra Data" copyValue={typeof txDetail.extra === "string" ? txDetail.extra : JSON.stringify(txDetail.extra)} copyKey="extra" copied={copied} onCopy={onCopy}>
          <code className="text-xs break-all">{typeof txDetail.extra === "string" ? txDetail.extra : JSON.stringify(txDetail.extra).slice(0, 200)}...</code>
        </Row>
      )}
      <Row label="Raw JSON" copied={copied} onCopy={onCopy}>
        <a
          href={`https://api.nerva.one/daemon/explorer/index.php?endpoint=get_transactions&hash[]=${txDetail.tx_hash || txDetail.id_hash}`}
          target="_blank"
          rel="noreferrer"
          className="text-xs underline"
          style={{ color: "var(--clr-accent)" }}
        >
          View on API →
        </a>
      </Row>
    </div>
  );
}
