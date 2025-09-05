'use client'

interface TransactionLoadingOverlayProps {
  isVisible: boolean
  title?: string
  subtitle?: string
  className?: string
}

export default function TransactionLoadingOverlay({ 
  isVisible, 
  title = "Processing Transaction...", 
  subtitle = "Please confirm the transaction in your wallet",
  className = ""
}: TransactionLoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] ${className}`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-white text-lg font-semibold mb-2">{title}</div>
        <div className="text-gray-400 text-sm">{subtitle}</div>
      </div>
    </div>
  )
}
