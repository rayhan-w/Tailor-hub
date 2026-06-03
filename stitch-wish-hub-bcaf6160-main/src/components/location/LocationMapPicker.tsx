import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Leaflet default marker fix for bundlers
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationMapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

const LocationMapPicker = ({ onLocationSelect, initialLat, initialLng }: LocationMapPickerProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLat, setSelectedLat] = useState(initialLat || 23.8103);
  const [selectedLng, setSelectedLng] = useState(initialLng || 90.4125);
  const [isLoading, setIsLoading] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const handleGetCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedLat(lat);
          setSelectedLng(lng);
          if (mapRef.current && markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
            mapRef.current.flyTo([lat, lng], 15, { duration: 1 });
          }
          setIsLoading(false);
        },
        () => setIsLoading(false),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    const locationStr = `${selectedLat.toFixed(4)}, ${selectedLng.toFixed(4)}`;
    onLocationSelect(selectedLat, selectedLng, locationStr);
    setIsOpen(false);
  };

  // Init Leaflet map when dialog opens
  useEffect(() => {
    if (!isOpen) return;

    const id = window.setTimeout(() => {
      const el = mapContainerRef.current;
      if (!el) return;

      if (!mapRef.current) {
        const map = L.map(el, {
          center: [selectedLat, selectedLng],
          zoom: 13,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const marker = L.marker([selectedLat, selectedLng]).addTo(map);
        markerRef.current = marker;
        mapRef.current = map;

        map.on('click', (e: L.LeafletMouseEvent) => {
          setSelectedLat(e.latlng.lat);
          setSelectedLng(e.latlng.lng);
          marker.setLatLng([e.latlng.lat, e.latlng.lng]);
        });

        setTimeout(() => map.invalidateSize(), 300);
      }

      mapRef.current.invalidateSize();
      mapRef.current.setView([selectedLat, selectedLng], Math.max(mapRef.current.getZoom(), 13));
      markerRef.current?.setLatLng([selectedLat, selectedLng]);
    }, 200);

    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Cleanup
  useEffect(() => {
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-2">
          <MapPin className="h-4 w-4" />
          {t('selectOnMap')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('selectOnMap')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative w-full h-80 rounded-lg overflow-hidden border-2 border-border">
            <div ref={mapContainerRef} className="h-full w-full" />
            <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded px-2 py-1 text-xs z-[1000]">
              {selectedLat.toFixed(4)}°N, {selectedLng.toFixed(4)}°E
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleGetCurrentLocation}
              disabled={isLoading}
              className="gap-2"
            >
              <Navigation className="h-4 w-4" />
              {isLoading ? t('loading') : t('useCurrentLocation')}
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="button" onClick={handleConfirm}>
                {t('save')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationMapPicker;
