// Manual test script for useCustomers hook
// This can be run in the browser console when on the customers page

async function testCustomersHook() {
  console.log('Testing useCustomers hook with seller_id fix...');
  
  // 1. Test fetching customers
  console.log('1. Testing customer fetching...');
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
      
    console.log('Fetched customers:', customers);
    console.log('Any customers with seller_id?', 
      customers.some(c => c.seller_id !== null && c.seller_id !== undefined));
    
    if (error) throw error;
  } catch (err) {
    console.error('Error fetching customers:', err);
  }
  
  // 2. Test adding a customer
  console.log('2. Testing customer creation...');
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found. Please log in first.');
      return;
    }
    
    const testCustomer = {
      name: 'Test Customer ' + new Date().toISOString(),
      email: `test-${Date.now()}@example.com`,
      phone: '555-123-4567'
    };
    
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        ...testCustomer,
        seller_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('Created customer:', data);
    console.log('Customer has correct seller_id?', data.seller_id === user.id);
    
    // 3. Test updating the customer
    console.log('3. Testing customer update...');
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update({
        name: data.name + ' (Updated)',
        updated_at: new Date().toISOString()
      })
      .eq('id', data.id)
      .eq('seller_id', user.id) // Security check
      .select()
      .single();
    
    if (updateError) throw updateError;
    
    console.log('Updated customer:', updatedCustomer);
    
    // 4. Test deleting the customer
    console.log('4. Testing customer deletion...');
    const { error: deleteError } = await supabase
      .from('customers')
      .delete()
      .eq('id', data.id)
      .eq('seller_id', user.id); // Security check
    
    if (deleteError) throw deleteError;
    
    console.log('Customer deleted successfully');
    
    // 5. Verify deletion
    const { data: verifyData, error: verifyError } = await supabase
      .from('customers')
      .select()
      .eq('id', data.id)
      .single();
    
    if (verifyError && verifyError.code === 'PGRST116') {
      console.log('Verified customer was deleted');
    } else if (verifyData) {
      console.error('Customer was not deleted!', verifyData);
    }
    
  } catch (err) {
    console.error('Error during customer testing:', err);
  }
  
  console.log('Testing complete!');
}

// Instructions for running this test:
// 1. Navigate to the customers page in your application
// 2. Open browser console (F12 or right-click > Inspect > Console)
// 3. Copy and paste this entire function
// 4. Call the function by typing: testCustomersHook()
// 5. Check the console output for results
