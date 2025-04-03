declare module '@radix-ui/react-toggle-group' {
  import * as React from 'react';

  interface ToggleGroupSingleProps extends React.HTMLAttributes<HTMLDivElement> {
    type: 'single';
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
  }

  interface ToggleGroupMultipleProps extends React.HTMLAttributes<HTMLDivElement> {
    type: 'multiple';
    value?: string[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
  }

  interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    disabled?: boolean;
  }

  const Root: React.ForwardRefExoticComponent<
    (ToggleGroupSingleProps | ToggleGroupMultipleProps) & React.RefAttributes<HTMLDivElement>
  >;

  const Item: React.ForwardRefExoticComponent<
    ToggleGroupItemProps & React.RefAttributes<HTMLButtonElement>
  >;
}

declare module '@radix-ui/react-toast' {
  import * as React from 'react';

  interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    type?: 'foreground' | 'background';
    duration?: number;
  }

  interface ToastActionElement {
    altText: string;
    onClick: () => void;
  }

  const Provider: React.FC<{ children: React.ReactNode }>;
  const Viewport: React.FC<React.HTMLAttributes<HTMLOListElement>>;
  const Root: React.ForwardRefExoticComponent<ToastProps & React.RefAttributes<HTMLDivElement>>;
  const Action: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  const Close: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>>;
  const Title: React.FC<React.HTMLAttributes<HTMLDivElement>>;
  const Description: React.FC<React.HTMLAttributes<HTMLDivElement>>;
} 