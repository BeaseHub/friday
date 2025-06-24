
import React, { useState,useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/hooks/useRedux';
import { login } from '@/store/slices/authSlice';
import { signup, updateProfile, changePassword, login as loginApi } from '@/api/authApi';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'login' | 'signup' | 'update' | 'changePassword';
  onToggleMode: () => void;
}

const AuthModal = ({ open, onClose, mode, onToggleMode }: AuthModalProps) => {
  //Gt the user data from the locAL storage
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('auth') || '{}').user || {};
    } catch {
      return {};
    }
  })();

  const token=user?.token || '';

  const API_URL = import.meta.env.VITE_API_URL;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    profilePicturePath:'',
    profilePicture: null as File | null,
  });

  useEffect(() => {
    if (mode === 'update' && user && !formData.firstName) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        profilePicturePath: user.profilePicturePath ? `${API_URL}/${user.profilePicturePath.replace(/^\/+/, '')}` : null,
      }));
    } else if (mode === 'changePassword' && user && !formData.email) {
      setFormData((prev) => ({
        ...prev,
        email: user.email || '',
      }));
    }
  }, [mode, user]);

  // State to manage loading state
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profilePicture: file,
        profilePicturePath: '' // clear the path when a new file is selected
      }));
    }
  };

  const validateForm = () => {
    if (mode === 'signup') {
      if (!formData.firstName.trim()) {
        toast({ title: "Error", description: "First name is required", variant: "destructive" });
        return false;
      }
      if (!formData.lastName.trim()) {
        toast({ title: "Error", description: "Last name is required", variant: "destructive" });
        return false;
      }
      if (!formData.phoneNumber.trim()) {
        toast({ title: "Error", description: "Phone number is required", variant: "destructive" });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
        return false;
      }
    }
    
    if (!formData.email.trim()) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" });
      return false;
    }
    
    if (mode !== "update" && !formData.password.trim()) {
      toast({ title: "Error", description: "Password is required", variant: "destructive" });
      return false;
    }
    
    return true;
  };



  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setLoading(true);

  try {
    if (mode === 'login') {
      // Call login API
      const result = await loginApi(formData.email, formData.password);
      console.log(result);
      const user = result.data.user; // Assuming the API returns user data
      if(result.status == 200 ||  result.statusText === 'OK') {
        // Save token, update Redux, etc.
        dispatch(
          login({
            id: String(user.id),
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phoneNumber: user.phone_number,
            profilePicturePath: user.profile_picture_path ?? '',
            initials: `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase(),
            role: user.type,
            token: result.data.access_token, // if your slice or storage uses it
          })
        );
              // Show success toast
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        onClose();
      }
    } else if (mode === 'update') {
      // Prepare FormData for profile update
      const form = new FormData();
      form.append('first_name', formData.firstName);
      form.append('last_name', formData.lastName);
      form.append('phone_number', formData.phoneNumber);
      if (formData.profilePicture) {
        form.append('profile_picture', formData.profilePicture);
      }
      // Optionally: form.append('is_active', formData.isActive);

      // Call updateProfile API (make sure to pass the token)
      const result = await updateProfile(form, token);

      if (result.status === 200 || result.statusText === 'OK') {
        const user = result.data; // Assuming the API returns user data
        // Save token, update Redux, etc.
        dispatch(
          login({
            id: String(user.id),
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            phoneNumber: user.phone_number,
            profilePicturePath: user.profile_picture_path ?? '',
            initials: `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase(),
            role: user.type,
            token: result.data.access_token, // if your slice or storage uses it
          })
        );
        // Show success toast
        toast({
          title: "Profile updated!",
          description: "Your profile information has been updated.",
        });
        // Optionally update Redux/localStorage with new user info
        onClose();
      } else {
        toast({
          title: "Update failed",
          description: "Please check your inputs and try again.",
          variant: "destructive",
        });
      }
    } else if (mode === 'changePassword') {
      // Prepare payload for password change
      const payload = {
        old_password: formData.password,      // or formData.oldPassword if you use that field
        new_password: formData.confirmPassword, // or formData.newPassword if you use that field
        email: user.email
      };

      console.log(payload, token);
      // Call changePassword API (make sure to pass the token if required)
      const result = await changePassword(payload, token);
      console.log(result);

      if (result?.status === 200 || result?.statusText=== 'OK') {
        toast({
          title: "Password changed!",
          description: "Your password has been updated.",
        });
        onClose();
      } else {
        toast({
          title: "Password change failed",
          description: "Please check your inputs and try again.",
          variant: "destructive",
        });
      }
    } else {
      // Prepare FormData for signup
      const form = new FormData();
      form.append('email', formData.email);
      form.append('password', formData.password);
      form.append('first_name', formData.firstName);
      form.append('last_name', formData.lastName);
      form.append('phone_number', formData.phoneNumber);
      if (formData.profilePicture) {
        form.append('profile_picture', formData.profilePicture);
      }
      // Call signup API
    const result = await signup(form);

    if (result?.statusText === 'OK') {
      toast({
        title: "Account created!",
        description: "Welcome to Friday AI Platform.",
      });
      onToggleMode(); // Switch to login mode after signup
    } else {
      toast({
        title: "Signup failed",
        description: "Please check your inputs and try again.",
        variant: "destructive", // optional styling
      });
    }
    }
    // Reset form and close modal
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      profilePicturePath: '',
      profilePicture: null,
    });
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Something went wrong. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-friday-black-light border border-friday-black-lighter rounded-lg w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 text-white hover:bg-friday-black-lighter z-10"
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : mode === 'update' ? 'Update Profile' : 'Change Password'}
          </h2>
          <p className="text-friday-orange">
            {mode === 'login' 
              ? 'Sign in to access your AI agents' 
              : 'Join Friday and transform your business'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === 'signup' || mode === 'update') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">First Name *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="bg-friday-black border-friday-black-lighter text-white mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-white">Last Name *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="bg-friday-black border-friday-black-lighter text-white mt-1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phoneNumber" className="text-white">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="bg-friday-black border-friday-black-lighter text-white mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="profilePicturePath" className="text-white">Profile Picture</Label>
                <div className="mt-1 flex items-center gap-3">
                  {formData.profilePicturePath && (
                    <img 
                      src={formData.profilePicturePath} 
                      alt="Profile" 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                  <Input
                    id="profilePicturePath"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="bg-friday-black border-friday-black-lighter text-white file:text-white file:bg-friday-black-lighter file:border-0 file:mr-4"
                  />
                </div>
              </div>
            </>
          )}
          
          <div>
            <Label htmlFor="email" className="text-white">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="bg-friday-black border-friday-black-lighter text-white mt-1"
              required
            />
          </div>
          
          {mode!=="update" && 
            (<div>
              <Label htmlFor="password" className="text-white">
                {mode === "changePassword" ? "Old Password *" : "Password *"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="bg-friday-black border-friday-black-lighter text-white mt-1"
                required
              />
            </div>)}
          
          {(mode === 'signup'|| mode ==="changePassword") && (
            <div>
              <Label htmlFor="confirmPassword" className="text-white">
                {mode === "changePassword" ? "New Password *" : " Confirm Password *"}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="bg-friday-black border-friday-black-lighter text-white mt-1"
                required
              />
            </div>
          )}
          
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-friday-orange hover:bg-friday-orange-light text-white"
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Sign In'
                : mode === 'signup'
                  ? 'Create Account'
                  : mode === 'update'
                    ? 'Update Profile'
                    : mode === 'changePassword'
                      ? 'Change Password'
                      : 'Submit'
            }
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={onToggleMode}
            className="text-friday-orange hover:text-friday-orange-light text-sm"
          >
            {mode === 'login' 
              ? "Don't have an account? Sign up" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
