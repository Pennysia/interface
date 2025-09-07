import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

function FeatureCards() {
    return (
        <div>
            <div className="mb-16 w-full flex flex-col items-center">
                <h3 className="text-3xl md:text-4xl font-normal text-[#2E2F46] dark:text-white mb-4 text-center pt-24">
                    Create markets with ease. Directed by your conviction.
                </h3>
                <p className="text-center text-base opacity-80">
                  Take
                  {' '}
                  <span className="inline-flex items-center rounded-full border border-[#555C6F]/40 bg-gray-200/60 dark:bg-[#555C6F]/20 px-2 py-0.5 mx-1">
                    <span className="font-bold">{'<'} 1 minute</span>&nbsp;
                  </span>
                  and pay
                  {' '}
                  <span className="inline-flex items-center rounded-full border border-[#555C6F]/40 bg-gray-200/60 dark:bg-[#555C6F]/20 px-2 py-0.5 mx-1">
                    <span className="font-bold">{'<'} 1 cent</span>&nbsp;
                  </span>
                  to set up a market for your token.
                </p>
                <Link
                    href="/liquidity"
                    className="text-white dark:text-[#19192A] text-sm inline-flex items-center w-fit mt-8 hover:bg-[#A7ADBB] bg-[#19192A] dark:bg-[#E7E8EB] border border-[#555C6F] font-normal py-3 px-6 rounded-full transition-all duration-200 relative z-10"
                >
                    Create now →
                </Link>
            </div>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-24 px-4">
                {/* Card 1 */}
                <div className=" bg-white dark:bg-[#555C6F]/10 backdrop-blur-sm rounded-2xl text-left border border-gray-300 dark:border-gray-800">
                    <div className="dark:bg-gray-500/50 bg-gray-300/50 rounded-t-2xl w-full h-auto mx-auto flex items-center justify-center">
                        <div className="p-4 w-full h-60 flex items-center justify-center transform-gpu">
                            <Image
                                src="/homePage/rc1.svg"
                                alt="Pennysia AMM Interface"
                                width={381}
                                height={240}
                                className="w-full h-auto sm:max-w-[320px] md:max-w-[381px]"
                                style={{ objectFit: 'contain' }}
                                priority={true}
                            />
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                            Lifetime Passive <br />
                            Income Generator
                        </h3>
                        <p className="opacity-80 text-gray-600 dark:text-gray-400 text-medium transition-colors duration-300">
                            Provide liquidity, and it&apos;s all done. Your crypto will work for you 24/7, forever.
                        </p>
                    </div>
                </div>

                {/* Card 2 */}
                <div className=" bg-white dark:bg-[#555C6F]/10 backdrop-blur-sm rounded-2xl text-left border border-gray-300 dark:border-gray-800">
                    <div className="bg-gray-500 dark:bg-gray-300 rounded-t-2xl w-full h-auto mx-auto flex items-center justify-center">
                        <div className="p-4 w-full h-60 flex items-center justify-center transform-gpu">
                            <Image
                                src="/homePage/rc2.svg"
                                alt="Directional Liquidity"
                                width={280}
                                height={176}
                                className="w-full h-auto sm:max-w-[250px] md:max-w-[280px]"
                                style={{ objectFit: 'contain' }}
                                priority={true}
                            />
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                            Bidirectional <br />
                            Liquidity Prediction
                        </h3>
                        <p className="opacity-80 text-gray-600 dark:text-gray-400 text-medium transition-colors duration-300">
                            Predict market movements with liquidity positions
                            to maximize your returns.
                        </p>
                    </div>
                </div>

                {/* Card 3 */}
                <div className=" bg-white dark:bg-[#555C6F]/10 backdrop-blur-sm rounded-2xl text-left border border-gray-300 dark:border-gray-800">
                    <div className="dark:bg-gray-700/50 bg-gray-300/50 rounded-t-2xl w-full h-auto mx-auto flex items-center justify-center">
                        <div className="p-4 w-full h-60 flex items-center justify-center transform-gpu">
                            <Image
                                src="/homePage/rc3.svg"
                                alt="Prediction Market Mechanics"
                                width={280}
                                height={176}
                                className="w-full h-auto sm:max-w-[250px] md:max-w-[280px]"
                                style={{ objectFit: 'contain' }}
                                priority={true}
                            />
                        </div>
                    </div>
                    <div className="p-6">
                        <h3 className=" text-2xl font-medium text-gray-900 dark:text-white mb-3 transition-colors duration-300">
                            Decentralized and <br />
                            Automated Markets
                        </h3>
                        <p className="opacity-80 text-gray-600 dark:text-gray-400 text-medium transition-colors duration-300">
                            No manual management. Rewards are auto-compounded.
                            Accessible to everyone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default React.memo(FeatureCards)
