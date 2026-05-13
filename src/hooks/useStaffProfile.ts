// src/hooks/useStaffProfile.ts
import { useState, useEffect, useCallback } from 'react';
import { staffApi } from '../api/staff';
import type { StaffProfile } from '../types/staff.types';



interface UseStaffProfileReturn {
  user: StaffProfile | null;
  isLoading: boolean;
  error: string | null;
  isDeactivating: boolean;
  toggleAccountStatus: () => Promise<void>;
}

export const useStaffProfile = (id: string | undefined): UseStaffProfileReturn => {
  const [user, setUser] = useState<StaffProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Fetch profile
  useEffect(() => {
    if (!id) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await staffApi.getStaffById(id);
        if (data) {
          setUser(data);
        } else {
          setError('Staff member not found.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  // Toggle activate/deactivate
  const toggleAccountStatus = useCallback(async () => {
    if (!user) return;

    setIsDeactivating(true);
    try {
      const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';

      await staffApi.toggleStatus(user.id, newStatus === 'Active');

      setUser((prev) =>
        prev ? { ...prev, status: newStatus } : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Status update failed');
    } finally {
      setIsDeactivating(false);
    }
  }, [user]);

  return { user, isLoading, error, isDeactivating, toggleAccountStatus };
};