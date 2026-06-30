"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type ToastType = "success" | "error" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useAdminToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useAdminToast must be used within AdminToastProvider");
  return ctx;
}

export function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const bgByType: Record<ToastType, string> = {
    success: "#8B956B",
    error: "#C0392B",
    warning: "#E2C383",
  };

  const textByType: Record<ToastType, string> = {
    success: "#FFFFFF",
    error: "#FFFFFF",
    warning: "#2C3830",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            style={{
              position: "fixed",
              top: 72,
              right: 16,
              zIndex: 9999,
              background: bgByType[toast.type],
              color: textByType[toast.type],
              padding: "12px 20px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              maxWidth: 320,
              wordBreak: "break-word",
            }}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}
