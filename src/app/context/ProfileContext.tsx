import { createContext, useContext, useState, ReactNode } from 'react';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  googleConnected?: boolean;
  googlePicture?: string;
}

interface ProfileContextType {
  profileData: ProfileData;
  updateProfile: (data: Partial<ProfileData>) => void;
  isProfileComplete: () => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const STORAGE_KEY = 'inout_profile';

function loadProfile(): ProfileData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return { firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' };
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profileData, setProfileData] = useState<ProfileData>(loadProfile);

  const updateProfile = (data: Partial<ProfileData>) => {
    setProfileData(prev => {
      const next = { ...prev, ...data };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const isProfileComplete = () => {
    return (
      profileData.firstName.trim() !== '' &&
      profileData.lastName.trim() !== '' &&
      profileData.email.trim() !== '' &&
      profileData.phone.trim() !== '' &&
      profileData.address.trim() !== '' &&
      profileData.city.trim() !== '' &&
      profileData.state.trim() !== '' &&
      profileData.zipCode.trim() !== ''
    );
  };

  return (
    <ProfileContext.Provider value={{ profileData, updateProfile, isProfileComplete }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
