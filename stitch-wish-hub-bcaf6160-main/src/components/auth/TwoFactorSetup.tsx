import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type Factor = { id: string; friendly_name?: string | null; status: string; factor_type: string };

const TwoFactorSetup = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [enrollment, setEnrollment] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState('');

  const verifiedTotp = factors.find((f) => f.factor_type === 'totp' && f.status === 'verified');

  const loadFactors = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (!error && data) setFactors([...(data.totp || []), ...((data as any).phone || [])]);
    setLoading(false);
  };

  useEffect(() => {
    loadFactors();
  }, []);

  const startEnroll = async () => {
    setBusy(true);
    // Clean any unverified factors first to avoid "already exists" error
    const unverified = factors.filter((f) => f.status !== 'verified');
    for (const f of unverified) {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `Authenticator ${Date.now()}`,
    });
    setBusy(false);
    if (error || !data) {
      toast({ title: 'Error', description: error?.message || 'Failed to start 2FA setup', variant: 'destructive' });
      return;
    }
    setEnrollment({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verifyEnroll = async () => {
    if (!enrollment) return;
    setBusy(true);
    const { data: chal, error: chalErr } = await supabase.auth.mfa.challenge({ factorId: enrollment.id });
    if (chalErr || !chal) {
      setBusy(false);
      toast({ title: 'Error', description: chalErr?.message || 'Challenge failed', variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.mfa.verify({
      factorId: enrollment.id,
      challengeId: chal.id,
      code,
    });
    setBusy(false);
    if (error) {
      toast({ title: 'Invalid code', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Two-factor enabled', description: 'Your account is now protected with 2FA.' });
    setEnrollment(null);
    setCode('');
    await loadFactors();
  };

  const cancelEnroll = async () => {
    if (!enrollment) return;
    await supabase.auth.mfa.unenroll({ factorId: enrollment.id });
    setEnrollment(null);
    setCode('');
    await loadFactors();
  };

  const disable = async () => {
    if (!verifiedTotp) return;
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId: verifiedTotp.id });
    setBusy(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Two-factor disabled' });
    await loadFactors();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security using an authenticator app (Google Authenticator, Authy, 1Password, etc.).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : verifiedTotp ? (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                Enabled
              </span>
              <span className="text-muted-foreground">Authenticator app is active.</span>
            </div>
            <Button variant="destructive" onClick={disable} disabled={busy}>
              <ShieldOff className="h-4 w-4 mr-2" />
              Disable 2FA
            </Button>
          </div>
        ) : enrollment ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-muted/40">
              <img src={enrollment.qr} alt="2FA QR code" className="w-48 h-48 bg-white p-2 rounded" />
              <div className="text-xs text-center">
                <p className="text-muted-foreground">Or enter this secret manually:</p>
                <code className="font-mono text-xs break-all">{enrollment.secret}</code>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="totp-code">Enter the 6-digit code from your app</Label>
              <Input
                id="totp-code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelEnroll} disabled={busy} className="flex-1">
                Cancel
              </Button>
              <Button onClick={verifyEnroll} disabled={busy || code.length !== 6} className="flex-1">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Enable'}
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={startEnroll} disabled={busy}>
            <ShieldCheck className="h-4 w-4 mr-2" />
            Enable 2FA
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default TwoFactorSetup;