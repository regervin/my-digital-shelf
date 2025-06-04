import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FiCheckCircle, FiAlertTriangle, FiLoader } from 'react-icons/fi';

const AuthVerification = () => {
  const { user, profile } = useAuth();
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [authDetails, setAuthDetails] = useState<any>(null);
  const [profileDetails, setProfileDetails] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function verifyAuth() {
      try {
        // Check if user is authenticated
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }
        
        if (!sessionData.session) {
          setAuthStatus('error');
          setErrorMessage('No active session found');
          return;
        }
        
        // Get user data
        const { data: userData, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw new Error(`User data error: ${userError.message}`);
        }
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();
        
        if (profileError) {
          throw new Error(`Profile error: ${profileError.message}`);
        }
        
        // Set all the data
        setAuthDetails({
          id: userData.user.id,
          email: userData.user.email,
          lastSignIn: userData.user.last_sign_in_at,
          createdAt: userData.user.created_at,
        });
        
        setProfileDetails(profileData);
        setAuthStatus('success');
      } catch (error) {
        console.error('Auth verification error:', error);
        setAuthStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      }
    }
    
    verifyAuth();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Authentication Verification</h1>
      
      <div className="card mb-6">
        <div className="card-content">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          
          <div className="flex items-center mb-4">
            {authStatus === 'loading' && (
              <>
                <FiLoader className="w-6 h-6 text-primary mr-2 animate-spin" />
                <span>Verifying authentication...</span>
              </>
            )}
            
            {authStatus === 'success' && (
              <>
                <FiCheckCircle className="w-6 h-6 text-success mr-2" />
                <span className="text-success font-medium">Authentication verified successfully</span>
              </>
            )}
            
            {authStatus === 'error' && (
              <>
                <FiAlertTriangle className="w-6 h-6 text-destructive mr-2" />
                <span className="text-destructive font-medium">Authentication verification failed</span>
              </>
            )}
          </div>
          
          {errorMessage && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">
              {errorMessage}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Auth Context Data</h3>
              <div className="bg-muted p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify({ user, profile }, null, 2)}
                </pre>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Direct Supabase Query Results</h3>
              <div className="bg-muted p-4 rounded-md">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify({ 
                    auth: authDetails, 
                    profile: profileDetails 
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="card-content">
          <h2 className="text-xl font-semibold mb-4">Authentication Flow</h2>
          
          <div className="space-y-4">
            <div className="border border-border rounded-md p-4">
              <h3 className="font-medium mb-2">1. Sign Up Process</h3>
              <p>When a user signs up:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>User credentials are stored in Supabase Auth</li>
                <li>A database trigger creates a profile record in the profiles table</li>
                <li>The profile is linked to the auth user via the user ID</li>
              </ul>
            </div>
            
            <div className="border border-border rounded-md p-4">
              <h3 className="font-medium mb-2">2. Sign In Process</h3>
              <p>When a user signs in:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Credentials are verified against Supabase Auth</li>
                <li>A session is created and stored in the browser</li>
                <li>The AuthContext loads the user profile data</li>
              </ul>
            </div>
            
            <div className="border border-border rounded-md p-4">
              <h3 className="font-medium mb-2">3. Session Management</h3>
              <p>For authenticated users:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Session is automatically refreshed by Supabase</li>
                <li>AuthContext listens for auth state changes</li>
                <li>Row Level Security (RLS) policies restrict data access</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthVerification;
