declare module 'class-variance-authority' {
  export type VariantProps<T> = {
    variant?: string;
    size?: string;
    className?: string;
  } & {
    [key: string]: any;
  };

  export interface CVAConfig {
    variants?: {
      variant?: Record<string, string>;
      size?: Record<string, string>;
      [key: string]: Record<string, string> | undefined;
    };
    defaultVariants?: {
      variant?: string;
      size?: string;
      [key: string]: string | undefined;
    };
    compoundVariants?: Array<Record<string, any> & { class: string }>;
  }

  export function cva(
    base: string | string[],
    config?: CVAConfig
  ): (props?: { variant?: string; size?: string; className?: string } & Record<string, any>) => string;

  export type ClassValue = string | number | boolean | undefined | null | ClassValue[];

  export function cx(...inputs: ClassValue[]): string;
  export const cn: typeof cx;
} 