export default function Footer() {
  return (
    <footer className="relative bg-black min-h-[400px] overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/assets/images/footer-bg.svg"
          alt=""
          className="w-full h-full object-cover mix-blend-plus-lighter opacity-30"
        />
      </div>

      {/* Sticky Logo - Outside Max Width */}
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

      <div className="relative max-w-[1280px] mx-auto px-[84px] py-12 flex items-end justify-end gap-20">
        <div className="flex flex-col items-start gap-0 mb-12">
          <a href="#vaults" className="text-white font-dm-sans text-[14px] font-normal leading-[21px] px-2 py-3 hover:opacity-80 transition-opacity">
            Vaults
          </a>
          <a href="#portfolio" className="text-white font-dm-sans text-[14px] font-normal leading-[21px] px-2 py-3 hover:opacity-80 transition-opacity">
            Portfolio
          </a>
          <a href="#docs" className="text-white font-dm-sans text-[14px] font-normal leading-[21px] px-2 py-3 hover:opacity-80 transition-opacity">
            Docs
          </a>
        </div>

        <div className="flex items-center gap-2 self-start mb-12">
          <a
            href="#"
            className="w-11 h-11 rounded-full border glass-border flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="X (Twitter)"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.7454 8.8365L17.2223 1H15.9484L9.94844 7.82984L5.22234 1H0L6.77889 9.99332L0 18H1.27388L7.57612 10.8367L12.5554 18H17.7777L10.7454 8.8365ZM8.35457 9.87084L7.62234 8.73916L1.83456 2.30332H4.48901L9.14678 7.46916L9.879 8.60084L15.949 16.7367H13.2946L8.35457 9.87084Z" fill="#7D7D85"/>
            </svg>
          </a>
          <a
            href="#"
            className="w-11 h-11 rounded-full border glass-border flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Instagram"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6.5C7.61 6.5 6.5 7.61 6.5 9C6.5 10.39 7.61 11.5 9 11.5C10.39 11.5 11.5 10.39 11.5 9C11.5 7.61 10.39 6.5 9 6.5ZM9 10.5C8.17 10.5 7.5 9.83 7.5 9C7.5 8.17 8.17 7.5 9 7.5C9.83 7.5 10.5 8.17 10.5 9C10.5 9.83 9.83 10.5 9 10.5ZM12 5.5C11.45 5.5 11 5.95 11 6.5C11 7.05 11.45 7.5 12 7.5C12.55 7.5 13 7.05 13 6.5C13 5.95 12.55 5.5 12 5.5ZM9 2C5.69 2 3 4.69 3 8V10C3 13.31 5.69 16 9 16H11C14.31 16 17 13.31 17 10V8C17 4.69 14.31 2 11 2H9ZM9 3H11C13.76 3 16 5.24 16 8V10C16 12.76 13.76 15 11 15H9C6.24 15 4 12.76 4 10V8C4 5.24 6.24 3 9 3Z" fill="white"/>
            </svg>
          </a>
          <a
            href="#"
            className="w-11 h-11 rounded-full border glass-border flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="YouTube"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.29 5.38C17.04 4.49 16.43 3.86 15.58 3.60C13.11 3 9 3 9 3C9 3 4.77 3 2.18 3.60C1.32 3.86 0.71 4.49 0.47 5.38C0.22 7.03 0.22 9 0.22 9C0.22 9 0.22 10.97 0.59 12.62C0.83 13.51 1.44 14.14 2.30 14.40C4.77 15 9 15 9 15C9 15 13.11 15 15.70 14.40C16.56 14.14 17.17 13.51 17.41 12.62C17.78 10.97 17.78 9 17.78 9C17.78 9 17.78 7.03 17.29 5.38ZM7.04 11.38V6.62L12.18 9L7.04 11.38Z" fill="white"/>
            </svg>
          </a>
          <a
            href="#"
            className="w-11 h-11 rounded-full border glass-border flex items-center justify-center hover:bg-white/10 transition-colors"
            aria-label="Telegram"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.20 8.53C6.02 6.90 8.56 5.82 9.84 5.30C13.47 3.82 14.23 3.56 14.72 3.56C14.83 3.55 15.07 3.58 15.23 3.71C15.36 3.81 15.40 3.95 15.42 4.05C15.43 4.15 15.45 4.38 15.44 4.56C15.24 6.59 14.39 11.52 13.95 13.79C13.77 14.75 13.41 15.07 13.06 15.11C12.30 15.17 11.72 14.61 10.98 14.14C9.83 13.40 9.18 12.94 8.06 12.21C6.77 11.38 7.61 10.92 8.34 10.17C8.54 9.97 11.89 6.99 11.95 6.71C11.96 6.68 11.97 6.55 11.89 6.49C11.81 6.42 11.70 6.44 11.62 6.46C11.50 6.49 9.66 7.68 6.10 10.04C5.57 10.39 5.10 10.56 4.68 10.56C4.21 10.55 3.31 10.30 2.64 10.08C1.82 9.82 1.17 9.68 1.23 9.24C1.25 9.01 1.58 8.77 2.20 8.53Z" fill="white"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

