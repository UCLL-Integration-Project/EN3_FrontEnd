import '@testing-library/jest-dom';

// UserService.ts throws at import time when this is unset. Make sure tests
// that import it (even transitively, via jest.mock) don't trip that guard.
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://test.local';
