import { useState, useEffect, useCallback } from 'react';

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface UseUserLocationResult {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
  hasPermission: boolean | null;
}

export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setHasPermission(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setHasPermission(true);
        setLoading(false);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Permission denied');
            setHasPermission(false);
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Position unavailable');
            break;
          case err.TIMEOUT:
            setError('Request timeout');
            break;
          default:
            setError('Unknown error');
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000, // Cache for 1 minute
      }
    );
  }, []);

  // Auto-request on mount if permission was previously granted
  useEffect(() => {
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setHasPermission(true);
          requestLocation();
        } else if (result.state === 'denied') {
          setHasPermission(false);
        }
      });
    }
  }, [requestLocation]);

  return {
    location,
    loading,
    error,
    requestLocation,
    hasPermission,
  };
}
