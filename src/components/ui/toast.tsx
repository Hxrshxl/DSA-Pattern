"use client";

import * as React from "react";
import {
  Toaster,
  toast,
  ToastAction,
  type ToastProps,
} from "sonner";

// Export only the valid members
export { Toaster, toast, ToastAction };
export type { ToastProps };

// If you still need ToastActionElement:
export type ToastActionElement = React.ReactElement<typeof ToastAction>;
