import * as React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

// Add JSX namespace declaration
declare global {
  namespace JSX {
    interface IntrinsicElements {
      svg: React.SVGProps<SVGSVGElement>;
      path: React.SVGProps<SVGPathElement>;
    }
  }
}


interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Link component that mimics Next.js Link
export const Link = ({ href, children, ...props }: LinkProps): JSX.Element => {
  return <RouterLink to={href} {...props}>{children}</RouterLink>;
};

interface ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

// Image component that mimics Next.js Image
export const Image = ({ src, alt, width, height, className }: ImageProps): JSX.Element => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  );
};

interface RouterInterface {
  push: (path: string) => void;
  replace: (path: string) => void;
  back: () => void;
  pathname: string;
}

// Router hooks that mimic Next.js router
export const useRouter = (): RouterInterface => {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    pathname: location.pathname,
  };
};

export const usePathname = (): string => {
  const location = useLocation();
  return location.pathname;
}; 