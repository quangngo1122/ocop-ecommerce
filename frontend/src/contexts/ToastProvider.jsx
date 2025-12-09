import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

const severityStyles = {
  info: "bg-blue-500 text-white",
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-yellow-400 text-black",
};

export const ToastProvider = ({ children }) => {
  const [current, setCurrent] = useState(null);
  const queueRef = useRef([]);
  const timerRef = useRef(null);

  const showToast = useCallback(
    (message, severity = "info") => {
      queueRef.current.push({ message, severity, id: Date.now() });
      if (!current) {
        processQueue();
      }
    },
    [current]
  );

  const processQueue = useCallback(() => {
    if (queueRef.current.length > 0) {
      const next = queueRef.current.shift();
      setCurrent(next);

      timerRef.current = setTimeout(() => {
        setCurrent(null);
        processQueue();
      }, 3000);
    }
  }, []);

  const handleClose = useCallback(() => {
    setCurrent(null);
    clearTimeout(timerRef.current);
    processQueue();
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast UI */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {current && (
          <div
            className={`flex items-center px-4 py-3 rounded shadow-lg min-w-[220px] max-w-xs ${
              severityStyles[current.severity] || severityStyles.info
            } animate-fade-in`}
            role="alert"
          >
            <span className="flex-1">{current.message}</span>
            <button
              className="ml-3 cursor-pointer text-xl font-bold focus:outline-none"
              onClick={handleClose}
              aria-label="Đóng"
              type="button"
            >
              ×
            </button>
          </div>
        )}
      </div>
      {/* Tailwind animation */}
      <style>
        {`
          .animate-fade-in {
            animation: fadeIn 0.3s;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px);}
            to { opacity: 1; transform: translateY(0);}
          }
        `}
      </style>
    </ToastContext.Provider>
  );
};
