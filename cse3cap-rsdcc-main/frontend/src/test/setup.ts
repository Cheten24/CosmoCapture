import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => React.createElement('div', props, children),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock API service
vi.mock('../services/api', () => ({
  apiService: {
    getSafetyStatus: vi.fn(),
  },
}));