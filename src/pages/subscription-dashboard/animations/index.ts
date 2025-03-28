import { keyframes } from '@emotion/react';

// Fade animations
export const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Slide animations
export const slideInUp = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInDown = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideInLeft = keyframes`
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const slideInRight = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

// Scale animations
export const scaleIn = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

export const scaleOut = keyframes`
  from {
    transform: scale(1);
    opacity: 1;
  }
  to {
    transform: scale(0.95);
    opacity: 0;
  }
`;

// Rotate animations
export const rotateIn = keyframes`
  from {
    transform: rotate(-180deg);
    opacity: 0;
  }
  to {
    transform: rotate(0);
    opacity: 1;
  }
`;

export const rotateOut = keyframes`
  from {
    transform: rotate(0);
    opacity: 1;
  }
  to {
    transform: rotate(180deg);
    opacity: 0;
  }
`;

// Bounce animations
export const bounceIn = keyframes`
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
  70% {
    transform: scale(0.9);
    opacity: 0.9;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const bounceOut = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  20% {
    transform: scale(1.1);
    opacity: 0.9;
  }
  50% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.3);
    opacity: 0;
  }
`;

// Shake animations
export const shake = keyframes`
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
`;

// Pulse animations
export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Spin animations
export const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Animation utilities
export const getAnimationDuration = (duration: number = 200) => `${duration}ms`;
export const getAnimationTiming = (timing: string = 'ease-in-out') => timing;
export const getAnimationDelay = (delay: number = 0) => `${delay}ms`;
export const getAnimationIterationCount = (count: number | 'infinite' = 1) => count;
export const getAnimationFillMode = (mode: 'forwards' | 'backwards' | 'both' | 'none' = 'forwards') => mode;
export const getAnimationDirection = (direction: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse' = 'normal') => direction;

// Animation presets
export const fadeInAnimation = {
  animation: `${fadeIn} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const fadeOutAnimation = {
  animation: `${fadeOut} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const slideInUpAnimation = {
  animation: `${slideInUp} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const slideInDownAnimation = {
  animation: `${slideInDown} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const slideInLeftAnimation = {
  animation: `${slideInLeft} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const slideInRightAnimation = {
  animation: `${slideInRight} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const scaleInAnimation = {
  animation: `${scaleIn} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const scaleOutAnimation = {
  animation: `${scaleOut} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const rotateInAnimation = {
  animation: `${rotateIn} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const rotateOutAnimation = {
  animation: `${rotateOut} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const bounceInAnimation = {
  animation: `${bounceIn} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const bounceOutAnimation = {
  animation: `${bounceOut} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const shakeAnimation = {
  animation: `${shake} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const pulseAnimation = {
  animation: `${pulse} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
};

export const spinAnimation = {
  animation: `${spin} ${getAnimationDuration()} ${getAnimationTiming()} ${getAnimationDelay()} ${getAnimationIterationCount()} ${getAnimationFillMode()}`,
}; 