"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { useScrollLock } from "../hooks/useScrollLock";
import { type LiquidityPosition } from "../hooks/useLiquidity";
import { ethers } from "ethers";
import { getMarketAddress, getRouterAddress } from "../../../lib/sdk-utils";
import { MARKET_ABI, ROUTER_ABI, LIQUIDITY_ABI } from "../../../lib/abis";
import { CURRENT_CHAIN_ID } from "@/config/chains";
import { useStore } from "../../../store/useStore";
import toast from "react-hot-toast";
import TransactionLoadingOverlay from "../../../components/ui/TransactionLoadingOverlay";

interface LPSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: LiquidityPosition | null;
  onTransactionComplete?: () => Promise<void>;
}

interface SwapSide {
  enabled: boolean;
  from: "long" | "short";
  to: "long" | "short";
  amount: string;
}

export default function LPSwapModal({
  isOpen,
  onClose,
  position,
  onTransactionComplete,
}: LPSwapModalProps) {
  const [xSideSwap, setXSideSwap] = useState<SwapSide>({
    enabled: false,
    from: "long",
    to: "short",
    amount: "",
  });
  const [ySideSwap, setYSideSwap] = useState<SwapSide>({
    enabled: false,
    from: "long",
    to: "short",
    amount: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTransactionResult, setShowTransactionResult] = useState(false);
  const [transactionResult, setTransactionResult] = useState<{
    success: boolean;
    error?: string;
    txHash?: string;
    liquidityOut0?: string;
    liquidityOut1?: string;
  } | null>(null);

  // Lock background scroll when modal is open
  useScrollLock(isOpen);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && position) {
      setXSideSwap({
        enabled: false,
        from: "long",
        to: "short",
        amount: "",
      });
      setYSideSwap({
        enabled: false,
        from: "long",
        to: "short",
        amount: "",
      });
      setShowTransactionResult(false);
      setTransactionResult(null);
    }
  }, [isOpen, position]);

  if (!isOpen || !position) return null;

  const getAvailableBalance = (
    token: "token0" | "token1",
    direction: "long" | "short"
  ): string => {
    if (token === "token0") {
      return direction === "long" ? position.userLongX : position.userShortX;
    } else {
      return direction === "long" ? position.userLongY : position.userShortY;
    }
  };

  const formatNumber = (value: string): string => {
    const num = parseFloat(value);
    if (isNaN(num) || num === 0) return "0";
    if (num < 0.000001) return num.toExponential(3);
    return num.toFixed(6);
  };

  const handleLPSwap = async () => {
    if (!position) {
      toast.error("No position selected");
      return;
    }

    // Check if at least one side is enabled
    if (!xSideSwap.enabled && !ySideSwap.enabled) {
      toast.error("Please enable at least one swap side");
      return;
    }

    // Validate enabled swaps
    if (xSideSwap.enabled) {
      if (!xSideSwap.amount || parseFloat(xSideSwap.amount) <= 0) {
        toast.error("Please enter valid amount for X side swap");
        return;
      }

      const availableBalance = parseFloat(
        getAvailableBalance("token0", xSideSwap.from)
      );
      if (parseFloat(xSideSwap.amount) > availableBalance) {
        toast.error(
          `Insufficient ${position.token0Symbol} ${xSideSwap.from} balance`
        );
        return;
      }
    }

    if (ySideSwap.enabled) {
      if (!ySideSwap.amount || parseFloat(ySideSwap.amount) <= 0) {
        toast.error("Please enter valid amount for Y side swap");
        return;
      }

      const availableBalance = parseFloat(
        getAvailableBalance("token1", ySideSwap.from)
      );
      if (parseFloat(ySideSwap.amount) > availableBalance) {
        toast.error(
          `Insufficient ${position.token1Symbol} ${ySideSwap.from} balance`
        );
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { provider, isConnected, address } = useStore.getState();

      if (!isConnected || !provider || !address) {
        toast.error("Please connect your wallet first");
        return;
      }

      const routerAddress = getRouterAddress(CURRENT_CHAIN_ID);
      if (!routerAddress) {
        toast.error("Router contract not found for current network");
        return;
      }

      const marketAddress = getMarketAddress(CURRENT_CHAIN_ID);
      if (!marketAddress) {
        toast.error("Market contract not found for current network");
        return;
      }

      const signer = await provider.getSigner();
      const routerContract = new ethers.Contract(
        routerAddress,
        ROUTER_ABI,
        signer
      );

      // Market contract inherits from Liquidity, so we need to combine the ABIs
      const combinedMarketABI = [...MARKET_ABI, ...LIQUIDITY_ABI];
      const marketContract = new ethers.Contract(
        marketAddress,
        combinedMarketABI,
        signer
      );
      const liquidityContract = new ethers.Contract(
        marketAddress,
        LIQUIDITY_ABI,
        signer
      );

      // Calculate poolId for LP token approval using Market ABI
      const poolId = await marketContract.getPairId(
        position.token0Address,
        position.token1Address
      );

      console.log(
        "🔐 Approving Router to transfer LP tokens for poolId:",
        poolId.toString()
      );

      // Approve Router to transfer LP tokens (TTL-based approval) using Liquidity ABI
      const approvalDeadline = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
      const approvalTx = await liquidityContract.approve(
        routerAddress,
        poolId,
        approvalDeadline
      );
      await approvalTx.wait();

      console.log("✅ LP token approval successful");

      // Prepare swap parameters
      const longToShort0 = xSideSwap.enabled
        ? xSideSwap.from === "long" && xSideSwap.to === "short"
        : false;
      const liquidity0 = xSideSwap.enabled
        ? ethers.parseUnits(xSideSwap.amount, 18)
        : 0n;

      const longToShort1 = ySideSwap.enabled
        ? ySideSwap.from === "long" && ySideSwap.to === "short"
        : false;
      const liquidity1 = ySideSwap.enabled
        ? ethers.parseUnits(ySideSwap.amount, 18)
        : 0n;

      console.log("🔄 Executing LP Swap:", {
        token0: position.token0Address,
        token1: position.token1Address,
        longToShort0,
        liquidity0: liquidity0.toString(),
        longToShort1,
        liquidity1: liquidity1.toString(),
      });

      // Calculate minimum output with 1% slippage tolerance
      const slippageTolerance = 99n; // 99% (1% slippage)
      const liquidity0OutMinimum = (liquidity0 * slippageTolerance) / 100n;
      const liquidity1OutMinimum = (liquidity1 * slippageTolerance) / 100n;

      // Create deadline (10 minutes from now)
      const deadline = Math.floor(Date.now() / 1000) + 600;

      // Execute the LP swap
      const tx = await routerContract.liquiditySwap(
        position.token0Address,
        position.token1Address,
        longToShort0,
        liquidity0,
        longToShort1,
        liquidity1,
        liquidity0OutMinimum,
        liquidity1OutMinimum,
        address,
        deadline
      );

      console.log("📤 LP Swap transaction sent:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait();

      if (!receipt || receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      console.log("✅ LP Swap transaction confirmed:", receipt.hash);

      // Show success result
      setTransactionResult({
        success: true,
        txHash: receipt.hash,
        liquidityOut0: ethers.formatUnits(liquidity0, 18),
        liquidityOut1: ethers.formatUnits(liquidity1, 18),
      });
      setShowTransactionResult(true);

      // Refresh positions
      if (onTransactionComplete) {
        await onTransactionComplete();
      }
    } catch (error) {
      console.error("Error executing LP swap:", error);

      setTransactionResult({
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to execute LP swap",
      });
      setShowTransactionResult(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setXSideSwap({
      enabled: false,
      from: "long",
      to: "short",
      amount: "",
    });
    setYSideSwap({
      enabled: false,
      from: "long",
      to: "short",
      amount: "",
    });
    setShowTransactionResult(false);
    setTransactionResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Loading Overlay */}
        <TransactionLoadingOverlay
          isVisible={isSubmitting}
          title="Executing LP Swap..."
          subtitle="Please confirm the transaction in your wallet"
        />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Manage Direction
            </h2>
            <button
              onClick={handleClose}
              className="p-2 border border-gray-200 dark:border-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
            >
              <XMarkIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {position.token0Symbol}/{position.token1Symbol} Pool
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Swap between long and short LP positions. Select the liquidity you
              want to manage, fill the amount, and execute the transaction.
            </p>
          </div>

          {/* Current Balances */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Current LP Token Balances
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {position.token0Symbol} Positions
                </div>
                <div className="text-sm">
                  <span className="text-green-600 dark:text-green-400">
                    Long: {formatNumber(position.userLongX)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-red-600 dark:text-red-400">
                    Short: {formatNumber(position.userShortX)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {position.token1Symbol} Positions
                </div>
                <div className="text-sm">
                  <span className="text-green-600 dark:text-green-400">
                    Long: {formatNumber(position.userLongY)}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-red-600 dark:text-red-400">
                    Short: {formatNumber(position.userShortY)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* X Side Swap */}
          <div className="space-y-4 pb-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {position.token0Symbol} Liquidity
                  </h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={xSideSwap.enabled}
                    onChange={(e) =>
                      setXSideSwap((prev) => ({
                        ...prev,
                        enabled: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {xSideSwap.enabled && (
                <div className="space-y-4">
                  {/* Swap Direction Display */}
                  <div className="flex items-center justify-center gap-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          xSideSwap.from === "long"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {xSideSwap.from === "long" ? "Long" : "Short"}{" "}
                        {position.token0Symbol}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setXSideSwap((prev) => ({
                          ...prev,
                          from: prev.from === "long" ? "short" : "long",
                          to: prev.to === "long" ? "short" : "long",
                        }));
                      }}
                      className="cursor-pointer p-2 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
                      title="Swap direction"
                    >
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </button>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          xSideSwap.to === "long"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {xSideSwap.to === "long" ? "Long" : "Short"}{" "}
                        {position.token0Symbol}
                      </span>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={xSideSwap.amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and a single decimal point
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            const numValue = parseFloat(value);
                            const maxBalance = parseFloat(
                              getAvailableBalance("token0", xSideSwap.from)
                            );

                            if (value === "" || isNaN(numValue)) {
                              setXSideSwap((prev) => ({
                                ...prev,
                                amount: value,
                              }));
                            } else if (numValue < 0) {
                              // Prevent negative numbers
                              return;
                            } else if (numValue > maxBalance) {
                              // Cap at max balance
                              setXSideSwap((prev) => ({
                                ...prev,
                                amount: maxBalance.toString(),
                              }));
                              toast.success(
                                `Amount capped at max: ${maxBalance.toFixed(6)}`
                              );
                            } else {
                              setXSideSwap((prev) => ({
                                ...prev,
                                amount: value,
                              }));
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevent 'e', 'E', '+', '-' keys
                          if (["e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="0.00"
                        className="w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        autoComplete="off"
                      />
                      <button
                        onClick={() => {
                          const balance = getAvailableBalance(
                            "token0",
                            xSideSwap.from
                          );
                          setXSideSwap((prev) => ({
                            ...prev,
                            amount: balance,
                          }));
                        }}
                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        MAX
                      </button>
                    </div>

                    {/* Percentage Buttons */}
                    <div className="flex justify-between mt-2 space-x-1 w-full">
                      {[25, 50, 75, 100].map((percent) => {
                        const maxBalance = parseFloat(
                          getAvailableBalance("token0", xSideSwap.from)
                        );
                        const calculatedAmount = (maxBalance * percent) / 100;
                        return (
                          <button
                            key={percent}
                            onClick={() => {
                              setXSideSwap((prev) => ({
                                ...prev,
                                amount: calculatedAmount.toString(),
                              }));
                            }}
                            className="w-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer"
                          >
                            {percent}%
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Available:{" "}
                      {formatNumber(
                        getAvailableBalance("token0", xSideSwap.from)
                      )}{" "}
                      {position.token0Symbol} {xSideSwap.from}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Y Side Swap */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {position.token1Symbol} Liquidity
                  </h4>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ySideSwap.enabled}
                    onChange={(e) =>
                      setYSideSwap((prev) => ({
                        ...prev,
                        enabled: e.target.checked,
                      }))
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {ySideSwap.enabled && (
                <div className="space-y-4">
                  {/* Swap Direction Display */}
                  <div className="flex items-center justify-center gap-4 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          ySideSwap.from === "long"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {ySideSwap.from === "long" ? "Long" : "Short"}{" "}
                        {position.token1Symbol}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setYSideSwap((prev) => ({
                          ...prev,
                          from: prev.from === "long" ? "short" : "long",
                          to: prev.to === "long" ? "short" : "long",
                        }));
                      }}
                      className="cursor-pointer p-2 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 transition-colors"
                      title="Swap direction"
                    >
                      <svg
                        className="w-5 h-5 text-blue-600 dark:text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                    </button>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          ySideSwap.to === "long"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                      >
                        {ySideSwap.to === "long" ? "Long" : "Short"}{" "}
                        {position.token1Symbol}
                      </span>
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={ySideSwap.amount}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Only allow numbers and a single decimal point
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            const numValue = parseFloat(value);
                            const maxBalance = parseFloat(
                              getAvailableBalance("token1", ySideSwap.from)
                            );

                            if (value === "" || isNaN(numValue)) {
                              setYSideSwap((prev) => ({
                                ...prev,
                                amount: value,
                              }));
                            } else if (numValue < 0) {
                              // Prevent negative numbers
                              return;
                            } else if (numValue > maxBalance) {
                              // Cap at max balance
                              setYSideSwap((prev) => ({
                                ...prev,
                                amount: maxBalance.toString(),
                              }));
                              toast.success(
                                `Amount capped at max: ${maxBalance.toFixed(6)}`
                              );
                            } else {
                              setYSideSwap((prev) => ({
                                ...prev,
                                amount: value,
                              }));
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevent 'e', 'E', '+', '-' keys
                          if (["e", "E", "+", "-"].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        placeholder="0.00"
                        className="w-full px-3 py-2 pr-16 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        autoComplete="off"
                      />
                      <button
                        onClick={() => {
                          const balance = getAvailableBalance(
                            "token1",
                            ySideSwap.from
                          );
                          setYSideSwap((prev) => ({
                            ...prev,
                            amount: balance,
                          }));
                        }}
                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        MAX
                      </button>
                    </div>

                    {/* Percentage Buttons */}
                    <div className="flex justify-between mt-2 space-x-1 w-full">
                      {[25, 50, 75, 100].map((percent) => {
                        const maxBalance = parseFloat(
                          getAvailableBalance("token1", ySideSwap.from)
                        );
                        const calculatedAmount = (maxBalance * percent) / 100;
                        return (
                          <button
                            key={percent}
                            onClick={() => {
                              setYSideSwap((prev) => ({
                                ...prev,
                                amount: calculatedAmount.toString(),
                              }));
                            }}
                            className="w-full px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors cursor-pointer"
                          >
                            {percent}%
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Available:{" "}
                      {formatNumber(
                        getAvailableBalance("token1", ySideSwap.from)
                      )}{" "}
                      {position.token1Symbol} {ySideSwap.from}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Execute Button */}
          <button
            onClick={handleLPSwap}
            disabled={
              (!xSideSwap.enabled && !ySideSwap.enabled) || isSubmitting
            }
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 px-6 rounded-xl font-semibold transition-colors cursor-pointer"
          >
            {isSubmitting ? "Executing LP Swap..." : "Execute LP Swap"}
          </button>
        </div>
      </div>

      {/* Transaction Result Modal */}
      {showTransactionResult && transactionResult && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {transactionResult.success
                  ? "LP Swap Successful!"
                  : "LP Swap Failed"}
              </h3>
              <button
                onClick={() => {
                  setShowTransactionResult(false);
                  if (transactionResult.success) {
                    handleClose();
                  }
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              {transactionResult.success ? (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Your LP position directions have been successfully
                      updated.
                    </p>
                  </div>

                  {transactionResult.txHash && (
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          Transaction:
                        </span>
                        <a
                          href={`https://sonicscan.org/tx/${transactionResult.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-400 font-mono text-sm"
                        >
                          {transactionResult.txHash.slice(0, 6)}...
                          {transactionResult.txHash.slice(-4)}
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                    <div className="text-red-600 dark:text-red-400 text-sm">
                      {transactionResult.error}
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  setShowTransactionResult(false);
                  if (transactionResult.success) {
                    handleClose();
                  }
                }}
                className="w-full mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium cursor-pointer"
              >
                {transactionResult.success ? "Done" : "Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
