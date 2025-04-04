/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      ol: React.DetailedHTMLProps<React.OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
      pre: React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
    }

    interface IntrinsicAttributes {
      ref?: React.Ref<any>;
    }
  }
}

declare module 'react' {
  interface ForwardRefExoticComponent<P> {
    defaultProps?: Partial<P>;
    displayName?: string;
  }
  
  interface RefAttributes {
    ref?: React.Ref<any>;
  }

  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    ref?: React.Ref<T>;
  }
  
  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    ref?: React.Ref<T>;
  }

  interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
    ref?: React.Ref<T>;
  }
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: React.ComponentType;
}

export {}; 