import React, { useState, useEffect, useRef } from 'react';
import {
  Upload, FolderOpen, Search, Trash2, FileText, FileImage,
  File, Edit3, Check, X, Filter, Loader2, Crown
} from 'lucide-react';
import { documentService, DocumentMeta, DOC_CATEGORIES } from '../services/documentService';
import { useAuth } from '../contexts/AuthContext';

interface DocumentVaultViewProps {
  projectId?: string;
  onUpgrade?: () => void;
}

export const DocumentVaultView: React.FC<DocumentVaultViewProps> = ({ projectId, onUpgrade }) => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [editingMemo, setEditingMemo] = useState<{ id: string; value: string } | null>(null);
  const [uploadCategory, setUploadCategory] = useState(DOC_CATEGORIES[0]);
  const [uploadMemo, setUploadMemo] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [toast, setToast] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const isProUser = user?.plan === 'pro';

  useEffect(() => {
    loadDocs();
  }, [user?.id, projectId]);

  const loadDocs = async () => {
    setLoading(true);
    try {
      const all = await documentService.getDocuments(user?.id, projectId);
      setDocs(all);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocs = docs.filter((d) => {
    const matchSearch = !searchQuery ||
      d.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.memo?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = !categoryFilter || d.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const ALLOWED_TYPES = [
      'application/pdf', 'image/jpeg', 'image/png', 'image/jpg',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB

    for (const file of Array.from(files) as File[]) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        showToast(`${file.name}: 지원하지 않는 파일 형식입니다. (PDF, JPG, PNG, DOCX만 가능)`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        showToast(`${file.name}: 파일 크기가 20MB를 초과합니다.`);
        continue;
      }

      setUploading(true);
      try {
        await documentService.uploadDocument(file, {
          category: uploadCategory,
          projectId,
          userId: user?.id,
          memo: uploadMemo,
        });
        showToast(`${file.name} 업로드 완료`);
        setUploadMemo('');
        await loadDocs();
      } catch {
        showToast(`${file.name} 업로드 실패`);
      } finally {
        setUploading(false);
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (docId: string, filename: string) => {
    if (!window.confirm(`"${filename}"을 삭제하시겠습니까?`)) return;
    await documentService.deleteDocument(docId);
    setDocs((prev) => prev.filter((d) => d.id !== docId));
    showToast('삭제되었습니다.');
  };

  const handleSaveMemo = async () => {
    if (!editingMemo) return;
    await documentService.updateMemo(editingMemo.id, editingMemo.value);
    setDocs((prev) =>
      prev.map((d) =>
        d.id === editingMemo.id ? { ...d, memo: editingMemo.value } : d
      )
    );
    setEditingMemo(null);
    showToast('메모가 저장되었습니다.');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-slate-400" />;
  };

  if (!isProUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
        <div className="w-20 h-20 bg-yellow-50 rounded-3xl flex items-center justify-center border-2 border-yellow-200">
          <Crown className="w-10 h-10 text-yellow-500" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-slate-900">PRO 전용 기능</h3>
          <p className="text-slate-500 font-medium max-w-sm">
            문서 보관함은 PRO 구독자에게만 제공됩니다.<br />
            사업 관련 모든 문서를 안전하게 보관하세요.
          </p>
        </div>
        <button
          onClick={onUpgrade}
          className="px-8 py-3.5 bg-yellow-400 text-slate-900 font-black rounded-xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2"
        >
          <Crown className="w-4 h-4" />
          PRO로 업그레이드
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">문서 보관함</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">사업 관련 문서를 카테고리별로 관리하세요</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-xl border-2 border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] hover:shadow-[1px_1px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5 transition-all text-sm"
        >
          <Upload className="w-4 h-4" />
          문서 업로드
        </button>
      </div>

      {/* Mock notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
        🔧 [개발 모드] 파일은 브라우저 메모리에만 저장됩니다. 새로고침 시 파일 접근 불가.
        ENV_REQUIRED: Supabase Storage 또는 S3 설정 필요
      </div>

      {/* Upload panel */}
      {showUpload && (
        <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] p-6 space-y-4">
          <h3 className="font-black text-slate-900">문서 업로드</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">카테고리</label>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500"
              >
                {DOC_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">메모 (선택)</label>
              <input
                type="text"
                value={uploadMemo}
                onChange={(e) => setUploadMemo(e.target.value)}
                placeholder="간단한 설명..."
                className="w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            {uploading ? (
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600">클릭하여 파일 선택</p>
                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DOCX · 최대 20MB</p>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            onChange={handleFileSelect}
            className="hidden"
            aria-label="파일 업로드"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="파일명, 메모 검색..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border-2 border-slate-200 text-sm font-medium focus:outline-none focus:border-blue-500 bg-white"
          >
            <option value="">전체 카테고리</option>
            {DOC_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 space-y-3 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300" />
          <p className="text-slate-400 font-medium">
            {searchQuery || categoryFilter ? '검색 결과가 없습니다.' : '아직 업로드된 문서가 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="p-4 flex items-start gap-4 hover:bg-slate-50 transition-colors">
                <div className="shrink-0 mt-0.5">{getFileIcon(doc.mimeType)}</div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-slate-900 truncate">{doc.filename}</span>
                    <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full shrink-0">
                      {doc.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {documentService.formatFileSize(doc.fileSize)} · {new Date(doc.uploadedAt).toLocaleDateString('ko-KR')}
                  </p>

                  {editingMemo?.id === doc.id ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={editingMemo.value}
                        onChange={(e) => setEditingMemo({ ...editingMemo, value: e.target.value })}
                        className="flex-1 px-2 py-1 text-xs rounded-lg border border-blue-300 focus:outline-none"
                        autoFocus
                      />
                      <button onClick={handleSaveMemo} className="p-1 text-green-600 hover:bg-green-50 rounded-lg">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => setEditingMemo(null)} className="p-1 text-red-600 hover:bg-red-50 rounded-lg">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      {doc.memo && (
                        <p className="text-xs text-slate-500 italic truncate">{doc.memo}</p>
                      )}
                      <button
                        onClick={() => setEditingMemo({ id: doc.id, value: doc.memo || '' })}
                        className="text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                        title="메모 수정"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDelete(doc.id, doc.filename)}
                  className="shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-5 py-3 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
};
