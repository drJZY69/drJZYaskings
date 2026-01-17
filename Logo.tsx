
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 64 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
    >
      <defs>
        <linearGradient id="vr-prime-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Abstract Integrated V and R */}
      {/* The V flows into the R's spine */}
      <path 
        d="M25 30 L45 75 L65 30 M65 30 C85 30 85 50 65 50 H55 M65 50 L85 80" 
        stroke="url(#vr-prime-grad)" 
        strokeWidth="7" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#neon-glow)"
      />
      
      {/* Sharp Accent Line */}
      <path 
        d="M40 65 L45 75 L50 65" 
        stroke="white" 
        strokeWidth="2" 
        strokeLinecap="round" 
        opacity="0.6"
      />
      
      {/* Technical Vertex Points */}
      <circle cx="25" cy="30" r="2.5" fill="#8B5CF6" />
      <circle cx="85" cy="80" r="2.5" fill="#3B82F6" />
    </svg>
  );
};

export default Logo;
