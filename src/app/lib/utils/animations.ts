'use client';

import { motion } from 'framer-motion';

// Animation variants
export const inputHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

export const checkboxRipple = {
  scale: [1, 1.1, 1],
  transition: { duration: 0.3 }
};

export const labelPulse = {
  scale: [1, 1.05, 1],
  transition: { duration: 0.3 }
};

export const progressGlow = {
  boxShadow: "0 0 20px rgba(244, 197, 66, 0.5)",
  transition: { duration: 0.3 }
};

export const checkmarkAnimation = {
  scale: [0, 1.2, 1],
  transition: { duration: 0.3 }
};

// Sound effects with lazy initialization
let clickSound: HTMLAudioElement | null = null;
let successSound: HTMLAudioElement | null = null;

const initializeSounds = () => {
  if (typeof window === 'undefined') return;
  
  if (!clickSound) {
    try {
      clickSound = new Audio('/sounds/click.mp3');
    } catch (error) {
      console.warn('Failed to load click sound');
    }
  }
  
  if (!successSound) {
    try {
      successSound = new Audio('/sounds/success.mp3');
    } catch (error) {
      console.warn('Failed to load success sound');
    }
  }
};

export const playClickSound = () => {
  initializeSounds();
  if (clickSound) {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {
      // Ignore play errors
    });
  }
};

export const playSuccessSound = () => {
  initializeSounds();
  if (successSound) {
    successSound.currentTime = 0;
    successSound.play().catch(() => {
      // Ignore play errors
    });
  }
};

export const confettiAnimation = {
  opacity: [0, 1, 0],
  y: [0, -20],
  transition: { duration: 1 }
};

export const parallaxStyle = {
  transform: "translateY(0px)",
  transition: "transform 0.1s ease-out"
}; 