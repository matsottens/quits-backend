/// <reference types="react" />
/// <reference types="react/jsx-runtime" />

// Global TypeScript declarations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      svg: React.SVGProps<SVGSVGElement>;
      path: React.SVGProps<SVGPathElement>;
      circle: React.SVGProps<SVGCircleElement>;
      rect: React.SVGProps<SVGRectElement>;
      g: React.SVGProps<SVGGElement>;
      polygon: React.SVGProps<SVGPolygonElement>;
      line: React.SVGProps<SVGLineElement>;
    }
  }
}

export {};
