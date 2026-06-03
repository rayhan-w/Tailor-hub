import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MeasurementData {
  chest: string;
  waist: string;
  hips: string;
  shoulderWidth: string;
  armLength: string;
  inseam: string;
  neck: string;
  thigh: string;
}

interface BodyMeasurementProps {
  initialData?: Partial<MeasurementData>;
  onSave?: (data: MeasurementData) => void;
  isEditable?: boolean;
}

type BodyPart = keyof MeasurementData;

const BodyMeasurement = ({ initialData, onSave, isEditable = true }: BodyMeasurementProps) => {
  const { t } = useLanguage();
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [measurements, setMeasurements] = useState<MeasurementData>({
    chest: initialData?.chest || '',
    waist: initialData?.waist || '',
    hips: initialData?.hips || '',
    shoulderWidth: initialData?.shoulderWidth || '',
    armLength: initialData?.armLength || '',
    inseam: initialData?.inseam || '',
    neck: initialData?.neck || '',
    thigh: initialData?.thigh || '',
  });

  const bodyParts: { id: BodyPart; label: string; path: string }[] = [
    {
      id: 'neck',
      label: t('neck'),
      path: 'M145,60 Q150,55 155,60 L155,75 Q150,80 145,75 Z',
    },
    {
      id: 'shoulderWidth',
      label: t('shoulderWidth'),
      path: 'M110,75 L145,75 L145,90 L110,90 Z M155,75 L190,75 L190,90 L155,90 Z',
    },
    {
      id: 'chest',
      label: t('chest'),
      path: 'M110,90 L190,90 L185,140 L115,140 Z',
    },
    {
      id: 'waist',
      label: t('waist'),
      path: 'M115,140 L185,140 L180,170 L120,170 Z',
    },
    {
      id: 'hips',
      label: t('hips'),
      path: 'M120,170 L180,170 L175,200 L125,200 Z',
    },
    {
      id: 'armLength',
      label: t('armLength'),
      path: 'M100,75 L110,75 L100,180 L90,180 Z M190,75 L200,75 L210,180 L200,180 Z',
    },
    {
      id: 'thigh',
      label: t('thigh'),
      path: 'M125,200 L150,200 L145,280 L120,280 Z M150,200 L175,200 L180,280 L155,280 Z',
    },
    {
      id: 'inseam',
      label: t('inseam'),
      path: 'M145,200 L155,200 L155,280 L145,280 Z',
    },
  ];

  const handlePartClick = (partId: BodyPart) => {
    if (isEditable) {
      setSelectedPart(partId);
    }
  };

  const handleMeasurementChange = (partId: BodyPart, value: string) => {
    setMeasurements(prev => ({ ...prev, [partId]: value }));
  };

  const handleSave = () => {
    onSave?.(measurements);
  };

  const getPartColor = (partId: BodyPart) => {
    if (selectedPart === partId) {
      return 'hsl(var(--primary))';
    }
    if (measurements[partId]) {
      return 'hsl(var(--primary) / 0.5)';
    }
    return 'hsl(var(--muted))';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Interactive Body SVG */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('myMeasurements')}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isEditable ? t('clickBodyPart') : t('savedMeasurements')}
          </p>
        </CardHeader>
        <CardContent className="flex justify-center">
          <svg
            viewBox="70 40 160 260"
            className="w-full max-w-[300px] h-auto cursor-pointer"
          >
            {/* Body outline */}
            <ellipse
              cx="150"
              cy="50"
              rx="20"
              ry="18"
              fill="hsl(var(--muted))"
              stroke="hsl(var(--border))"
              strokeWidth="1"
            />
            
            {/* Interactive body parts */}
            {bodyParts.map((part) => (
              <path
                key={part.id}
                d={part.path}
                fill={getPartColor(part.id)}
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
                className={`transition-all duration-300 ${
                  isEditable ? 'cursor-pointer hover:opacity-80' : ''
                }`}
                onClick={() => handlePartClick(part.id)}
              >
                <title>{part.label}</title>
              </path>
            ))}
            
            {/* Labels for filled measurements */}
            {bodyParts.map((part, index) => {
              if (measurements[part.id]) {
                return (
                  <text
                    key={`label-${part.id}`}
                    x={index % 2 === 0 ? 75 : 225}
                    y={100 + index * 25}
                    fontSize="10"
                    fill="hsl(var(--foreground))"
                    textAnchor={index % 2 === 0 ? 'end' : 'start'}
                  >
                    {part.label}: {measurements[part.id]}″
                  </text>
                );
              }
              return null;
            })}
          </svg>
        </CardContent>
      </Card>

      {/* Measurement Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedPart ? bodyParts.find(p => p.id === selectedPart)?.label : t('enterMeasurement')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {bodyParts.map((part) => (
              <div
                key={part.id}
                className={`space-y-1 p-2 rounded-lg transition-all ${
                  selectedPart === part.id ? 'bg-primary/10 ring-2 ring-primary' : ''
                }`}
              >
                <Label htmlFor={part.id} className="text-sm font-medium">
                  {part.label}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id={part.id}
                    type="number"
                    placeholder="0"
                    value={measurements[part.id]}
                    onChange={(e) => handleMeasurementChange(part.id, e.target.value)}
                    onFocus={() => setSelectedPart(part.id)}
                    disabled={!isEditable}
                    className="text-center"
                  />
                  <span className="text-sm text-muted-foreground">{t('inch')}</span>
                </div>
              </div>
            ))}
          </div>

          {isEditable && onSave && (
            <Button onClick={handleSave} className="w-full mt-6">
              {t('save')} {t('myMeasurements')}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BodyMeasurement;
