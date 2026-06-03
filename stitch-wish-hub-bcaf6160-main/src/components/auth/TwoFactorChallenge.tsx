import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onVerified: () => void;
  onCancel: () => void;
}

const TwoFactorChallenge = ({ onVerified, onCancel }: Props) => {
  const { toast } = useToast();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      const totp = data?.totp?.find((f) => f.status === 'verified');
      if (error || !totp) {
        toast({ title: 'Error', description: error?.message || 'No 2FA factor found', variant: 'destructive' });
        onCancel();
        return;
      }
      setFactorId(totp.id);
      const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId: totp.id });
      if (chalErr || !chal) {
        toast({ title: 'Error', description: chalErr?.message || 'Failed to create challenge', variant: 'destructive' });
        onCancel();
        return;
      }
      setChallengeId(chal.id);
    })();
  }, []);

  const verify = async () => {
    if (!factorId || !challengeId) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
    setBusy(false);
    if (error) {
      toast({ title: 'Invalid code', description: error.message, variant: 'destructive' });
      return;
    }
    onVerified();
  };

  return (
    <Card className="border-border/50 shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>Enter the 6-digit code from your authenticator app</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-code">Verification code</Label>
          <Input
            id="mfa-code"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="123456"
            autoFocus
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={async () => { await supabase.auth.signOut(); onCancel(); }} className="flex-1">
            Cancel
          </Button>
          <Button onClick={verify} disabled={busy || code.length !== 6} className="flex-1">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TwoFactorChallenge;