'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Editor } from '@monaco-editor/react';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';
import { Play, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface LabData {
  id: string;
  title: string;
  description: string;
  instructions: string;
  initialCode: string;
  language: 'javascript' | 'python' | 'java' | 'cpp';
  testCases: { input: string; expected: string; description: string }[];
  userProgress?: {
    code: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    score?: number;
  };
}

interface SubmissionResult {
  passed: boolean;
  score: number;
  totalTests: number;
  passedTests: number;
  results: { testCase: string; passed: boolean; output: string; expected: string }[];
  feedback?: string;
}

export default function CodeLabPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [lab, setLab] = useState<LabData | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [activeTab, setActiveTab] = useState('instruction');

  useEffect(() => {
    if (user && lessonId) {
      studentApi
        .getLab(lessonId as string)
        .then((res) => {
          setLab(res.data);
          setCode(res.data.userProgress?.code || res.data.initialCode || '');
        })
        .catch(() => toast.error('Không thể tải bài lab'))
        .finally(() => setLoading(false));
    }
  }, [lessonId, user]);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error('Vui lòng nhập code');
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const res = await studentApi.submitLab(lessonId as string, { code });
      setResult(res.data);
      toast.success(
        res.data.passed
          ? '🎉 Chúc mừng! Bạn đã vượt qua bài lab!'
          : 'Một số test chưa đạt, hãy thử lại'
      );
      setActiveTab('result');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Nộp bài thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetCode = () => {
    if (lab) {
      setCode(lab.initialCode || '');
      setResult(null);
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!lab)
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy bài lab.</p>
        <BackButton className="mt-4" />
      </div>
    );

  const languageMap: Record<string, string> = {
    javascript: 'javascript',
    python: 'python',
    java: 'java',
    cpp: 'cpp',
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-2xl font-bold">{lab.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-muted text-foreground px-3 py-1 rounded-full">
            {lab.language.toUpperCase()}
          </span>
          {lab.userProgress?.status === 'COMPLETED' && (
            <span className="text-sm bg-muted text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Hoàn thành
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Panel - Instruction & Description */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hướng dẫn</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: lab.description || lab.instructions || '' }}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Test Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {lab.testCases.map((tc, idx) => (
                  <div key={idx} className="border-b pb-2 last:border-0">
                    <p className="text-sm font-medium">{tc.description}</p>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>
                        Input: <code className="bg-muted px-1 rounded">{tc.input}</code>
                      </span>
                      <span>
                        Expected: <code className="bg-muted px-1 rounded">{tc.expected}</code>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Code Editor & Result */}
        <div className="space-y-4">
          <Card className="flex-1">
            <CardContent className="p-0">
              <div className="border-b p-2 flex justify-between items-center bg-muted/50">
                <span className="text-sm font-medium text-muted-foreground">Code Editor</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetCode}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Play className="h-4 w-4 mr-2" />
                    )}
                    {submitting ? 'Đang chạy...' : 'Chạy & Nộp'}
                  </Button>
                </div>
              </div>
              <Editor
                height="400px"
                language={languageMap[lab.language] || 'javascript'}
                value={code}
                onChange={(value) => setCode(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  automaticLayout: true,
                }}
              />
            </CardContent>
          </Card>

          {/* Result Panel */}
          {result && (
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  Kết quả: {result.passed ? 'Thành công' : 'Chưa đạt'} ({result.passedTests}/
                  {result.totalTests} test)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-60 overflow-y-auto">
                {result.results.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-md text-sm ${
                      r.passed ? 'bg-muted/50 border-border' : 'bg-destructive/10 border-destructive/30'
                    } border`}
                  >
                    <div className="flex items-center gap-2">
                      {r.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{r.testCase}</span>
                    </div>
                    <div className="text-xs mt-1 text-muted-foreground">
                      <div>
                        Output:{' '}
                        <code className="bg-muted px-1 rounded">
                          {r.output || '(no output)'}
                        </code>
                      </div>
                      {!r.passed && (
                        <div>
                          Expected: <code className="bg-muted px-1 rounded">{r.expected}</code>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {result.feedback && (
                  <div className="mt-2 p-2 bg-muted/50 border border-border rounded-md text-sm">
                    <p className="font-medium text-foreground">Phản hồi:</p>
                    <p>{result.feedback}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
