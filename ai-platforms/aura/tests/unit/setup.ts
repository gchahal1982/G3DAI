import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
});

// Mock WebGPU for 3D tests
Object.defineProperty(navigator, 'gpu', {
  value: {
    requestAdapter: jest.fn().mockResolvedValue({
      requestDevice: jest.fn().mockResolvedValue({
        createBuffer: jest.fn(),
        createTexture: jest.fn(),
        createRenderPipeline: jest.fn(),
        queue: {
          submit: jest.fn(),
          writeBuffer: jest.fn(),
        },
      }),
    }),
  },
  writable: true,
});

// Mock WebXR for VR tests
Object.defineProperty(navigator, 'xr', {
  value: {
    isSessionSupported: jest.fn().mockResolvedValue(true),
    requestSession: jest.fn().mockResolvedValue({
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      end: jest.fn(),
    }),
  },
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock Canvas and WebGL context
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = jest.fn().mockImplementation(function(this: HTMLCanvasElement, contextType: string) {
  if (contextType === 'webgl2' || contextType === 'webgl' || contextType === 'experimental-webgl') {
    return {
      createShader: jest.fn(),
      shaderSource: jest.fn(),
      compileShader: jest.fn(),
      createProgram: jest.fn(),
      attachShader: jest.fn(),
      linkProgram: jest.fn(),
      useProgram: jest.fn(),
      createBuffer: jest.fn(),
      bindBuffer: jest.fn(),
      bufferData: jest.fn(),
      getAttribLocation: jest.fn(),
      enableVertexAttribArray: jest.fn(),
      vertexAttribPointer: jest.fn(),
      drawArrays: jest.fn(),
      viewport: jest.fn(),
      clearColor: jest.fn(),
      clear: jest.fn(),
    };
  }
  return originalGetContext.call(this, contextType as any);
});

// Setup test environment
beforeAll(() => {
  // Initialize test environment
});
afterEach(() => {
  // Reset test state
  jest.clearAllMocks();
});
afterAll(() => {
  // Cleanup test environment
});

// Mock performance.now for consistent timing in tests
Object.defineProperty(performance, 'now', {
  value: jest.fn(() => Date.now()),
});

// Mock crypto for secure operations
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid'),
    getRandomValues: jest.fn((arr) => arr.fill(42)),
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      generateKey: jest.fn().mockResolvedValue({}),
      exportKey: jest.fn().mockResolvedValue(new ArrayBuffer(32)),
      importKey: jest.fn().mockResolvedValue({}),
    },
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// Mock IndexedDB
Object.defineProperty(window, 'indexedDB', {
  value: {
    open: jest.fn().mockImplementation(() => ({
      result: {
        transaction: jest.fn().mockReturnValue({
          objectStore: jest.fn().mockReturnValue({
            add: jest.fn(),
            get: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            getAll: jest.fn(),
          }),
        }),
        createObjectStore: jest.fn(),
      },
      addEventListener: jest.fn(),
    })),
  },
});

// Global test utilities
(global as any).testUtils = {
  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to create mock file objects
  createMockFile: (name: string, content: string, type = 'text/plain') => 
    new File([content], name, { type }),
    
  // Helper to create mock git repository
  createMockRepo: () => ({
    head: { ref: 'refs/heads/main' },
    branches: ['main', 'develop'],
    status: { staged: [], unstaged: [], untracked: [] },
  }),
  
  // Helper to create mock model responses
  createMockModelResponse: (content: string, latency = 50) => ({
    content,
    latency,
    tokens: content.split(' ').length,
    model: 'test-model',
  }),
};

// Jest custom matchers
expect.extend({
  toBeWithinLatency(received: number, expected: number, tolerance = 10) {
    const pass = Math.abs(received - expected) <= tolerance;
    return {
      message: () => 
        `expected ${received}ms to be within ${tolerance}ms of ${expected}ms`,
      pass,
    };
  },
  
  toHaveValidStructure(received: any, schema: any) {
    // Simple schema validation for test objects
    const validateSchema = (obj: any, schema: any): boolean => {
      if (typeof schema === 'string') {
        return typeof obj === schema;
      }
      if (Array.isArray(schema)) {
        return Array.isArray(obj) && obj.every(item => 
          validateSchema(item, schema[0])
        );
      }
      if (typeof schema === 'object') {
        return typeof obj === 'object' && 
          Object.keys(schema).every(key => 
            key in obj && validateSchema(obj[key], schema[key])
          );
      }
      return false;
    };
    
    const pass = validateSchema(received, schema);
    return {
      message: () => `expected object to match schema`,
      pass,
    };
  },
});

// TypeScript declarations for custom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeWithinLatency(expected: number, tolerance?: number): R;
      toHaveValidStructure(schema: any): R;
    }
  }
  
  interface Global {
    testUtils: {
      waitFor: (ms: number) => Promise<void>;
      createMockFile: (name: string, content: string, type?: string) => File;
      createMockRepo: () => any;
      createMockModelResponse: (content: string, latency?: number) => any;
    };
  }
} 