"use client";

import HomeFooter from "@/components/HomeFooter";

export default function PrivacyPolicy() {
  return (
    <div className="pt-20 md:pt-24 min-h-screen bg-gray-50 dark:bg-[var(--background)] text-xs text-gray-600 dark:text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-transparent p-8">
          <h1 className="text-3xl md:text-4xl font-base text-gray-900 dark:text-white mb-8">
            Privacy Policy
          </h1>

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            <strong>Last updated:</strong> August 25, 2025
          </div>

          <div className="prose prose-gray dark:prose-invert max-w-none">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                1. Information Collection and Usage
              </h2>
              <p className="mb-4">
                When you use the Pennysia Interface, the only information we collect is your wallet address, completed transaction details, and the token names, symbols, or other identifiers of the tokens you swap. We do not collect personal information such as your name or any other identifiers that can directly link to you.
              </p>
              <p className="mb-4">
                To enhance functionality, we use third-party service providers such as Cloudflare and Google Analytics. These providers may independently collect or receive personal information from publicly available sources. Please review their privacy policies to understand how they manage your data: <a href="https://policies.google.com/technologies/partner-sites" target="_blank" className="underline font-semibold">Google Privacy Policy</a>.
              </p>
              <p className="mb-4">
                By using the Interface, you consent to our data practices and the treatment of your information by our service providers.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                2. Security and Compliance
              </h2>
              <p className="mb-4">
                Information collected may be used to detect, prevent, and mitigate financial crimes or other illicit activities. For these purposes, we may share limited information with blockchain analytics providers to promote the safety and integrity of the Interface.
              </p>
              <p className="mb-4">
                We retain this information only for as long as necessary to achieve these objectives.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                3. Blockchain Transparency
              </h2>
              <p className="mb-4">
                By interacting with the Pennysia Interface, you are engaging directly with the blockchain network. Any information you make public through these interactions will be transparent and accessible to anyone on the network. Pennysia does not control or manage the public nature of this information and is not responsible for any consequences resulting from your actions.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                4. Third-Party Services and Wallets
              </h2>
              <p className="mb-4">
                Users interact with Pennysia via third-party self-custodial wallets. These wallets are not owned or controlled by Pennysia and are governed by the terms and conditions of their respective providers. You are solely responsible for reviewing and understanding the terms, fees, and risks associated with your wallet provider. Pennysia assumes no liability for any issues or losses arising from your use of third-party wallets.
              </p>
              <p className="mb-4">
                Links or access to third-party websites (&quot;Third-Party Websites&quot;) may be available through the Interface. Pennysia is not responsible for the content, products, services, or promotions offered by these Third-Party Websites. You assume full responsibility and all risks associated with your use of Third-Party Websites.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                5. Data Accuracy and Liability
              </h2>
              <p className="mb-4">
                We may rely on third-party tools to monitor and analyze service usage or automate certain operational processes. This includes providing information, such as historical price data or other digital currency metrics, for informational purposes.
              </p>
              <p className="mb-4">
                Pennysia does not guarantee the accuracy, completeness, or reliability of such data and will not be liable for any losses or damages arising from: (a) Inaccuracies, defects, or omissions in digital currency data. (b) Errors or delays in the transmission of data. (c) Interruptions or issues in data availability.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                6. Acknowledgment of Risks
              </h2>
              <p className="mb-4">
                By accessing and using the Pennysia Interface, you acknowledge and accept the inherent risks associated with blockchain transparency, third-party services, and data accuracy. Pennysia expressly disclaims liability for any losses or damages arising from these factors.
              </p>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 mt-8">
              Contact Us
            </h2>
            <p className="mb-6">
            If you have any questions or comments about this Privacy Policy, our data practices, or our compliance with applicable law, please contact us by email: <a className="underline font-semibold" href="mailto:hello@pennysia.com">hello@pennysia.com</a>
            </p>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 text-center">
                By continuing to use Pennysia services, you acknowledge that you have read and understood this Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <HomeFooter />
    </div>
  );
}
