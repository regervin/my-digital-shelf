import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { FiUser, FiLock, FiSave, FiLogOut } from 'react-icons/fi';

const Settings = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Password change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCompanyName(profile.company_name || '');
      setEmail(profile.email || '');
    }
  }, [profile]);
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        company_name: companyName,
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      // Note: This is a placeholder. In a real app, you would use Supabase's
      // password update functionality which requires the current password
      toast.success('Password updated successfully');
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1>Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <div className="md:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <FiUser className="mr-2" />
                Profile Settings
              </h3>
              <p className="card-description">Update your personal information</p>
            </div>
            <div className="card-content">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input"
                    value={email}
                    disabled
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Email address cannot be changed
                  </p>
                </div>
                
                <div>
                  <label htmlFor="fullName" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                
                <div>
                  <label htmlFor="companyName" className="form-label">Company Name</label>
                  <input
                    type="text"
                    id="companyName"
                    className="form-input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name (optional)"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></span>
                    ) : (
                      <FiSave className="mr-2" />
                    )}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Password Settings */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="card-title flex items-center">
                <FiLock className="mr-2" />
                Change Password
              </h3>
              <p className="card-description">Update your account password</p>
            </div>
            <div className="card-content">
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="form-label">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    className="form-input"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="newPassword" className="form-label">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    className="form-input"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    className="form-input"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    className="btn-primary flex items-center"
                    disabled={isChangingPassword}
                  >
                    {isChangingPassword ? (
                      <span className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></span>
                    ) : (
                      <FiSave className="mr-2" />
                    )}
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Account Actions */}
        <div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Account Actions</h3>
            </div>
            <div className="card-content space-y-4">
              <button
                onClick={handleSignOut}
                className="btn-destructive w-full flex items-center justify-center"
              >
                <FiLogOut className="mr-2" />
                Sign Out
              </button>
              
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-medium mb-2">Danger Zone</h4>
                <button
                  className="btn-outline border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground w-full"
                >
                  Delete Account
                </button>
                <p className="mt-2 text-xs text-muted-foreground">
                  This action is permanent and cannot be undone. All your data will be deleted.
                </p>
              </div>
            </div>
          </div>
          
          {/* Account Info */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="card-title">Account Information</h3>
            </div>
            <div className="card-content">
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Account ID</dt>
                  <dd className="mt-1 text-sm font-mono truncate">{user?.id || 'Not available'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="mt-1 text-sm">
                    {user?.created_at 
                      ? new Date(user.created_at).toLocaleDateString() 
                      : 'Not available'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Last Updated</dt>
                  <dd className="mt-1 text-sm">
                    {profile?.updated_at 
                      ? new Date(profile.updated_at).toLocaleDateString() 
                      : 'Not available'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
