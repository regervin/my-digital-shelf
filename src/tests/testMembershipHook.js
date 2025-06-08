import { supabase } from '../lib/supabase';
import { useMemberships } from '../hooks/useMemberships';

// Mock user for testing
const mockUser = { id: '123e4567-e89b-12d3-a456-426614174000' };

// Mock Auth context
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser
  })
}));

// Mock Supabase client
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis()
  }
}));

describe('useMemberships Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchMemberships uses seller_id correctly', async () => {
    // Setup mock return value
    supabase.from.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.eq.mockReturnThis();
    supabase.order.mockResolvedValue({
      data: [{ id: '1', name: 'Test Membership', seller_id: mockUser.id }],
      error: null
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useMemberships());
