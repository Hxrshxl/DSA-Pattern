"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import {
  Toaster as BaseToaster,
  toast as baseToast,
  type ToasterProps,
} from "sonner";

// --- Custom Themed <Toaster /> Component ---
export function Toaster() {
  const { theme = "system" } = useTheme();

  return (
    <BaseToaster
      theme={theme as ToasterProps["theme"]}
      position="top-right"
      closeButton
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
}

// --- Re-export `toast()` API ---
export const toast = baseToast;

// --- Optional Utility Shortcuts ---
export const toastSuccess = (
  message: string,
  options?: Parameters<typeof baseToast>[1]
) => baseToast.success(message, options);

export const toastError = (
  message: string,
  options?: Parameters<typeof baseToast>[1]
) => baseToast.error(message, options);

export const toastInfo = (
  message: string,
  options?: Parameters<typeof baseToast>[1]
) =>
  baseToast(message, {
    ...options,
    icon: "ℹ️",
  });

// --- ✅ Export type used by use-toast.ts
export type ToastActionElement = React.ReactElement;
