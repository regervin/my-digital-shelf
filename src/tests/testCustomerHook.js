import { supabase } from '../lib/supabase';
import { useCustomers } from '../hooks/useCustomers';

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

describe('useCustomers Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('fetchCustomers uses seller_id correctly', async () => {
    // Setup mock return value
    supabase.from.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.eq.mockReturnThis();
    supabase.order.mockResolvedValue({
      data: [{ id: '1', name: 'Test Customer', seller_id: mockUser.id }],
      error: null
    });

    // Render the hook
    const { result, waitForNextUpdate } = renderHook(() => useCustomers());
    
    // Wait for the effect to run
    await waitForNextUpdate();
    
    // Check if supabase was called with the correct parameters
    expect(supabase.from).toHaveBeenCalledWith('customers');
    expect(supabase.eq).toHaveBeenCalledWith('seller_id', mockUser.id);
    
    // Check if customers were set correctly
    expect(result.current.customers).toEqual([
      { id: '1', name: 'Test Customer', seller_id: mockUser.id }
    ]);
  });

  test('addCustomer uses seller_id correctly', async () => {
    // Setup mock return value
    const newCustomer = { name: 'New Customer', email: 'new@example.com' };
    const returnedCustomer = { 
      id: '2', 
      name: 'New Customer', 
      email: 'new@example.com',
      seller_id: mockUser.id,
      created_at: expect.any(String),
      updated_at: expect.any(String)
    };
    
    supabase.from.mockReturnThis();
    supabase.insert.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.single.mockResolvedValue({
      data: returnedCustomer,
      error: null
    });

    // Render the hook
    const { result } = renderHook(() => useCustomers());
    
    // Call addCustomer
    await act(async () => {
      await result.current.addCustomer(newCustomer);
    });
    
    // Check if supabase was called with the correct parameters
    expect(supabase.from).toHaveBeenCalledWith('customers');
    expect(supabase.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        name: 'New Customer',
        email: 'new@example.com',
        seller_id: mockUser.id
      })
    ]);
  });

  test('updateCustomer uses seller_id correctly for security check', async () => {
    // Setup mock return value
    const customerId = '3';
    const updates = { name: 'Updated Customer' };
    const returnedCustomer = { 
      id: customerId, 
      name: 'Updated Customer',
      seller_id: mockUser.id,
      updated_at: expect.any(String)
    };
    
    supabase.from.mockReturnThis();
    supabase.update.mockReturnThis();
    supabase.eq.mockReturnThis();
    supabase.select.mockReturnThis();
    supabase.single.mockResolvedValue({
      data: returnedCustomer,
      error: null
    });

    // Render the hook
    const { result } = renderHook(() => useCustomers());
    
    // Call updateCustomer
    await act(async () => {
      await result.current.updateCustomer(customerId, updates);
    });
    
    // Check if supabase was called with the correct parameters
    expect(supabase.from).toHaveBeenCalledWith('customers');
    expect(supabase.update).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Customer',
        updated_at: expect.any(String)
      })
    );
    // First eq call is for id
    expect(supabase.eq).toHaveBeenNthCalledWith(1, 'id', customerId);
    // Second eq call should be for seller_id (security check)
    expect(supabase.eq).toHaveBeenNthCalledWith(2, 'seller_id', mockUser.id);
  });

  test('deleteCustomer uses seller_id correctly for security check', async () => {
    // Setup mock return value
    const customerId = '4';
    
    supabase.from.mockReturnThis();
    supabase.delete.mockReturnThis();
    supabase.eq.mockReturnThis();
    supabase.mockResolvedValue({
      error: null
    });

    // Render the hook
    const { result } = renderHook(() => useCustomers());
    
    // Call deleteCustomer
    await act(async () => {
      await result.current.deleteCustomer(customerId);
    });
    
    // Check if supabase was called with the correct parameters
    expect(supabase.from).toHaveBeenCalledWith('customers');
    expect(supabase.delete).toHaveBeenCalled();
    // First eq call is for id
    expect(supabase.eq).toHaveBeenNthCalledWith(1, 'id', customerId);
    // Second eq call should be for seller_id (security check)
    expect(supabase.eq).toHaveBeenNthCalledWith(2, 'seller_id', mockUser.id);
  });
});
