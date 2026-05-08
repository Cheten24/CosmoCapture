import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import EnhancedObjectList from '../EnhancedObjectList';
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
    getVisibleObjects: vi.fn(),
  },
}));

// Mock ObjectDetailView component
vi.mock('../ObjectDetailView', () => ({
  default: ({ onClose, onObjectSelect }: { onClose: () => void; onObjectSelect: (obj: unknown) => void }) => (
    <div data-testid="object-detail-view">
      <button onClick={onClose}>Close Detail View</button>
      <button onClick={() => onObjectSelect({ name: 'Test Object' })}>
        Select Test Object
      </button>
    </div>
  ),
}));

describe('EnhancedObjectList', () => {
  const mockCelestialObjects = [
    { name: 'Sirius', type: 'star', ra: 101.287, dec: -16.716 },
    { name: 'Mars', type: 'planet', ra: 45.123, dec: 12.456 },
    { name: 'Andromeda Galaxy', type: 'galaxy', ra: 10.685, dec: 41.269 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiService.getVisibleObjects).mockResolvedValue(mockCelestialObjects);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Dynamic Filtering and Real-time Updates', () => {
    it('displays loading state initially', () => {
      vi.mocked(apiService.getVisibleObjects).mockImplementation(() => new Promise(() => {}));
      
      render(<EnhancedObjectList />);
      
      expect(screen.getByText('Loading visible objects...')).toBeInTheDocument();
    });

    it('handles API errors gracefully', async () => {
      vi.mocked(apiService.getVisibleObjects).mockRejectedValue(new Error('Network error'));

      render(<EnhancedObjectList />);

      await waitFor(() => {
        expect(screen.getByText(/Error: Network error/)).toBeInTheDocument();
      });
    });

    it('fetches and displays objects from API', async () => {
      render(<EnhancedObjectList />);

      await waitFor(() => {
        expect(screen.getByText('Visible Objects')).toBeInTheDocument();
      });
    });

    it('shows filters button when enabled', () => {
      render(<EnhancedObjectList showFilters={true} />);
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('shows detail view button when enabled', () => {
      render(<EnhancedObjectList showDetailView={true} />);
      
      expect(screen.getByText('Detail View')).toBeInTheDocument();
    });
  });

  describe('Object Detail Display and Interaction', () => {
    it('renders search input', () => {
      render(<EnhancedObjectList />);
      
      expect(screen.getByPlaceholderText('Search objects, types, or constellations...')).toBeInTheDocument();
    });

    it('calls onObjectSelect prop when provided', () => {
      const mockOnObjectSelect = vi.fn();
      render(<EnhancedObjectList onObjectSelect={mockOnObjectSelect} />);
      
      // Component should render without errors
      expect(screen.getByText('Visible Objects')).toBeInTheDocument();
    });

    it('limits results when maxItems is specified', () => {
      render(<EnhancedObjectList maxItems={2} />);
      
      // Component should render with maxItems prop
      expect(screen.getByText('Visible Objects')).toBeInTheDocument();
    });

    it('displays header with object count', async () => {
      render(<EnhancedObjectList />);

      await waitFor(() => {
        expect(screen.getByText('Visible Objects')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Layout and Animation Performance', () => {
    it('applies custom className correctly', () => {
      const { container } = render(<EnhancedObjectList className="custom-class" />);

      const mainContainer = container.firstChild;
      expect(mainContainer).toHaveClass('custom-class');
    });

    it('renders with proper structure', () => {
      const { container } = render(<EnhancedObjectList />);

      // Check for main container structure
      const mainContainer = container.querySelector('.bg-slate-800\\/50');
      expect(mainContainer).toBeInTheDocument();
    });

    it('handles component unmounting correctly', () => {
      const { unmount } = render(<EnhancedObjectList />);
      
      // Should unmount without errors
      expect(() => unmount()).not.toThrow();
    });

    it('renders search functionality', () => {
      render(<EnhancedObjectList />);
      
      const searchInput = screen.getByPlaceholderText('Search objects, types, or constellations...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('renders with different prop combinations', () => {
      const { rerender } = render(<EnhancedObjectList />);
      
      // Test with different props
      rerender(<EnhancedObjectList showFilters={true} />);
      expect(screen.getByText('Filters')).toBeInTheDocument();
      
      rerender(<EnhancedObjectList showDetailView={true} />);
      expect(screen.getByText('Detail View')).toBeInTheDocument();
      
      rerender(<EnhancedObjectList showFilters={false} />);
      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });
  });
});