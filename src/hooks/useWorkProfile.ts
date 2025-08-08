import { useState, useEffect } from 'react';
import { encryptData, decryptData } from '@/lib/security';

export interface WorkProfile {
  monthlySalary: number;
  workingDays: number;
  hoursPerDay: number;
  hourlyRate: number;
}

const STORAGE_KEY = 'work-profile';

export const useWorkProfile = () => {
  const [workProfile, setWorkProfile] = useState<WorkProfile | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        // Decrypt the stored data
        const decrypted = decryptData<WorkProfile>(saved);
        if (decrypted) {
          setWorkProfile(decrypted);
        }
      } catch (error) {
        console.error('Error loading work profile:', error);
        // Clear corrupted data
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveWorkProfile = (profile: Omit<WorkProfile, 'hourlyRate'>) => {
    const totalHoursPerMonth = profile.workingDays * profile.hoursPerDay;
    const hourlyRate = profile.monthlySalary / totalHoursPerMonth;
    
    const fullProfile: WorkProfile = {
      ...profile,
      hourlyRate
    };

    setWorkProfile(fullProfile);
    // Encrypt the data before storing
    try {
      const encrypted = encryptData(fullProfile);
      localStorage.setItem(STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Error saving work profile:', error);
    }
  };

  const clearWorkProfile = () => {
    setWorkProfile(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return {
    workProfile,
    saveWorkProfile,
    clearWorkProfile,
    hasProfile: !!workProfile
  };
};