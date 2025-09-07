"use client";

import Link from "next/link";
import { CodeBracketIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function HomeFooter() {
  return (
    <footer className="max-w-7xl mx-auto rounded-t-4xl bg-gray-100 dark:bg-white/2">
      <div className="px-8 sm:px-12">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-1">
              <Link
                href="/"
                className="cursor-pointer transition-opacity flex items-center w-fit"
              >
                <Image
                  src="/pennysia-brandkit/full-logo/light-mode-full-logo.svg"
                  alt="Pennysia Logo"
                  width={120}
                  height={40}
                  className="block dark:hidden"
                  style={{ objectFit: "cover" }}
                  priority={true}
                />
                <Image
                  src="/pennysia-brandkit/full-logo/dark-mode-full-logo.svg"
                  alt="Pennysia Logo"
                  width={120}
                  height={40}
                  className="hidden dark:block"
                  style={{ objectFit: "cover" }}
                  priority={true}
                />
              </Link>
              <p className="text-gray-400 dark:text-gray-600 text-[10px] mb-6 ">
                Pennysia Labs hereby provides information and resources
                regarding the fundamental principles and functionalities of its
                decentralized, non-custodial liquidity protocol, referred to
                herein as the &quot;Pennysia Protocol.&quot; The Pennysia
                Protocol is composed of open-source, self-executing smart
                contracts, which are deployed on multiple permissionless public
                blockchains. The Interface is provided &quot;as is&quot; and
                &quot;as available&quot; without any warranties of any kind.
                Pennysia Labs does not control, operate, or maintain any
                instance or version of the Pennysia Protocol on any blockchain
                network, and shall not be held liable for any actions or
                inactions related to the operation or deployment of the Protocol
                on any blockchain network.
              </p>
              <div className="flex space-x-4">
                <a
                  href="https://x.com/pennysialabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="X"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://t.me/pennysiaprotocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Telegram"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005-.001l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.197 1.006.128.832.941z" />
                  </svg>
                </a>

                <a
                  href="https://discord.gg/QHfJz63b3J"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Discord"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="bi bi-discord h-5 w-5"
                    viewBox="0 0 16 16"
                  >
                    <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
                  </svg>
                </a>
                <a
                  href="https://github.com/Pennysia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="GitHub"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    className="bi bi-github h-5 w-5"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                  </svg>
                </a>
              </div>
            </div>

            <div className="col-span-1 md:col-span-1 flex flex-col sm:flex-row justify-around gap-12">
              {/* Product Links */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  App
                </h4>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/market"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      aria-label="Market"
                    >
                      Market
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/swap"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      aria-label="Swap"
                    >
                      Swap
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/liquidity"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      aria-label="Liquidity"
                    >
                      Liquidity
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Resources
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="/docs"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      aria-label="Documentation"
                    >
                      Documentation
                    </a>
                  </li>
                  <li>
                    <a
                      href="/brand-kit"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      aria-label="Brand kit"
                    >
                      Brand kit
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/Pennysia"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Github"
                    >
                      Github
                    </a>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                  Support
                </h4>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="mailto:hello@pennysia.com"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      aria-label="Contact Us"
                    >
                      Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://docs.google.com/forms/d/e/1FAIpQLScnudg5yaAFL1ZOz28co1CJ202a3k2ntr3LhLa-rCohBQIorg/viewform?usp=sharing&ouid=114606323687541650973"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Request Form"
                    >
                      Request Form
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                © 2025 Pennysia. All rights reserved.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a
                  href="/privacy"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Privacy Policy"
                >
                  Privacy Policy
                </a>
                <a
                  href="/terms"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  aria-label="Terms of Service"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
