export default function Footer() {
  return (
    <footer className="relative bg-black min-h-[500px] overflow-hidden">
      {/* Purple gradient background */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-purple-800/10 to-purple-900/20"></div> */}
      <div className="absolute bottom-0 left-0 flex items-center">
        <h2 className="font-modernist font-bold text-[269px] leading-[110%] tracking-[-5.385px] text-white">
          Gami
        </h2>
        <svg
          className="ml-4 -mt-48"
          width="87"
          height="87"
          viewBox="0 0 87 87"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M43.5839 86.7119C19.9311 86.7119 0.501953 67.9106 0.501953 43.63C0.501953 19.3494 19.9311 0.548096 43.5839 0.548096C67.2367 0.548096 86.6658 19.3494 86.6658 43.63C86.6658 67.9106 67.2367 86.7119 43.5839 86.7119ZM43.5839 75.3237C58.8948 75.3237 73.9946 62.7537 73.9946 43.63C73.9946 24.7212 58.8948 11.9363 43.5839 11.9363C28.2729 11.9363 13.1731 24.6138 13.1731 43.63C13.1731 62.6462 28.2729 75.3237 43.5839 75.3237ZM43.5839 67.5883C29.7512 67.5883 20.459 58.0265 20.459 43.63C20.459 29.341 29.7512 19.7792 43.5839 19.7792C54.8823 19.7792 63.7521 27.2997 65.864 38.4731H53.8264C52.3481 33.9608 48.23 30.9525 43.5839 30.9525C37.1427 30.9525 32.919 36.002 32.919 43.63C32.919 51.258 37.1427 56.4149 43.5839 56.4149C48.23 56.4149 52.3481 53.4067 53.8264 48.8944H65.864C63.7521 60.0678 54.8823 67.5883 43.5839 67.5883Z"
            fill="white"
          />
        </svg>
      </div>
      {/* Main content */}
      <div className="relative max-w-[1280px] mx-auto px-[84px] py-16">
        {/* Top section with description, navigation, and social icons */}
        <div className="flex justify-between items-start mb-20">
          {/* Left - Description */}
          <div className="max-w-md">
            <p className="text-white font-dm-sans text-[16px] font-normal leading-[140%]">
              Gami provides on-chain asset management <br/> infrastructure with active curation & dynamic risk <br/> management
            </p>
          </div>

          {/* Center - Navigation */}
          <div className="flex flex-col gap-4">
            <a href="#vaults" className="text-white font-dm-sans text-[16px] font-normal hover:opacity-80 transition-opacity">
              Vaults
            </a>
            <a href="#portfolio" className="text-white font-dm-sans text-[16px] font-normal hover:opacity-80 transition-opacity">
              Portfolio
            </a>
            <a href="#docs" className="text-white font-dm-sans text-[16px] font-normal hover:opacity-80 transition-opacity">
              Docs
            </a>
          </div>

          {/* Right - Social Icons */}
          <div className="flex items-center gap-3">
            <a
              href="#"
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 7.5C8.62 7.5 7.5 8.62 7.5 10C7.5 11.38 8.62 12.5 10 12.5C11.38 12.5 12.5 11.38 12.5 10C12.5 8.62 11.38 7.5 10 7.5ZM10 11.5C9.17 11.5 8.5 10.83 8.5 10C8.5 9.17 9.17 8.5 10 8.5C10.83 8.5 11.5 9.17 11.5 10C11.5 10.83 10.83 11.5 10 11.5ZM13.5 6.5C13.22 6.5 13 6.72 13 7C13 7.28 13.22 7.5 13.5 7.5C13.78 7.5 14 7.28 14 7C14 6.72 13.78 6.5 13.5 6.5ZM10 2C6.69 2 4 4.69 4 8V12C4 15.31 6.69 18 10 18H12C15.31 18 18 15.31 18 12V8C18 4.69 15.31 2 12 2H10ZM10 3H12C14.76 3 17 5.24 17 8V12C17 14.76 14.76 17 12 17H10C7.24 17 5 14.76 5 12V8C5 5.24 7.24 3 10 3Z" fill="white"/>
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Instagram"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 7.5C8.62 7.5 7.5 8.62 7.5 10C7.5 11.38 8.62 12.5 10 12.5C11.38 12.5 12.5 11.38 12.5 10C12.5 8.62 11.38 7.5 10 7.5ZM10 11.5C9.17 11.5 8.5 10.83 8.5 10C8.5 9.17 9.17 8.5 10 8.5C10.83 8.5 11.5 9.17 11.5 10C11.5 10.83 10.83 11.5 10 11.5ZM13.5 6.5C13.22 6.5 13 6.72 13 7C13 7.28 13.22 7.5 13.5 7.5C13.78 7.5 14 7.28 14 7C14 6.72 13.78 6.5 13.5 6.5ZM10 2C6.69 2 4 4.69 4 8V12C4 15.31 6.69 18 10 18H12C15.31 18 18 15.31 18 12V8C18 4.69 15.31 2 12 2H10ZM10 3H12C14.76 3 17 5.24 17 8V12C17 14.76 14.76 17 12 17H10C7.24 17 5 14.76 5 12V8C5 5.24 7.24 3 10 3Z" fill="white"/>
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="YouTube"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.21 6.38C18.96 5.49 18.35 4.86 17.5 4.60C15.11 4 11 4 11 4C11 4 6.77 4 4.18 4.60C3.32 4.86 2.71 5.49 2.47 6.38C2.22 8.03 2.22 10 2.22 10C2.22 10 2.22 11.97 2.59 13.62C2.83 14.51 3.44 15.14 4.30 15.40C6.77 16 11 16 11 16C11 16 15.11 16 17.70 15.40C18.56 15.14 19.17 14.51 19.41 13.62C19.78 11.97 19.78 10 19.78 10C19.78 10 19.78 8.03 19.21 6.38ZM8.04 12.38V7.62L13.18 10L8.04 12.38Z" fill="white"/>
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors"
              aria-label="Telegram"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.44 9.48C6.26 7.85 8.80 6.77 10.08 6.25C13.71 4.77 14.47 4.51 14.96 4.51C15.07 4.50 15.31 4.53 15.47 4.66C15.60 4.76 15.64 4.90 15.66 5.00C15.67 5.10 15.69 5.33 15.68 5.51C15.48 7.54 14.63 12.47 14.19 14.74C14.01 15.70 13.65 16.02 13.30 16.06C12.54 16.12 11.96 15.56 11.22 15.09C10.07 14.35 9.42 13.89 8.30 13.16C7.01 12.33 7.85 11.87 8.58 11.12C8.78 10.92 12.13 7.94 12.19 7.66C12.20 7.63 12.21 7.50 12.13 7.44C12.05 7.37 11.94 7.39 11.86 7.41C11.74 7.44 9.90 8.63 6.34 10.99C5.81 11.34 5.34 11.51 4.92 11.51C4.45 11.50 3.55 11.25 2.88 11.03C2.06 10.77 1.41 10.63 1.47 10.19C1.49 9.96 1.82 9.72 2.44 9.48Z" fill="white"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
        {/* Bottom section with logo and copyright */}
        <div className="absolute bottom-4 right-32 flex justify-end items-end">
          {/* Copyright */}
          <div className="text-white font-dm-sans text-[14px] font-normal">
            ©2025 Gami Labs. All rights reserved.
          </div>
        </div>

      {/* Bottom gradient line */}
      {/* <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-purple-400 via-purple-600 to-purple-800"></div> */}
    </footer>
  );
}

