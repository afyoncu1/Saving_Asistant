import { useState, useEffect } from 'react';

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
        setWorkProfile(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading work profile:', error);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fullProfile));
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