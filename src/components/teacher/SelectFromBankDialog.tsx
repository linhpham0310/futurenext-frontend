'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { teacherApi } from '@/lib/api';
import { Search } from 'lucide-react';

interface QuestionItem {
  id: string;
  type: 'MCQ' | 'ESSAY' | 'CODING';
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: string;
  tags: string[];
}

interface Bank {
  id: string;
  name: string;
  description?: string;
  items: QuestionItem[];
}

interface SelectFromBankDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (questions: QuestionItem[]) => void;
  existingQuestionIds?: string[];
}

export function SelectFromBankDialog({
  open,
  onOpenChange,
  onSelect,
  existingQuestionIds = [],
}: SelectFromBankDialogProps) {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bankItems, setBankItems] = useState<QuestionItem[]>([]);

  useEffect(() => {
    if (open) {
      teacherApi
        .getQuestionBanks()
        .then((res) => setBanks(res.data))
        .catch(() => toast.error('Không thể tải ngân hàng'))
        .finally(() => setLoading(false));
    }
  }, [open]);

  useEffect(() => {
    if (selectedBank) {
      const bank = banks.find((b) => b.id === selectedBank);
      setBankItems(bank?.items || []);
    } else {
      setBankItems([]);
    }
    setSelectedItems(new Set());
  }, [selectedBank, banks]);

  const filteredItems = bankItems.filter(
    (item) =>
      item.questionText.toLowerCase().includes(search.toLowerCase()) &&
      !existingQuestionIds.includes(item.id)
  );

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedItems);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedItems(newSet);
  };

  const handleConfirm = () => {
    const selectedQuestions = bankItems.filter((item) => selectedItems.has(item.id));
    if (selectedQuestions.length === 0) {
      toast.error('Vui lòng chọn ít nhất một câu hỏi');
      return;
    }
    onSelect(selectedQuestions);
    onOpenChange(false);
    setSelectedItems(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn câu hỏi từ ngân hàng</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4 items-center mb-4">
          <select
            className="flex-1 p-2 border rounded"
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
          >
            <option value="">-- Chọn ngân hàng --</option>
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>
                {bank.name} ({bank.items?.length || 0} câu)
              </option>
            ))}
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm câu hỏi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto border rounded">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !selectedBank ? (
            <p className="text-center py-8 text-gray-500">Vui lòng chọn ngân hàng</p>
          ) : filteredItems.length === 0 ? (
            <p className="text-center py-8 text-gray-500">Không có câu hỏi nào phù hợp</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="w-12">Chọn</TableCell>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Độ khó</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={() => toggleSelect(item.id)}
                      />
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{item.questionText}</TableCell>
                    <TableCell>
                      {item.type === 'MCQ'
                        ? 'Trắc nghiệm'
                        : item.type === 'ESSAY'
                          ? 'Tự luận'
                          : 'Lập trình'}
                    </TableCell>
                    <TableCell>{item.difficulty || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirm} disabled={selectedItems.size === 0}>
            Thêm {selectedItems.size} câu hỏi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
