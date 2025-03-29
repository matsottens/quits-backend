import React from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';

// Link component that mimics Next.js Link
export const Link: React.FC<{
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}> = ({ href, children, ...props }) => {
  return <RouterLink to={href} {...props}>{children}</RouterLink>;
};

// Image component that mimics Next.js Image
export const Image: React.FC<{
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}> = ({ src, alt, width, height, className }) => {
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

// Router hooks that mimic Next.js router
export const useRouter = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    push: (path: string) => navigate(path),
    replace: (path: string) => navigate(path, { replace: true }),
    back: () => navigate(-1),
    pathname: location.pathname,
  };
};

export const usePathname = () => {
  const location = useLocation();
  return location.pathname;
}; 