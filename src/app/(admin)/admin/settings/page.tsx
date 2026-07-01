'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

interface SystemSettings {
  siteName: string;
  supportEmail: string;
  currency: string;
  defaultLanguage: string;
  stripeSecretKey: string;
  stripePublishableKey: string;
  vnpayMerchantId: string;
  vnpaySecretKey: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  aiProvider: 'openai' | 'google' | 'none';
  aiApiKey: string;
  aiModel: string;
}

export default function AdminSettingsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'FutureNext.ai',
    supportEmail: 'support@futurenext.ai',
    currency: 'VND',
    defaultLanguage: 'vi',
    stripeSecretKey: '',
    stripePublishableKey: '',
    vnpayMerchantId: '',
    vnpaySecretKey: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    aiProvider: 'none',
    aiApiKey: '',
    aiModel: 'gpt-4',
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchSettings = async () => {
        try {
          const response = await adminApi.getSettings();
          setSettings(response.data);
        } catch {
          toast.error('Không thể tải cấu hình hệ thống');
        } finally {
          setLoading(false);
        }
      };
      fetchSettings();
    }
  }, [isAdmin]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      toast.success('Cập nhật cấu hình thành công');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: keyof SystemSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Thiết lập hệ thống</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Chung</TabsTrigger>
          <TabsTrigger value="payment">Thanh toán</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tên hệ thống</Label>
                <Input
                  value={settings.siteName}
                  onChange={(e) => updateField('siteName', e.target.value)}
                />
              </div>
              <div>
                <Label>Email hỗ trợ</Label>
                <Input
                  value={settings.supportEmail}
                  onChange={(e) => updateField('supportEmail', e.target.value)}
                />
              </div>
              <div>
                <Label>Đơn vị tiền tệ</Label>
                <select
                  className="w-full border rounded p-2"
                  value={settings.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                >
                  <option value="VND">VND</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div>
                <Label>Ngôn ngữ mặc định</Label>
                <select
                  className="w-full border rounded p-2"
                  value={settings.defaultLanguage}
                  onChange={(e) => updateField('defaultLanguage', e.target.value)}
                >
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">Tiếng Anh</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-medium">Stripe</h3>
                <div>
                  <Label>Secret Key</Label>
                  <Input
                    type="password"
                    value={settings.stripeSecretKey}
                    onChange={(e) => updateField('stripeSecretKey', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Publishable Key</Label>
                  <Input
                    value={settings.stripePublishableKey}
                    onChange={(e) => updateField('stripePublishableKey', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t">
                <h3 className="font-medium">VNPay</h3>
                <div>
                  <Label>Merchant ID</Label>
                  <Input
                    value={settings.vnpayMerchantId}
                    onChange={(e) => updateField('vnpayMerchantId', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Secret Key</Label>
                  <Input
                    type="password"
                    value={settings.vnpaySecretKey}
                    onChange={(e) => updateField('vnpaySecretKey', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình SMTP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>SMTP Host</Label>
                <Input
                  value={settings.smtpHost}
                  onChange={(e) => updateField('smtpHost', e.target.value)}
                />
              </div>
              <div>
                <Label>SMTP Port</Label>
                <Input
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) => updateField('smtpPort', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Username</Label>
                <Input
                  value={settings.smtpUsername}
                  onChange={(e) => updateField('smtpUsername', e.target.value)}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => updateField('smtpPassword', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>Cấu hình AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nhà cung cấp</Label>
                <select
                  className="w-full border rounded p-2"
                  value={settings.aiProvider}
                  onChange={(e) => updateField('aiProvider', e.target.value)}
                >
                  <option value="none">Không sử dụng</option>
                  <option value="openai">OpenAI</option>
                  <option value="google">Google Gemini</option>
                </select>
              </div>
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={settings.aiApiKey}
                  onChange={(e) => updateField('aiApiKey', e.target.value)}
                />
              </div>
              <div>
                <Label>Model</Label>
                <Input
                  value={settings.aiModel}
                  onChange={(e) => updateField('aiModel', e.target.value)}
                  placeholder="gpt-4, gemini-pro..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
