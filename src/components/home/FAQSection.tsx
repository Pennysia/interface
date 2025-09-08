import React from "react";

function FAQSection() {
  return (
    <div className="max-w-5xl mx-auto py-36 px-4 sm:px-0 bg-transparent backdrop-blur-sm rounded-2xl">
      <h2 className="text-3xl md:text-4xl font-base text-center text-[#2E2F46] dark:text-white mb-16">
        Frequently Asked Questions.
      </h2>
      <div className="space-y-4 px-4 md:px-12">
        {/* FAQ Item 1 */}
        <details className="bg-white/50 dark:bg-transparent backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <summary className="p-6 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-[#2E2F46] dark:text-white">
              What is directional liquidity?
            </h3>
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="p-6 text-gray-600 dark:text-gray-400">
            Directional liquidity allows you to provide liquidity with a
            specific market bias - either long (bullish) or short (bearish)
            positions. This innovative approach lets you earn trading fees while
            maintaining your market outlook.
          </div>
        </details>

        {/* FAQ Item 2 */}
        <details className="bg-white/50 dark:bg-transparent backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <summary className="p-6 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-[#2E2F46] dark:text-white">
              How do I earn passive income?
            </h3>
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="p-6 text-gray-600 dark:text-gray-400">
            By providing liquidity to our directional pools, you earn a portion
            of trading fees from every transaction. Our 4-reserve system ensures
            optimal fee distribution based on your position type and market
            activity.
          </div>
        </details>

        {/* FAQ Item 3 */}
        <details className="bg-white/50 dark:bg-transparent backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <summary className="p-6 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-[#2E2F46] dark:text-white">
              What is swap?
            </h3>
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="p-6 text-gray-600 dark:text-gray-400">
            Swap is a feature that allows users to exchange one token for
            another. It is a simple and efficient way to convert one token into
            another.
          </div>
        </details>

        {/* FAQ Item 4 */}
        <details className="bg-white/50 dark:bg-transparent backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
          <summary className="p-6 cursor-pointer list-none flex justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors duration-200">
            <h3 className="text-lg font-semibold text-[#2E2F46] dark:text-white">
              What are the fees?
            </h3>
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="p-6 text-gray-600 dark:text-gray-400">
            We charge a fixed 0.3% trading fee. 95% of fees go to liquidity
            providers, while 5% supports protocol development. There are no
            hidden fees or surprise charges.
          </div>
        </details>
      </div>
    </div>
  );
}

export default React.memo(FAQSection);
