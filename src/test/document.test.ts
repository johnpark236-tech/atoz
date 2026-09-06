import { describe, it, expect, beforeEach } from 'vitest';
import { documentService, DOC_CATEGORIES } from '../services/documentService';

beforeEach(() => {
  localStorage.clear();
});

function createMockFile(name = 'test.pdf', type = 'application/pdf', size = 1024) {
  return new File(['content'], name, { type });
}

describe('Document Service', () => {
  it('DOC_CATEGORIES는 14개 이상', () => {
    expect(DOC_CATEGORIES.length).toBeGreaterThanOrEqual(14);
  });

  it('문서 업로드 후 목록에 포함', async () => {
    const file = createMockFile();
    const doc = await documentService.uploadDocument(file, {
      category: '사업자등록',
      userId: 'user-1',
    });

    expect(doc.id).toBeTruthy();
    expect(doc.filename).toBe('test.pdf');
    expect(doc.category).toBe('사업자등록');

    const docs = await documentService.getDocuments('user-1');
    expect(docs.some((d) => d.id === doc.id)).toBe(true);
  });

  it('문서 삭제 후 목록에서 제거', async () => {
    const file = createMockFile('delete-me.pdf');
    const doc = await documentService.uploadDocument(file, {
      category: '계약',
      userId: 'user-2',
    });

    await documentService.deleteDocument(doc.id);
    const docs = await documentService.getDocuments('user-2');
    expect(docs.some((d) => d.id === doc.id)).toBe(false);
  });

  it('메모 수정', async () => {
    const file = createMockFile('memo-test.pdf');
    const doc = await documentService.uploadDocument(file, {
      category: '세무',
      userId: 'user-3',
    });

    await documentService.updateMemo(doc.id, '세금 신고용 자료');
    const docs = await documentService.getDocuments('user-3');
    const updated = docs.find((d) => d.id === doc.id);
    expect(updated?.memo).toBe('세금 신고용 자료');
  });

  it('사용자별 문서 격리', async () => {
    const file1 = createMockFile('user1.pdf');
    const file2 = createMockFile('user2.pdf');
    await documentService.uploadDocument(file1, { category: '기타', userId: 'user-A' });
    await documentService.uploadDocument(file2, { category: '기타', userId: 'user-B' });

    const docsA = await documentService.getDocuments('user-A');
    const docsB = await documentService.getDocuments('user-B');
    expect(docsA.every((d) => d.userId === 'user-A')).toBe(true);
    expect(docsB.every((d) => d.userId === 'user-B')).toBe(true);
  });

  it('formatFileSize 정상 동작', () => {
    expect(documentService.formatFileSize(500)).toBe('500 B');
    expect(documentService.formatFileSize(1024)).toBe('1.0 KB');
    expect(documentService.formatFileSize(1024 * 1024)).toBe('1.0 MB');
  });
});
