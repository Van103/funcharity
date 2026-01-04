import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HelpRequest } from '@/hooks/useHelpRequests';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUserLocation } from '@/hooks/useUserLocation';
import { DistanceFilter } from './DistanceFilter';
import { calculateDistance, formatDistance } from '@/lib/geoUtils';
import { MapPin, Key, Navigation, X, Loader2 } from 'lucide-react';

interface HelpRequestsMapProps {
  requests: HelpRequest[];
  onSelectRequest?: (request: HelpRequest) => void;
}

const URGENCY_COLORS: Record<string, string> = {
  critical: '#ef4444', // red
  high: '#f97316', // orange
  medium: '#eab308', // yellow
  low: '#22c55e', // green
};

export const HelpRequestsMap: React.FC<HelpRequestsMapProps> = ({
  requests,
  onSelectRequest,
}) => {
  const { language } = useLanguage();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const radiusCircleRef = useRef<string | null>(null);
  const routeLayerRef = useRef<string | null>(null);
  
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || '';
  });
  const [isTokenSet, setIsTokenSet] = useState<boolean>(() => {
    return !!localStorage.getItem('mapbox_token');
  });
  const [inputToken, setInputToken] = useState('');
  const [selectedDistance, setSelectedDistance] = useState<number>(-1);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(false);
  
  const { location: userLocation, loading: locationLoading, requestLocation, hasPermission } = useUserLocation();

  const handleSaveToken = () => {
    if (inputToken.trim()) {
      localStorage.setItem('mapbox_token', inputToken.trim());
      setMapboxToken(inputToken.trim());
      setIsTokenSet(true);
    }
  };

  // Filter requests by distance
  const filteredRequests = React.useMemo(() => {
    if (!userLocation || selectedDistance === -1) return requests;
    
    return requests.filter((r) => {
      if (!r.latitude || !r.longitude) return true; // Keep requests without coords
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        r.latitude,
        r.longitude
      );
      return dist <= selectedDistance;
    });
  }, [requests, userLocation, selectedDistance]);

  // Get directions to a request
  const getDirections = useCallback(async (request: HelpRequest) => {
    if (!userLocation || !request.latitude || !request.longitude || !map.current || !mapboxToken) return;

    setLoadingRoute(true);
    setRouteInfo(null);

    try {
      // Remove existing route
      if (routeLayerRef.current && map.current.getLayer(routeLayerRef.current)) {
        map.current.removeLayer(routeLayerRef.current);
        map.current.removeSource(routeLayerRef.current);
      }

      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${userLocation.longitude},${userLocation.latitude};${request.longitude},${request.latitude}?geometries=geojson&overview=full&access_token=${mapboxToken}`
      );
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const routeId = `route-${Date.now()}`;
        routeLayerRef.current = routeId;

        // Add route to map
        map.current.addSource(routeId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: route.geometry,
          },
        });

        map.current.addLayer({
          id: routeId,
          type: 'line',
          source: routeId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': '#6366f1',
            'line-width': 5,
            'line-opacity': 0.8,
          },
        });

        // Set route info
        const distanceKm = (route.distance / 1000).toFixed(1);
        const durationMin = Math.round(route.duration / 60);
        setRouteInfo({
          distance: `${distanceKm} km`,
          duration: durationMin < 60 
            ? `${durationMin} ${language === 'vi' ? 'phút' : 'min'}`
            : `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`,
        });

        // Fit bounds to show route
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce((bounds: mapboxgl.LngLatBounds, coord: [number, number]) => {
          return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current.fitBounds(bounds, { padding: 60 });
      }
    } catch (error) {
      console.error('Error getting directions:', error);
    } finally {
      setLoadingRoute(false);
    }
  }, [userLocation, mapboxToken, language]);

  // Clear route
  const clearRoute = useCallback(() => {
    if (map.current && routeLayerRef.current) {
      if (map.current.getLayer(routeLayerRef.current)) {
        map.current.removeLayer(routeLayerRef.current);
        map.current.removeSource(routeLayerRef.current);
      }
      routeLayerRef.current = null;
      setRouteInfo(null);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !isTokenSet || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [106.6297, 16.4637], // Center of Vietnam
        zoom: 5,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return () => {
        markersRef.current.forEach((marker) => marker.remove());
        userMarkerRef.current?.remove();
        map.current?.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsTokenSet(false);
      localStorage.removeItem('mapbox_token');
    }
  }, [isTokenSet, mapboxToken]);

  // Add user location marker
  useEffect(() => {
    if (!map.current || !userLocation || !isTokenSet) return;

    // Remove existing user marker
    userMarkerRef.current?.remove();

    // Create user marker
    const el = document.createElement('div');
    el.className = 'user-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#3b82f6';
    el.style.border = '3px solid white';
    el.style.boxShadow = '0 0 0 2px #3b82f6, 0 2px 8px rgba(0,0,0,0.3)';

    userMarkerRef.current = new mapboxgl.Marker(el)
      .setLngLat([userLocation.longitude, userLocation.latitude])
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 4px 8px;">
          <strong>${language === 'vi' ? 'Vị trí của bạn' : 'Your location'}</strong>
        </div>
      `))
      .addTo(map.current);

    // Add/update radius circle if distance filter is active
    if (selectedDistance > 0) {
      const circleId = 'radius-circle';
      
      if (map.current.getLayer(circleId)) {
        map.current.removeLayer(circleId);
        map.current.removeSource(circleId);
      }

      // Create circle polygon
      const radiusInKm = selectedDistance;
      const points = 64;
      const coords: [number, number][] = [];
      
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        const dx = radiusInKm / 111.32 * Math.cos(angle);
        const dy = radiusInKm / (111.32 * Math.cos(userLocation.latitude * Math.PI / 180)) * Math.sin(angle);
        coords.push([userLocation.longitude + dy, userLocation.latitude + dx]);
      }

      map.current.addSource(circleId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [coords],
          },
        },
      });

      map.current.addLayer({
        id: circleId,
        type: 'fill',
        source: circleId,
        paint: {
          'fill-color': '#6366f1',
          'fill-opacity': 0.1,
        },
      });

      radiusCircleRef.current = circleId;
    } else if (radiusCircleRef.current && map.current.getLayer(radiusCircleRef.current)) {
      map.current.removeLayer(radiusCircleRef.current);
      map.current.removeSource(radiusCircleRef.current);
      radiusCircleRef.current = null;
    }
  }, [userLocation, isTokenSet, selectedDistance, language]);

  // Add markers for requests
  useEffect(() => {
    if (!map.current || !isTokenSet) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Filter requests with valid coordinates
    const requestsWithCoords = filteredRequests.filter(
      (r) => r.latitude && r.longitude
    );

    if (requestsWithCoords.length === 0) return;

    // Add markers
    requestsWithCoords.forEach((request) => {
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = URGENCY_COLORS[request.urgency] || URGENCY_COLORS.medium;
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      // Add inner icon
      const icon = document.createElement('div');
      icon.innerHTML = '📍';
      icon.style.fontSize = '16px';
      el.appendChild(icon);

      // Calculate distance from user
      let distanceText = '';
      if (userLocation && request.latitude && request.longitude) {
        const dist = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          request.latitude,
          request.longitude
        );
        distanceText = `<span style="font-size: 11px; color: #6b7280;">📍 ${formatDistance(dist)}</span>`;
      }

      // Create popup with directions button
      const popupContent = `
        <div style="padding: 8px; max-width: 250px;">
          <h3 style="font-weight: 600; margin-bottom: 4px; color: #1f2937;">${request.title}</h3>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${request.location_name || 'Unknown location'}</p>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 8px;">
            <span style="
              padding: 2px 8px; 
              border-radius: 4px; 
              font-size: 11px; 
              font-weight: 500;
              background: ${URGENCY_COLORS[request.urgency]}20;
              color: ${URGENCY_COLORS[request.urgency]};
            ">
              ${request.urgency === 'critical' ? '🔴 Khẩn cấp' : 
                request.urgency === 'high' ? '🟠 Cao' : 
                request.urgency === 'medium' ? '🟡 Trung bình' : '🟢 Thấp'}
            </span>
            <span style="font-size: 11px; color: #6b7280;">
              👥 ${request.volunteers_matched}/${request.volunteers_needed}
            </span>
            ${distanceText}
          </div>
          <p style="font-size: 12px; color: #4b5563; line-height: 1.4; margin-bottom: 8px;">
            ${(request.description || '').substring(0, 100)}${(request.description?.length || 0) > 100 ? '...' : ''}
          </p>
          ${userLocation ? `
            <button 
              id="directions-btn-${request.id}"
              style="
                width: 100%;
                padding: 6px 12px;
                background: #6366f1;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 4px;
              "
            >
              🧭 ${language === 'vi' ? 'Chỉ đường' : 'Get directions'}
            </button>
          ` : ''}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

      popup.on('open', () => {
        const btn = document.getElementById(`directions-btn-${request.id}`);
        if (btn) {
          btn.addEventListener('click', () => {
            getDirections(request);
            popup.remove();
          });
        }
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([request.longitude!, request.latitude!])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onSelectRequest?.(request);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (requestsWithCoords.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      requestsWithCoords.forEach((r) => {
        bounds.extend([r.longitude!, r.latitude!]);
      });
      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude]);
      }
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 12 });
    }
  }, [filteredRequests, isTokenSet, onSelectRequest, userLocation, language, getDirections]);

  if (!isTokenSet) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-8 text-center">
          <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">
            {language === 'vi' ? 'Cần Mapbox Token' : 'Mapbox Token Required'}
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {language === 'vi'
              ? 'Để hiển thị bản đồ, vui lòng nhập Mapbox Public Token của bạn. Truy cập mapbox.com để lấy token miễn phí.'
              : 'To display the map, please enter your Mapbox Public Token. Visit mapbox.com to get a free token.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="text"
              placeholder="pk.eyJ1..."
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveToken} className="gap-2">
              <Key className="w-4 h-4" />
              {language === 'vi' ? 'Lưu Token' : 'Save Token'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            {language === 'vi'
              ? 'Token sẽ được lưu trong trình duyệt của bạn.'
              : 'The token will be saved in your browser.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Distance Filter */}
      <DistanceFilter
        selectedDistance={selectedDistance}
        onDistanceChange={setSelectedDistance}
        userLocationAvailable={!!userLocation}
        onRequestLocation={requestLocation}
        loading={locationLoading}
      />

      {/* Route Info */}
      {routeInfo && (
        <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
          <Navigation className="w-5 h-5 text-primary" />
          <div className="flex-1">
            <span className="font-medium">{routeInfo.distance}</span>
            <span className="mx-2 text-muted-foreground">•</span>
            <span className="text-muted-foreground">{routeInfo.duration}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={clearRoute}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {loadingRoute && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">
            {language === 'vi' ? 'Đang tải lộ trình...' : 'Loading route...'}
          </span>
        </div>
      )}

      {/* Map */}
      <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-border/50">
        <div ref={mapContainer} className="absolute inset-0" />
        
        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border/50">
          <p className="text-xs font-medium mb-2 text-muted-foreground">
            {language === 'vi' ? 'Mức độ khẩn cấp' : 'Urgency Level'}
          </p>
          <div className="space-y-1">
            {[
              { key: 'critical', label: language === 'vi' ? 'Khẩn cấp' : 'Critical' },
              { key: 'high', label: language === 'vi' ? 'Cao' : 'High' },
              { key: 'medium', label: language === 'vi' ? 'Trung bình' : 'Medium' },
              { key: 'low', label: language === 'vi' ? 'Thấp' : 'Low' },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: URGENCY_COLORS[item.key] }}
                />
                <span className="text-xs">{item.label}</span>
              </div>
            ))}
            {userLocation && (
              <div className="flex items-center gap-2 pt-1 border-t border-border/50 mt-1">
                <div className="w-3 h-3 rounded-full bg-blue-500 ring-2 ring-blue-500/30" />
                <span className="text-xs">{language === 'vi' ? 'Vị trí của bạn' : 'Your location'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Request count */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-border/50">
          <p className="text-sm font-medium">
            {filteredRequests.filter((r) => r.latitude && r.longitude).length}{' '}
            {language === 'vi' ? 'yêu cầu trên bản đồ' : 'requests on map'}
          </p>
        </div>
      </div>
    </div>
  );
};
