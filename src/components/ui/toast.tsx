"use client";

import * as React from "react";
import {
  Toast as SonnerToast,
  ToastProps as SonnerToastProps,
  ToastAction as SonnerToastAction,
} from "sonner";

// Basic type re-exports
export type ToastProps = SonnerToastProps;
export type ToastActionElement = React.ReactElement<typeof SonnerToastAction>;

// Optional: you can export UI components too
export {
  SonnerToast as Toast,
  SonnerToastAction as ToastAction,
};
