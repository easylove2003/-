import { useState, useEffect, useCallback } from 'react';

// 上传记录类型
export interface UploadRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTime: Date;
  dataPreview: string; // JSON string
  fieldCount: number;
  rowCount: number;
  summary?: string; 
  stats?: string; // JSON stringified column stats
  analysisResults?: string[];
  tags?: string[];
}

// 记忆记录存储hook
export function useMemory() {
  const [records, setRecords] = useState<UploadRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<UploadRecord | null>(null);
  
  // 从localStorage加载记录
  useEffect(() => {
    try {
      const saved = localStorage.getItem('uploadRecords');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 转换日期字符串为Date对象
        const recordsWithDates = parsed.map((r: any) => ({
          ...r,
          uploadTime: new Date(r.uploadTime)
        }));
        setRecords(recordsWithDates);
      }
    } catch (e) {
      console.error('Failed to parse saved records:', e);
    }
  }, []);
  
  // 保存记录到localStorage
  const saveRecords = useCallback((newRecords: UploadRecord[]) => {
    try {
      localStorage.setItem('uploadRecords', JSON.stringify(newRecords));
      setRecords(newRecords);
    } catch (e) {
      console.error('Failed to save records:', e);
    }
  }, []);
  
  // 添加新记录
  const addRecord = useCallback((record: Omit<UploadRecord, 'id' | 'uploadTime'>) => {
    const newRecord: UploadRecord = {
      ...record,
      id: `record_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      uploadTime: new Date(),
    };
    const updatedRecords = [newRecord, ...records];
    saveRecords(updatedRecords);
    return newRecord;
  }, [records, saveRecords]);
  
  // 删除记录
  const deleteRecord = useCallback((id: string) => {
    const updatedRecords = records.filter(r => r.id !== id);
    saveRecords(updatedRecords);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
  }, [records, saveRecords, selectedRecord]);
  
  // 清空所有记录
  const clearAllRecords = useCallback(() => {
    saveRecords([]);
    setSelectedRecord(null);
  }, [saveRecords]);
  
  // 选择记录查看详情
  const selectRecord = useCallback((record: UploadRecord | null) => {
    setSelectedRecord(record);
  }, []);
  
  // 更新记录的分析结果
  const updateRecordAnalysis = useCallback((id: string, analysisResults: string[]) => {
    const updatedRecords = records.map(r => 
      r.id === id ? { ...r, analysisResults } : r
    );
    saveRecords(updatedRecords);
  }, [records, saveRecords]);

  // 更新记录的标签
  const updateRecordTags = useCallback((id: string, tags: string[]) => {
    const updatedRecords = records.map(r => 
      r.id === id ? { ...r, tags } : r
    );
    saveRecords(updatedRecords);
  }, [records, saveRecords]);
  
  return {
    records,
    selectedRecord,
    addRecord,
    deleteRecord,
    clearAllRecords,
    selectRecord,
    updateRecordAnalysis,
    updateRecordTags,
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return '今天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
}
