import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import StatusDashboard from '../StatusDashboard';
import { apiService } from '../../services/api';
import type { SafetyStatusResponse, ViewingWindowResponse, WeatherData } from '../../services/api';

// Mock framer-motion to avoid animation issues
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
}));

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    getSafetyStatus: vi.fn(),
    getViewingWindow: vi.fn(),
    getWeatherData: vi.fn(),
  },
}));

describe('StatusDashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockSafetyStatus: SafetyStatusResponse = {
    status: 'ACTIVE',
    reason: 'All systems operational',
    currentTime: '2024-01-15T10:00:00Z',
    viewingWindow: {
      start: '2024-01-15T09:00:00Z',
      end: '2024-01-16T05:00:00Z'
    }
  };

  const mockViewingWindow: ViewingWindowResponse = {
    current: {
      start: '2024-01-15T09:00:00Z',
      end: '2024-01-16T05:00:00Z',
      isActive: true
    },
    next: {
      start: '2024-01-16T09:30:00Z',
      end: '2024-01-17T04:30:00Z'
    },
    sunrise: '2024-01-16T06:00:00Z',
    sunset: '2024-01-15T20:00:00Z',
    isDaylightSaving: true,
    timeZone: 'AEDT'
  };

  const mockWeatherData: WeatherData = {
    temperature: '22.5°C',
    humidity: '65%',
    pressure: '1013.2 hPa',
    dewPoint: '15.8°C'
  };

  describe('Dashboard Updates with Changing System Status', () => {
    it('displays loading state initially', () => {
      vi.mocked(apiService.getSafetyStatus).mockImplementation(() => new Promise(() => {}));
      vi.mocked(apiService.getViewingWindow).mockImplementation(() => new Promise(() => {}));
      vi.mocked(apiService.getWeatherData).mockImplementation(() => new Promise(() => {}));
      
      render(<StatusDashboard />);
      
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    it('displays complete dashboard with ACTIVE status', async () => {
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockSafetyStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockResolvedValue(mockWeatherData);

      render(<StatusDashboard />);

      await waitFor(() => {
        expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
      });

      // Check safety status section
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Telescope is available for use')).toBeInTheDocument();

      // Check viewing schedule section
      expect(screen.getByText('Viewing Schedule')).toBeInTheDocument();
      expect(screen.getByText('Current Window')).toBeInTheDocument();

      // Check weather section
      expect(screen.getByText('Weather')).toBeInTheDocument();
      expect(screen.getByText('Temperature')).toBeInTheDocument();
      expect(screen.getByText('22.5°C')).toBeInTheDocument();

      // Check system info section
      expect(screen.getByText('System Info')).toBeInTheDocument();
      expect(screen.getByText('Melbourne, AU')).toBeInTheDocument();
    });

    it('updates status when system status changes', async () => {
      const initialStatus = { ...mockSafetyStatus, status: 'ACTIVE' as const };
      const updatedStatus = { ...mockSafetyStatus, status: 'UNSAFE' as const, nextAvailable: '2024-01-15T12:00:00Z' };

      vi.mocked(apiService.getSafetyStatus)
        .mockResolvedValueOnce(initialStatus)
        .mockResolvedValueOnce(updatedStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockResolvedValue(mockWeatherData);

      render(<StatusDashboard />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      // Advance time to trigger refresh (30 seconds)
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Wait for status update
      await waitFor(() => {
        expect(screen.getByText('Unsafe')).toBeInTheDocument();
      });

      expect(screen.getByText('Offline due to bad weather conditions')).toBeInTheDocument();
    });

    it('refreshes data automatically every 30 seconds', async () => {
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockSafetyStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockResolvedValue(mockWeatherData);

      render(<StatusDashboard />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      // Verify initial calls
      expect(vi.mocked(apiService.getSafetyStatus)).toHaveBeenCalledTimes(1);

      // Advance time by 30 seconds
      act(() => {
        vi.advanceTimersByTime(30000);
      });

      // Should have been called again
      await waitFor(() => {
        expect(vi.mocked(apiService.getSafetyStatus)).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Integration with Existing Page Layouts', () => {
    it('applies custom className correctly', async () => {
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockSafetyStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockResolvedValue(mockWeatherData);

      const { container } = render(<StatusDashboard className="custom-dashboard-class" />);

      await waitFor(() => {
        expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
      });

      const dashboardElement = container.querySelector('.custom-dashboard-class');
      expect(dashboardElement).toBeInTheDocument();
    });

    it('maintains consistent styling with existing components', async () => {
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockSafetyStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockResolvedValue(mockWeatherData);

      const { container } = render(<StatusDashboard />);

      await waitFor(() => {
        expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
      });

      // Check for consistent slate theme classes
      const dashboardContainer = container.querySelector('.bg-slate-800\\/50');
      expect(dashboardContainer).toBeInTheDocument();
      expect(dashboardContainer).toHaveClass('backdrop-blur-sm', 'border', 'border-slate-700', 'rounded-2xl');
    });

    it('integrates properly with grid layout systems', async () => {
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockSafetyStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockResolvedValue(mockWeatherData);

      const { container } = render(<StatusDashboard />);

      await waitFor(() => {
        expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
      });

      // Check for responsive grid layout
      const gridContainer = container.querySelector('.grid.grid-cols-1.lg\\:grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
      expect(gridContainer).toHaveClass('gap-6');
    });

    it('handles error states with consistent styling', async () => {
      vi.mocked(apiService.getSafetyStatus).mockRejectedValue(new Error('Network error'));
      vi.mocked(apiService.getViewingWindow).mockRejectedValue(new Error('Network error'));
      vi.mocked(apiService.getWeatherData).mockRejectedValue(new Error('Network error'));

      const { container } = render(<StatusDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      });

      // Check error styling consistency
      const errorContainer = container.querySelector('.border-red-500\\/20');
      expect(errorContainer).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior and Performance', () => {
    it('renders correctly on different screen sizes', async () => {
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockSafetyStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockResolvedValue(mockWeatherData);

      const { container } = render(<StatusDashboard />);

      await waitFor(() => {
        expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
      });

      // Check responsive grid classes
      const mainGrid = container.querySelector('.grid-cols-1.lg\\:grid-cols-3');
      expect(mainGrid).toBeInTheDocument();

      // Check responsive column spans
      const safetySection = container.querySelector('.lg\\:col-span-2');
      expect(safetySection).toBeInTheDocument();
    });

    it('handles component unmounting without memory leaks', async () => {
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockSafetyStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockResolvedValue(mockWeatherData);

      const { unmount } = render(<StatusDashboard />);

      await waitFor(() => {
        expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
      });

      // Unmount should not throw errors
      expect(() => unmount()).not.toThrow();
    });

    it('performs efficiently with frequent updates', async () => {
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockSafetyStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockResolvedValue(mockWeatherData);

      render(<StatusDashboard />);

      await waitFor(() => {
        expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
      });

      // Simulate multiple rapid updates
      for (let i = 0; i < 3; i++) {
        act(() => {
          vi.advanceTimersByTime(30000);
        });
      }

      // Component should still be responsive
      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      // API should have been called for each interval
      expect(vi.mocked(apiService.getSafetyStatus)).toHaveBeenCalledTimes(4); // Initial + 3 updates
    });

    it('handles partial API failures gracefully', async () => {
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockSafetyStatus);
      vi.mocked(apiService.getViewingWindow).mockResolvedValue(mockViewingWindow);
      vi.mocked(apiService.getWeatherData).mockRejectedValue(new Error('Weather API unavailable'));

      render(<StatusDashboard />);

      await waitFor(() => {
        expect(screen.getByText('System Status Dashboard')).toBeInTheDocument();
      });

      // Safety and viewing window sections should still render
      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Viewing Schedule')).toBeInTheDocument();

      // Weather section should not render due to API failure
      expect(screen.queryByText('Weather')).not.toBeInTheDocument();
    });
  });
});