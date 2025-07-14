
import React, { useState,useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAppDispatch } from '@/hooks/useRedux';
import { login } from '@/store/slices/authSlice';
import { signup, updateProfile, changePassword, login as loginApi } from '@/api/authApi';
import { useTranslation } from 'react-i18next';


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

  const { t } = useTranslation();


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
        toast({ title: t("errorTitle"), description: t("formFirstNameRequired"), variant: "destructive" });
        return false;
      }
      if (!formData.lastName.trim()) {
        toast({ title: t("errorTitle"), description: t("formLastNameRequired"), variant: "destructive" });
        return false;
      }
      if (!formData.phoneNumber.trim()) {
        toast({ title: t("errorTitle"), description: t("formPhoneNumberRequired"), variant: "destructive" });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast({ title: t("errorTitle"), description: t("formPasswordMismatch"), variant: "destructive" });
        return false;
      }
    }
    
    if (!formData.email.trim()) {
      toast({ title: t("errorTitle"), description: t("formEmailRequired"), variant: "destructive" });
      return false;
    }
    
    if (mode !== "update" && !formData.password.trim()) {
      toast({ title: t("errorTitle"), description: t("formPasswordRequired"), variant: "destructive" });
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
            title: t("loginSuccessTitle"),
            description: t("loginSuccessDesc"),
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
          const response = result.data; // Assuming the API returns user data
          // Save token, update Redux, etc.
          dispatch(
            login({
              id: String(response.user.id),
              firstName: response.user.first_name,
              lastName: response.user.last_name,
              email: response.user.email,
              phoneNumber: response.user.phone_number,
              profilePicturePath: response.user.profile_picture_path ?? '',
              initials: `${response.user.first_name?.[0] ?? ''}${response.user.last_name?.[0] ?? ''}`.toUpperCase(),
              role: response.user.type,
              token: response.access_token, // if your slice or storage uses it
            })
          );
          // Show success toast
          toast({
            title: t("profileUpdated"),
            description: t("profileUpdatedDesc"),
          });
          // Optionally update Redux/localStorage with new user info
          onClose();
        } else {
          toast({
            title: t("updateFailed"),
            description: t("updateFailedDesc"),
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
            title: t("passwordChanged"),
            description: t("passwordChangedDesc"),
          });
          onClose();
        } else {
          toast({
            title: t("passwordChangeFailed"),
            description: t("updateFailedDesc"),
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
          title: t("accountCreated"),
          description: t("accountCreatedDesc"),
        });
        onToggleMode(); // Switch to login mode after signup
      } else {
        toast({
          title: t("signupFailed"),
          description: t("signupFailedDesc"),
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
        title: t("errorTitle"),
        description: error.message || t("errorGeneric"),
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
            {mode === 'login' ? t("welcomeBack") : mode === 'signup' ? t("createAccount") : mode === 'update' ? t("updateProfile") : t("changePasswordTitle")}
          </h2>
          <p className="text-friday-orange">
            {mode === 'login' 
              ? t("signInMessage")
              : t("joinFriday")
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(mode === 'signup' || mode === 'update') && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-white">{t("firstName")}</Label>
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
                  <Label htmlFor="lastName" className="text-white">{t("lastName")}</Label>
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
                <Label htmlFor="phoneNumber" className="text-white">{t("phoneNumber")}</Label>
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
                <Label htmlFor="profilePicturePath" className="text-white">{t("profilePicture")}</Label>
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
            <Label htmlFor="email" className="text-white">{t("email")}</Label>
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
                {mode === "changePassword" ? t("oldPassword") : t("password")}
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
                {mode === "changePassword" ? t("newPassword") : t("confirmPassword")}
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
              ? t("pleaseWait")
              : mode === 'login'
                ? t("login")
                : mode === 'signup'
                  ? t("createAccount")
                  : mode === 'update'
                    ? t("updateProfile")
                    : mode === 'changePassword'
                      ? t("changePassword")
                      : t('submit')
            }
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={onToggleMode}
            className="text-friday-orange hover:text-friday-orange-light text-sm"
          >
            {mode === 'login' 
              ? t("dontHaveAccount")
              : t("alreadyHaveAccount")
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
