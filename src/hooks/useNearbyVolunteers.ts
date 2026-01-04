import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NearbyVolunteer {
  volunteer_id: string;
  request_id: string;
  match_score: number;
  skill_score: number;
  geo_score: number;
  experience_score: number;
  distance_km?: number;
  profile?: {
    full_name: string;
    avatar_url: string;
  };
  volunteer_profile?: {
    skills: string[];
    experience_level: string;
    rating: number;
    completed_tasks: number;
  };
}

export function useNearbyVolunteers() {
  const [volunteers, setVolunteers] = useState<NearbyVolunteer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findNearbyVolunteers = useCallback(async (
    requestId: string,
    radiusKm: number = 50,
    limit: number = 10
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('volunteer-matching', {
        body: {
          action: 'find_nearby_volunteers',
          request_id: requestId,
          radius_km: radiusKm,
          limit,
        },
      });

      if (fnError) throw fnError;

      if (data?.volunteers) {
        setVolunteers(data.volunteers);
        return data.volunteers;
      }

      return [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[useNearbyVolunteers] Error:', message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const createMatches = useCallback(async (
    requestId: string,
    volunteerIds: string[]
  ) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('volunteer-matching', {
        body: {
          action: 'create_selected_matches',
          request_id: requestId,
          volunteer_ids: volunteerIds,
        },
      });

      if (fnError) throw fnError;

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      console.error('[useNearbyVolunteers] Error creating matches:', message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    volunteers,
    loading,
    error,
    findNearbyVolunteers,
    createMatches,
  };
}
