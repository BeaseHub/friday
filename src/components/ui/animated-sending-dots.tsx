export const AnimatedSendingDots = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <span className="inline-flex items-center ml-2">
    <span className={`dot ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`}></span>
    <span className={`dot ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0.2s' }}></span>
    <span className={`dot ${isDarkMode ? 'bg-gray-500' : 'bg-gray-400'}`} style={{ animationDelay: '0.4s' }}></span>
    <style>
      {`
        .dot {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin: 0 2px;
          opacity: 0.4;
          animation: dot-flash 1s infinite;
        }
        @keyframes dot-flash {
          0%, 80%, 100% { opacity: 0.4; }
          40% { opacity: 1; }
        }
      `}
    </style>
  </span>
);