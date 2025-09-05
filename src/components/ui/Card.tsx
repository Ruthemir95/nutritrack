import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  interactive?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  interactive = false,
  glass = false,
  onClick,
}) => {
  const baseClasses = 'card';
  const hoverClass = hover ? 'card-hover' : '';
  const interactiveClass = interactive ? 'card-interactive' : '';
  const glassClass = glass ? 'glass' : '';

  const classes = `${baseClasses} ${hoverClass} ${interactiveClass} ${glassClass} ${className}`.trim();

  const CardComponent = onClick ? motion.div : 'div';
  const cardProps = onClick ? {
    onClick,
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 },
  } : {};

  return (
    <CardComponent className={classes} {...cardProps}>
      {children}
    </CardComponent>
  );
};

export default Card;
