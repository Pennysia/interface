import Image from "next/image";

export default function LearnMoreSection() {
  return (
    <div className="max-w-6xl mx-auto py-24 px-4">
      <div className="flex flex-col items-center mb-16 gap-4">
        <h2 className="text-3xl md:text-4xl font-base text-center text-[#2E2F46] dark:text-white">
          Learn more.
        </h2>
        <p className="text-center text-base opacity-80">
          {" "}
          Be a part of Pennysia and help shape the future of DeFi together.
        </p>
      </div>

      <div className="space-y-8">
        {/* First row - 2 cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-gray-200/50 dark:bg-[#555C6F]/20 backdrop-blur-sm rounded-2xl border border-[#555C6F]/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-end h-full w-full">
              <div className="flex flex-col p-6 h-full w-full">
                <h3 className="text-xl md:text-2xl font-normal text-[#2E2F46] dark:text-white mb-3">
                  Documentation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Comprehensive guides users and technical references for
                  developers.
                </p>
                <a
                  href="https://docs.pennysia.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#19192A] dark:text-white text-sm inline-flex items-center w-fit hover:bg-[#A7ADBB] bg-transparent border border-[#555C6F] font-normal py-3 px-6 rounded-full transition-all duration-200 cursor-pointer"
                >
                  Read Docs{" "}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              <div className="flex justify-end">
                <Image
                  src="/homePage/doc.svg"
                  alt="Doc"
                  width={300}
                  height={200}
                  className="w-full h-auto object-contain max-w-[300px] rounded-2xl"
                />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-200/50 dark:bg-[#555C6F]/20 backdrop-blur-sm rounded-2xl border border-[#555C6F]/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-end h-full w-full">
              <div className="flex flex-col p-6 h-full w-full">
                <h3 className="text-xl md:text-2xl font-normal text-[#2E2F46] dark:text-white mb-3">
                  Source Code
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Open-source smart contracts and frontend implementations.
                </p>
                <a
                  href="https://github.com/Pennysia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#19192A] dark:text-white text-sm inline-flex items-center w-fit hover:bg-[#A7ADBB] bg-transparent border border-[#555C6F] font-normal py-3 px-6 rounded-full transition-all duration-200 cursor-pointer"
                >
                  View on GitHub{" "}
                  <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              <div className="flex justify-end">
                <Image
                  src="/homePage/github.svg"
                  alt="Github"
                  width={300}
                  height={200}
                  className="w-full h-auto object-contain max-w-[300px] rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Second row - 1 card */}
        <div className="grid grid-cols-1  ">
          <div className="bg-gray-200/50 dark:bg-[#555C6F]/20 backdrop-blur-sm rounded-2xl border border-[#555C6F]/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-end h-full w-full">
              <div className="flex flex-col p-6 h-full w-full">
                <h3 className="text-xl md:text-2xl font-normal text-[#2E2F46] dark:text-white mb-3">
                  Contact Us
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Get in touch with our team for support and partnerships.
                </p>
                <a
                  href="mailto:hello@pennysia.com"
                  className="text-white dark:text-[#19192A] text-sm inline-flex items-center w-fit hover:bg-[#A7ADBB] bg-[#19192A] dark:bg-[#E7E8EB] border border-[#555C6F] font-normal py-3 px-6 rounded-full transition-all duration-200 cursor-pointer"
                >
                  Get in Touch
                </a>
              </div>
              <div className="flex justify-end">
                <Image
                  src="/homePage/contact.svg"
                  alt="Risk Management"
                  width={300}
                  height={200}
                  className="w-full h-auto object-contain max-w-[300px] rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
