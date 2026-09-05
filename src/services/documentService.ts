// Document Vault Service
// ENV_REQUIRED: Supabase Storage / S3 for actual file upload
// Currently stores only metadata in localStorage (mock)

const DOCS_KEY = 'bizflow_documents_v1';

export interface DocumentMeta {
  id: string;
  userId?: string;
  projectId?: string;
  category: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  storagePath: string; // MOCK: local object URL or placeholder
  memo?: string;
  taskIds: string[];
  uploadedAt: string;
  updatedAt: string;
}

export const DOC_CATEGORIES = [
  '사업자등록',
  '통신판매업',
  '상표',
  '특허',
  '저작권',
  '디자인권',
  'KC/인증',
  '시험성적서',
  '제조',
  '계약',
  '견적',
  '세무',
  '정산',
  '기타',
];

function getStoredDocs(): DocumentMeta[] {
  try {
    const raw = localStorage.getItem(DOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredDocs(docs: DocumentMeta[]): void {
  try {
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs));
  } catch {}
}

export const documentService = {
  async getDocuments(userId?: string, projectId?: string): Promise<DocumentMeta[]> {
    let docs = getStoredDocs();
    if (userId) docs = docs.filter((d) => d.userId === userId);
    if (projectId) docs = docs.filter((d) => d.projectId === projectId);
    return docs.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt));
  },

  async uploadDocument(
    file: File,
    meta: { category: string; projectId?: string; userId?: string; memo?: string; taskIds?: string[] }
  ): Promise<DocumentMeta> {
    // MOCK: create object URL (lost on page refresh)
    // ENV_REQUIRED: Supabase Storage bucket or S3 for persistence
    const objectUrl = URL.createObjectURL(file);
    const doc: DocumentMeta = {
      id: `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: meta.userId,
      projectId: meta.projectId,
      category: meta.category,
      filename: file.name,
      mimeType: file.type,
      fileSize: file.size,
      storagePath: objectUrl, // MOCK - not persistent
      memo: meta.memo || '',
      taskIds: meta.taskIds || [],
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docs = getStoredDocs();
    docs.unshift(doc);
    saveStoredDocs(docs);
    return doc;
  },

  async deleteDocument(docId: string): Promise<void> {
    const docs = getStoredDocs().filter((d) => d.id !== docId);
    saveStoredDocs(docs);
  },

  async updateMemo(docId: string, memo: string): Promise<void> {
    const docs = getStoredDocs();
    const idx = docs.findIndex((d) => d.id === docId);
    if (idx >= 0) {
      docs[idx] = { ...docs[idx], memo, updatedAt: new Date().toISOString() };
      saveStoredDocs(docs);
    }
  },

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  },
};
