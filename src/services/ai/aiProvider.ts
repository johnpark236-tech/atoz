import { Project, Task } from '../../types';

export interface AiContext {
  project: Project;
  task?: Task | null;
  userQuery: string;
}

export interface AiResponse {
  reply: string;
  requiresExpertReview?: boolean;
  expertBadge?: string;
  suggestedActions?: string[];
}

export interface AiProvider {
  chat(context: AiContext): Promise<AiResponse>;
}

// Mock AI provider - returns structured mock responses
// ENV_REQUIRED: VITE_AI_BACKEND_URL for production (backend proxy, never expose keys in frontend)
export const mockAiProvider: AiProvider = {
  async chat(context: AiContext): Promise<AiResponse> {
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

    const { userQuery, task, project } = context;
    const q = userQuery.toLowerCase();

    // Detect sensitive topics requiring expert review
    const requiresExpert =
      q.includes('세금') || q.includes('세무') || q.includes('부가가치세') ||
      q.includes('종합소득세') || q.includes('법률') || q.includes('특허') ||
      q.includes('상표') || q.includes('kc') || q.includes('인증') ||
      q.includes('계약') || q.includes('소송');

    let badge = '';
    if (q.includes('세금') || q.includes('세무') || q.includes('부가') || q.includes('종합소득')) {
      badge = '세무사 확인 권장';
    } else if (q.includes('법률') || q.includes('계약') || q.includes('소송')) {
      badge = '법무사/변호사 확인 권장';
    } else if (q.includes('kc') || q.includes('인증')) {
      badge = '공인시험기관 확인 권장';
    } else if (q.includes('특허') || q.includes('상표')) {
      badge = '변리사 확인 권장';
    }

    const taskContext = task
      ? `\n\n현재 태스크: [${task.task_id}] ${task.task_name} (${task.category})`
      : '';

    const reply = buildMockReply(userQuery, task, project) + taskContext;

    return {
      reply,
      requiresExpertReview: requiresExpert,
      expertBadge: badge || undefined,
      suggestedActions: getSuggestedActions(q, task),
    };
  },
};

function buildMockReply(query: string, task?: Task | null, project?: Project): string {
  const q = query.toLowerCase();
  const projectTitle = project?.title || '현재 프로젝트';

  if (q.includes('kc') || q.includes('어린이') || q.includes('안전확인')) {
    return `**KC 안전확인 인증 절차 가이드** (${projectTitle})\n\n**1단계: 인증 유형 결정**\n어린이 제품은 KC 안전확인(자기선언) 또는 KC 안전기준 준수 대상을 먼저 파악해야 합니다.\n\n**2단계: 공인시험기관 의뢰**\n• KTL (한국산업기술시험원)\n• KTC (한국기계전기전자시험연구원)\n• KOTITI (한국섬유소재연구원)\n예상 비용: 50만~200만원 / 소요기간: 2~4주\n\n**3단계: 안전인증서 발급 및 신고**\n국가제품안전포털(safetykorea.go.kr)에 신고\n\n**주의사항**\n- 만 14세 미만 대상 제품은 어린이제품 안전특별법 적용\n- KC 마크 미표시 판매 시 과태료 최대 3,000만원\n- 쿠팡/스마트스토어: KC인증번호 입력 필수\n\n> 💡 공식 확인: 국가제품안전포털(safetykorea.go.kr)에서 제품별 안전기준을 반드시 확인하세요.`;
  }

  if (q.includes('상표') || q.includes('kipris')) {
    return `**상표 출원 실무 가이드** (${projectTitle})\n\n**1. KIPRIS 선행 상표 조사** (무료)\nkipris.or.kr → 상표검색 → 동일·유사 검색\n\n**2. 유사 판단 기준**\n• 호칭 유사 (발음이 비슷한 경우)\n• 외관 유사 (로고 디자인이 유사한 경우)\n• 관념 유사 (의미가 같은 경우)\n\n**3. 출원 절차**\n특허청 e-특허나라 → 상표출원 → 심사 (약 10~13개월)\n출원료: 62,000원/류 (온라인)\n\n**4. 분류 체계**\n• 28류: 완구, 스포츠용품\n• 16류: 종이, 문방구\n• 41류: 교육서비스\n\n> ⚠️ 변리사 상담 권장: 유사 상표 판단은 전문가 검토가 안전합니다.`;
  }

  if (q.includes('스마트스토어') || q.includes('구매안전') || q.includes('통신판매')) {
    return `**스마트스토어 통신판매업 신고 가이드** (${projectTitle})\n\n**1. 사업자등록 먼저**\nHometax 또는 세무서 방문 → 개인사업자등록\n\n**2. 통신판매업 신고**\n정부24.go.kr → 통신판매업 신고\n필요서류: 사업자등록증, 구매안전서비스 이용확인증\n신고비용: 없음 (등록면허세 제외)\n\n**3. 구매안전서비스 이용확인증**\n스마트스토어 → 판매자 정보 → 구매안전서비스 → 확인증 발급\n\n**4. 등록면허세**\n매년 1월 16일~1월 31일 자동납부\n시군구별 상이: 서울 40,500원 / 지방 18,000~27,000원\n\n**5. 주의사항**\n- 통신판매업 신고번호를 스마트스토어 판매자 정보에 등록해야 합니다\n- 미신고 시 과태료 최대 3,000만원`;
  }

  if (q.includes('세금') || q.includes('부가') || q.includes('세무')) {
    return `**1인 사업자 세무 기초 가이드** (${projectTitle})\n\n**부가가치세 (VAT)**\n• 과세사업자: 매출의 10% 별도 관리 필수\n• 일반과세자: 반기별 신고 (1월/7월)\n• 간이과세자: 연 1회 신고 (1월), 연매출 1억 400만원 미만\n\n**종합소득세**\n• 매년 5월 신고\n• 사업소득 = 매출 - 필요경비\n• 홈택스에서 신고 가능\n\n**절세 포인트**\n1. 사업 관련 지출 증빙 철저히 보관 (3년)\n2. 세금계산서, 현금영수증, 카드명세서\n3. 업무용 차량, 통신비, 광고비 경비처리\n\n> ⚠️ 세무사 상담 권장: 개별 상황에 따라 과세 여부가 달라집니다.`;
  }

  // Task-specific response
  if (task) {
    return `**[${task.task_name}] 상세 가이드**\n\n**해야 할 일**\n${task.step_by_step.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n**준비물**\n${task.required_documents.slice(0, 4).map((d) => `• ${d}`).join('\n')}\n\n**담당 기관**\n${task.organization} (${task.official_url})\n\n**예상 비용**: ${task.estimated_cost}\n**예상 기간**: ${task.estimated_days}\n\n**주의사항**\n${task.cautions}\n\n> 💡 현재 AI는 Mock 모드로 동작합니다. ENV_REQUIRED: 백엔드 AI API 연동 필요`;
  }

  // Generic response
  return `**${projectTitle}** 프로젝트에 대한 질문을 확인했습니다.\n\n"${query}"\n\n현재 AI는 개발 Mock 모드로 동작 중입니다. 실제 AI 연동 시 프로젝트 프로필, 현재 진행 태스크, 체크리스트 상태를 모두 컨텍스트로 포함하여 정확한 답변을 제공합니다.\n\n**ENV_REQUIRED**: 백엔드 AI API 엔드포인트 (VITE_AI_BACKEND_URL)\n\n현재 추천 질문:\n• KC 안전확인 인증 절차\n• 상표 출원 실무\n• 스마트스토어 통신판매업 신고\n• 부가가치세 절세 방법`;
}

function getSuggestedActions(query: string, task?: Task | null): string[] {
  const actions: string[] = [];
  if (task) {
    actions.push(`${task.task_name} 상태를 "준비중"으로 변경`);
    if (task.official_url) actions.push(`공식 사이트 확인: ${task.official_url}`);
  }
  if (query.includes('kc') || query.includes('인증')) {
    actions.push('KC인증 관련 Task 확인하기');
    actions.push('시험기관 견적 문의하기');
  }
  if (query.includes('상표') || query.includes('특허')) {
    actions.push('KIPRIS 선행검색 하기');
    actions.push('상표 출원 Task 진행하기');
  }
  return actions.slice(0, 3);
}

// Adapter skeleton for future backend API
// ENV_REQUIRED: VITE_AI_BACKEND_URL
export const backendAiProvider: AiProvider = {
  async chat(context: AiContext): Promise<AiResponse> {
    const backendUrl = (import.meta as any).env?.VITE_AI_BACKEND_URL;
    if (!backendUrl) {
      return mockAiProvider.chat(context);
    }
    const res = await fetch(`${backendUrl}/api/ai/consult`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: context.userQuery,
        task: context.task,
        projectContext: {
          title: context.project.title,
          profile: context.project.profile,
          taskCount: context.project.tasks.length,
          completedTasks: context.project.tasks.filter((t) => t.status === '완료').length,
        },
      }),
    });
    if (!res.ok) throw new Error('AI API 응답 실패');
    const data = await res.json();
    return {
      reply: data.reply || '답변을 불러오지 못했습니다.',
      requiresExpertReview: data.requiresExpertReview,
      expertBadge: data.expertBadge,
      suggestedActions: data.suggestedActions,
    };
  },
};

// Active provider
export const aiProvider: AiProvider = backendAiProvider;
