import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import SafetyStatusDisplay from '../SafetyStatusDisplay';
import ControlLockOverlay from '../ControlLockOverlay';
import { apiService } from '../../services/api';

// Mock framer-motion to avoid animation issues
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock the API service
vi.mock('../../services/api', () => ({
  apiService: {
    getSafetyStatus: vi.fn(),
  },
}));

describe('Safety Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getSafetyStatus).mockClear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const createMockSafetyStatus = (status: 'ACTIVE' | 'UNSAFE' | 'CLOSED', nextAvailable?: string) => ({
    status,
    reason: `Test reason for ${status}`,
    nextAvailable,
    currentTime: '2024-01-15T10:00:00Z',
    viewingWindow: {
      start: '2024-01-15T09:00:00Z',
      end: '2024-01-16T05:00:00Z'
    }
  });

  describe('SafetyStatusDisplay', () => {
    it('displays loading state initially', () => {
      vi.mocked(apiService.getSafetyStatus).mockImplementation(() => new Promise(() => {}));
      
      render(<SafetyStatusDisplay />);
      
      expect(screen.getByText('Loading safety status...')).toBeInTheDocument();
    });

    it('displays ACTIVE status correctly', async () => {
      const mockStatus = createMockSafetyStatus('ACTIVE');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(<SafetyStatusDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      expect(screen.getByText('Telescope is available for use')).toBeInTheDocument();
      expect(screen.getByText('Test reason for ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('Current Viewing Window')).toBeInTheDocument();
    });

    it('displays UNSAFE status with countdown', async () => {
      const nextAvailable = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const mockStatus = createMockSafetyStatus('UNSAFE', nextAvailable);
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(<SafetyStatusDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Unsafe')).toBeInTheDocument();
      });

      expect(screen.getByText('Offline due to bad weather conditions')).toBeInTheDocument();
      expect(screen.getByText('Next Available')).toBeInTheDocument();
      expect(screen.getByText('2h 0m 0s')).toBeInTheDocument();
    });

    it('displays CLOSED status with countdown', async () => {
      const nextAvailable = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const mockStatus = createMockSafetyStatus('CLOSED', nextAvailable);
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(<SafetyStatusDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Closed')).toBeInTheDocument();
      });

      expect(screen.getByText('Outside viewing hours')).toBeInTheDocument();
      expect(screen.getByText('Next Available')).toBeInTheDocument();
      expect(screen.getByText('30m 0s')).toBeInTheDocument();
    });

    it('updates countdown timer accurately', async () => {
      const nextAvailable = new Date(Date.now() + 61 * 1000).toISOString();
      const mockStatus = createMockSafetyStatus('CLOSED', nextAvailable);
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(<SafetyStatusDisplay />);

      await waitFor(() => {
        expect(screen.getByText('1m 1s')).toBeInTheDocument();
      });

      // Advance time by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('1m 0s')).toBeInTheDocument();
      });
    });

    it('handles API errors gracefully', async () => {
      vi.mocked(apiService.getSafetyStatus).mockRejectedValue(new Error('Network error'));

      render(<SafetyStatusDisplay />);

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      });
    });

    it('does not show countdown when showCountdown is false', async () => {
      const nextAvailable = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const mockStatus = createMockSafetyStatus('CLOSED', nextAvailable);
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(<SafetyStatusDisplay showCountdown={false} />);

      await waitFor(() => {
        expect(screen.getByText('Closed')).toBeInTheDocument();
      });

      expect(screen.queryByText('Next Available')).not.toBeInTheDocument();
    });

    it('displays countdown in seconds when less than 1 minute remaining', async () => {
      const nextAvailable = new Date(Date.now() + 45 * 1000).toISOString();
      const mockStatus = createMockSafetyStatus('CLOSED', nextAvailable);
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(<SafetyStatusDisplay />);

      await waitFor(() => {
        expect(screen.getByText('45s')).toBeInTheDocument();
      });
    });

    it('shows "Available now" when countdown reaches zero', async () => {
      const nextAvailable = new Date(Date.now() + 1000).toISOString();
      const mockStatus = createMockSafetyStatus('CLOSED', nextAvailable);
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(<SafetyStatusDisplay />);

      await waitFor(() => {
        expect(screen.getByText('1s')).toBeInTheDocument();
      });

      // Advance time past the next available time
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      await waitFor(() => {
        expect(screen.getByText('Available now')).toBeInTheDocument();
      });
    });

    it('refreshes status automatically every 30 seconds', async () => {
      const mockStatus = createMockSafetyStatus('ACTIVE');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(<SafetyStatusDisplay />);

      await waitFor(() => {
        expect(screen.getByText('Active')).toBeInTheDocument();
      });

      // Verify initial call
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

  describe('ControlLockOverlay', () => {
    const TestContent = () => (
      <div>
        <button>Test Button</button>
        <input placeholder="Test Input" />
      </div>
    );

    it('shows loading overlay initially', () => {
      vi.mocked(apiService.getSafetyStatus).mockImplementation(() => new Promise(() => {}));

      render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      expect(screen.getByText('Loading Safety Status')).toBeInTheDocument();
      expect(screen.getByText('Please wait while we check telescope safety...')).toBeInTheDocument();
    });

    it('does not show overlay when status is ACTIVE', async () => {
      const mockStatus = createMockSafetyStatus('ACTIVE');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Button')).toBeInTheDocument();
      });

      // Should not show overlay
      expect(screen.queryByText('Telescope Locked')).not.toBeInTheDocument();
    });

    it('shows overlay and disables controls when status is UNSAFE', async () => {
      const mockStatus = createMockSafetyStatus('UNSAFE', '2024-01-15T12:00:00Z');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Telescope Locked - Unsafe Conditions')).toBeInTheDocument();
      });

      expect(screen.getByText('Weather conditions are unsafe for telescope operation.')).toBeInTheDocument();
    });

    it('shows overlay and disables controls when status is CLOSED', async () => {
      const mockStatus = createMockSafetyStatus('CLOSED', '2024-01-15T20:00:00Z');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Telescope Locked - Outside Viewing Hours')).toBeInTheDocument();
      });

      expect(screen.getByText('Telescope is only available during nighttime viewing windows.')).toBeInTheDocument();
    });

    it('shows error overlay when API fails', async () => {
      vi.mocked(apiService.getSafetyStatus).mockRejectedValue(new Error('API Error'));

      render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Safety Check Failed')).toBeInTheDocument();
      });

      expect(screen.getByText('Unable to verify telescope safety. Controls are locked for safety.')).toBeInTheDocument();
    });

    it('allows manual override with disabled prop', async () => {
      const mockStatus = createMockSafetyStatus('UNSAFE');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(
        <ControlLockOverlay disabled={true}>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Button')).toBeInTheDocument();
      });

      // Should not show overlay when disabled=true
      expect(screen.queryByText('Telescope Locked')).not.toBeInTheDocument();
    });

    it('disables pointer events when overlay is shown', async () => {
      const mockStatus = createMockSafetyStatus('UNSAFE');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      const { container } = render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Telescope Locked - Unsafe Conditions')).toBeInTheDocument();
      });

      // Check that the content wrapper has pointer-events-none class
      const contentWrapper = container.querySelector('.pointer-events-none');
      expect(contentWrapper).toBeInTheDocument();
    });

    it('displays status details correctly', async () => {
      const mockStatus = createMockSafetyStatus('UNSAFE', '2024-01-15T12:00:00Z');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Telescope Locked - Unsafe Conditions')).toBeInTheDocument();
      });

      expect(screen.getByText('Reason: Test reason for UNSAFE')).toBeInTheDocument();
      expect(screen.getByText(/Next Available:/)).toBeInTheDocument();
    });

    it('refreshes safety status automatically', async () => {
      const mockStatus = createMockSafetyStatus('ACTIVE');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Test Button')).toBeInTheDocument();
      });

      // Verify initial call
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

    it('prevents interaction with controls when overlay is active', async () => {
      const mockStatus = createMockSafetyStatus('UNSAFE');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Telescope Locked - Unsafe Conditions')).toBeInTheDocument();
      });

      // Try to click the button - it should be disabled by pointer-events-none
      const button = screen.getByText('Test Button');
      expect(button).toBeInTheDocument();
      
      // The button should be in a container with pointer-events-none
      const buttonContainer = button.closest('.pointer-events-none');
      expect(buttonContainer).toBeInTheDocument();
    });

    it('shows different overlay messages for different safety states', async () => {
      // Test UNSAFE state
      const unsafeStatus = createMockSafetyStatus('UNSAFE');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(unsafeStatus);

      const { rerender } = render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Telescope Locked - Unsafe Conditions')).toBeInTheDocument();
        expect(screen.getByText('Weather conditions are unsafe for telescope operation.')).toBeInTheDocument();
      });

      // Test CLOSED state
      const closedStatus = createMockSafetyStatus('CLOSED');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(closedStatus);

      rerender(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Telescope Locked - Outside Viewing Hours')).toBeInTheDocument();
        expect(screen.getByText('Telescope is only available during nighttime viewing windows.')).toBeInTheDocument();
      });
    });

    it('handles overlay animation states correctly', async () => {
      const mockStatus = createMockSafetyStatus('UNSAFE');
      vi.mocked(apiService.getSafetyStatus).mockResolvedValue(mockStatus);

      const { container } = render(
        <ControlLockOverlay>
          <TestContent />
        </ControlLockOverlay>
      );

      await waitFor(() => {
        expect(screen.getByText('Telescope Locked - Unsafe Conditions')).toBeInTheDocument();
      });

      // Check that overlay has proper backdrop styling
      const overlay = container.querySelector('.absolute.inset-0');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('backdrop-blur-sm');
    });
  });
});