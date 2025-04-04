declare module 'sonner' {
  import * as React from 'react';
  
  type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading';
  type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
  
  interface ToastClassnames {
    toast?: string;
    title?: string;
    description?: string;
    loader?: string;
    closeButton?: string;
    cancelButton?: string;
    actionButton?: string;
    success?: string;
    error?: string;
    info?: string;
    warning?: string;
    loading?: string;
    icon?: string;
  }
  
  interface ToastOptions {
    id?: number | string;
    icon?: React.ReactNode;
    duration?: number;
    promise?: Promise<any>;
    cancelButtonStyle?: React.CSSProperties;
    actionButtonStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    unstyled?: boolean;
    className?: string;
    descriptionClassName?: string;
    position?: Position;
    delete?: boolean;
    important?: boolean;
    classNames?: ToastClassnames;
    dismissible?: boolean;
    onDismiss?: (toast: ToastT) => void;
    onAutoClose?: (toast: ToastT) => void;
    action?: {
      label: string;
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    };
    cancel?: {
      label: string;
      onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    };
  }
  
  interface ToastT {
    id: number | string;
    title?: React.ReactNode;
    type?: ToastTypes;
    icon?: React.ReactNode;
    dismissible?: boolean;
    description?: React.ReactNode;
    duration?: number;
    delete?: boolean;
    important?: boolean;
    action?: {
      label: string;
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    };
    cancel?: {
      label: string;
      onClick: () => void;
    };
    onDismiss?: (toast: ToastT) => void;
    onAutoClose?: (toast: ToastT) => void;
    promise?: Promise<any>;
    cancelButtonStyle?: React.CSSProperties;
    actionButtonStyle?: React.CSSProperties;
    style?: React.CSSProperties;
    unstyled?: boolean;
    className?: string;
    classNames?: ToastClassnames;
    descriptionClassName?: string;
  }
  
  interface ToasterProps {
    invert?: boolean;
    theme?: 'light' | 'dark' | 'system';
    position?: Position;
    hotkey?: string[];
    richColors?: boolean;
    expand?: boolean;
    duration?: number;
    visibleToasts?: number;
    closeButton?: boolean;
    toastOptions?: Partial<ToastOptions>;
    className?: string;
    style?: React.CSSProperties;
    offset?: string | number;
    dir?: 'auto' | 'ltr' | 'rtl';
    gap?: number;
  }
  
  export class Toaster extends React.Component<ToasterProps> {}
  
  export const toast: {
    (message: React.ReactNode, options?: ToastOptions): string | number;
    success: (message: React.ReactNode, options?: ToastOptions) => string | number;
    error: (message: React.ReactNode, options?: ToastOptions) => string | number;
    warning: (message: React.ReactNode, options?: ToastOptions) => string | number;
    info: (message: React.ReactNode, options?: ToastOptions) => string | number;
    loading: (message: React.ReactNode, options?: ToastOptions) => string | number;
    promise: <T>(
      promise: Promise<T>,
      options: {
        loading: React.ReactNode;
        success: React.ReactNode | ((data: T) => React.ReactNode);
        error: React.ReactNode | ((error: unknown) => React.ReactNode);
      } & ToastOptions
    ) => Promise<T>;
    dismiss: (id?: string | number) => void;
    custom: (
      content: (id: string | number) => React.ReactNode,
      options?: ToastOptions
    ) => string | number;
  };
} 