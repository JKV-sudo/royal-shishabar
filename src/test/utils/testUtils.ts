import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ReactElement } from 'react';

// Test utility functions for admin components
export const testUtils = {
  // Wait for loading to complete
  waitForLoadingToComplete: async (timeout: number = 5000) => {
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    }, { timeout });
  },

  // Wait for data to load
  waitForDataToLoad: async (dataTestId: string, timeout: number = 5000) => {
    await waitFor(() => {
      expect(screen.getByTestId(dataTestId)).toBeInTheDocument();
    }, { timeout });
  },

  // Check if error message is displayed
  expectErrorMessage: (message: string) => {
    expect(screen.getByText(message)).toBeInTheDocument();
  },

  // Check if success message is displayed
  expectSuccessMessage: (message: string) => {
    expect(screen.getByText(message)).toBeInTheDocument();
  },

  // Simulate network delay
  simulateNetworkDelay: (ms: number = 1000) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Mock console methods to avoid spam in tests
  mockConsole: () => {
    const originalConsole = { ...console };
    console.error = vi.fn();
    console.warn = vi.fn();
    console.log = vi.fn();
    return () => {
      Object.assign(console, originalConsole);
    };
  },

  // Create a test wrapper with common providers
  createTestWrapper: (component: ReactElement) => {
    // In a real app, this would include providers like AuthContext, etc.
    return component;
  },

  // Simulate user interactions
  userInteractions: {
    clickButton: async (buttonText: string) => {
      const button = screen.getByRole('button', { name: buttonText });
      fireEvent.click(button);
      await waitFor(() => {});
    },

    fillInput: async (labelText: string, value: string) => {
      const input = screen.getByLabelText(labelText);
      fireEvent.change(input, { target: { value } });
      await waitFor(() => {});
    },

    selectOption: async (selectText: string, optionText: string) => {
      const select = screen.getByLabelText(selectText);
      fireEvent.change(select, { target: { value: optionText } });
      await waitFor(() => {});
    }
  }
};

// Test scenarios for admin components
export const adminTestScenarios = {
  // Common loading states
  loading: {
    name: 'Loading State',
    setup: () => ({ loading: true }),
    expectations: ['Loading indicator should be visible']
  },

  // Empty data scenarios
  emptyData: {
    name: 'Empty Data',
    setup: () => ({ data: [], loading: false }),
    expectations: ['Empty state message should be displayed']
  },

  // Error scenarios
  networkError: {
    name: 'Network Error',
    setup: () => ({ error: 'Network unavailable', loading: false }),
    expectations: ['Error message should be displayed', 'Retry button should be available']
  },

  permissionError: {
    name: 'Permission Error',
    setup: () => ({ error: 'Permission denied', loading: false }),
    expectations: ['Permission error message should be displayed']
  },

  // Success scenarios
  successfulLoad: {
    name: 'Successful Data Load',
    setup: () => ({ data: ['item1', 'item2'], loading: false }),
    expectations: ['Data should be displayed', 'No error messages']
  }
};

// Helper function to run all test scenarios
export const runTestScenarios = (component: any, scenarios: any[]) => {
  scenarios.forEach(scenario => {
    it(scenario.name, async () => {
      const props = scenario.setup();
      render(testUtils.createTestWrapper(component(props)));
      
      for (const expectation of scenario.expectations) {
        // Add custom expectation logic here based on the expectation string
        await waitFor(() => {
          // This would be customized per component
        });
      }
    });
  });
};

// Performance testing utilities
export const performanceUtils = {
  // Measure component render time
  measureRenderTime: async (renderFunction: () => void) => {
    const start = performance.now();
    renderFunction();
    const end = performance.now();
    return end - start;
  },

  // Test for memory leaks
  testMemoryLeaks: (componentFactory: () => ReactElement) => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0;
    
    // Render and unmount component multiple times
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(componentFactory());
      unmount();
    }
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    // Allow for some memory increase but flag excessive growth
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // 10MB threshold
  }
};

// Data fetching test patterns
export const dataFetchingTests = {
  // Test component with successful data fetching
  withSuccessfulFetch: (component: ReactElement, expectedData: any) => {
    return async () => {
      render(component);
      await testUtils.waitForLoadingToComplete();
      
      // Verify data is displayed
      expectedData.forEach((item: any) => {
        expect(screen.getByText(item.name || item.title || item.id)).toBeInTheDocument();
      });
    };
  },

  // Test component with failed data fetching
  withFailedFetch: (component: ReactElement, expectedError: string) => {
    return async () => {
      render(component);
      await testUtils.waitForLoadingToComplete();
      
      // Verify error is displayed
      expect(screen.getByText(expectedError)).toBeInTheDocument();
    };
  },

  // Test component with empty data
  withEmptyData: (component: ReactElement, emptyMessage: string) => {
    return async () => {
      render(component);
      await testUtils.waitForLoadingToComplete();
      
      // Verify empty state is displayed
      expect(screen.getByText(emptyMessage)).toBeInTheDocument();
    };
  }
};

// Common assertions for admin components
export const adminAssertions = {
  // Check if component loads without crashing
  loadsWithoutCrashing: (component: ReactElement) => {
    expect(() => render(component)).not.toThrow();
  },

  // Check if component handles loading state
  handlesLoadingState: async (component: ReactElement) => {
    render(component);
    // Should show loading indicator initially
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  },

  // Check if component handles error state
  handlesErrorState: (component: ReactElement, errorMessage: string) => {
    render(component);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  },

  // Check if component displays data correctly
  displaysData: (component: ReactElement, data: any[]) => {
    render(component);
    data.forEach(item => {
      expect(screen.getByText(item.name || item.title || item.id)).toBeInTheDocument();
    });
  },

  // Check if component has proper accessibility
  hasProperAccessibility: (component: ReactElement) => {
    render(component);
    // Check for proper headings
    expect(screen.getByRole('heading')).toBeInTheDocument();
    
    // Check for proper button roles
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type');
    });
  }
};

export default {
  testUtils,
  adminTestScenarios,
  runTestScenarios,
  performanceUtils,
  dataFetchingTests,
  adminAssertions
}; 