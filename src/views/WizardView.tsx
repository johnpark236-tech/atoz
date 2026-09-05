import React, { useState } from 'react';
import { Project, ProjectProfile, Task } from '../types';
import { generateTasksForProfile } from '../services/ruleEngine';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Users,
  Store,
  Compass,
  FileCheck,
  Briefcase,
  Globe,
  Layers,
} from 'lucide-react';

interface WizardViewProps {
  onComplete: (newProject: Project) => void;
  onCancel: () => void;
}

const BUSINESS_TYPE_OPTIONS = [
  '실물 제품',
  '교육 교구',
  '디지털 콘텐츠 (전자책, 템플릿)',
  '온라인 강의 / 교육',
  '소프트웨어 / SaaS / 웹서비스',
  '모바일 앱',
  '핸드메이드 / 공예',
  '식품',
  '화장품',
  '캐릭터 / 디자인 굿즈',
  '문구/완구',
  '지식서비스 / 컨설팅',
];

const TARGET_CUSTOMER_OPTIONS = [
  '일반 소비자 B2C',
  '기업 B2B',
  '학교/교육기관',
  '정부/공공기관',
];

const SALES_CHANNEL_OPTIONS = [
  '네이버 스마트스토어',
  '쿠팡',
  '자사몰 (카페24/아임웹)',
  '크라우드펀딩 (와디즈/텀블벅)',
  '오프라인 매장',
  '앱스토어 (Google/Apple)',
  '학교/기관 납품 (S2B 학교장터)',
  '나라장터 (조달청 G2B)',
];

const STAGE_OPTIONS = [
  '아이디어 단계',
  '기획서 작성 중',
  '시장조사 중',
  '시제품 제작 중',
  '제품 완성',
  '이미 판매 중',
];

const CORPORATE_OPTIONS = [
  '없음 (예비창업자)',
  '개인사업자 (간이과세자 예정/보유)',
  '개인사업자 (일반과세자 예정/보유)',
  '법인사업자',
];

const STAFFING_OPTIONS = [
  '혼자 (1인 창업)',
  '외주만 사용',
  '아르바이트 고용 예정',
  '직원 있음',
];

const OVERSEAS_OPTIONS = ['없음 (국내 전용)', '검토 중', '있음 (글로벌 판매)'];

export const WizardView: React.FC<WizardViewProps> = ({
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [businessTypes, setBusinessTypes] = useState<string[]>(['실물 제품']);
  const [targetCustomers, setTargetCustomers] = useState<string[]>([
    '일반 소비자 B2C',
  ]);
  const [salesChannels, setSalesChannels] = useState<string[]>([
    '네이버 스마트스토어',
  ]);
  const [stage, setStage] = useState('아이디어 단계');
  const [corporateStatus, setCorporateStatus] = useState('없음 (예비창업자)');
  const [staffing, setStaffing] = useState('혼자 (1인 창업)');
  const [hasOverseasSales, setHasOverseasSales] = useState('검토 중');

  // Multi-select toggle helper
  const toggleSelection = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    if (list.includes(value)) {
      if (list.length > 1) {
        setList(list.filter((item) => item !== value));
      }
    } else {
      setList([...list, value]);
    }
  };

  // Submission
  const handleGenerateRoadmap = () => {
    const profile: ProjectProfile = {
      businessTypes,
      targetCustomers,
      salesChannels,
      stage,
      corporateStatus,
      staffing,
      hasOverseasSales,
    };

    const tasks = generateTasksForProfile(profile);

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: projectTitle.trim() || '내 새로운 사업 프로젝트',
      description:
        projectDesc.trim() ||
        `${businessTypes.join(', ')} 분야의 신규 사업화 프로젝트`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile,
      tasks,
      sales: [],
      documents: [],
    };

    onComplete(newProject);
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      {/* Wizard Card Container */}
      <div className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-10 space-y-8">
        {/* Wizard Header */}
        <div className="border-b border-slate-200 pb-6">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>동적 Rule 엔진 기반 사업화 위저드</span>
            </span>
            <span className="text-xs text-slate-500 font-mono font-black">
              Step {step} / {totalSteps}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            맞춤형 A to Z 사업화 로드맵 생성
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            아이템 특성에 따라 필요한 법정 인허가, KC인증, 상표권, 정산 시스템이 자동으로 구성됩니다.
          </p>

          {/* Progress step dots */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full mt-5 overflow-hidden border border-slate-200/60">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {/* STEP 1: Basic Info & Business Type */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="space-y-3">
                <label className="block text-sm font-black text-slate-900">
                  1. 사업 프로젝트명 및 핵심 아이디어
                </label>
                <input
                  type="text"
                  placeholder="예: 훈민정음 한글 원목 주사위 교구, AI 회의록 SaaS..."
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden"
                />
                <textarea
                  rows={2}
                  placeholder="어떤 문제를 해결하고 무엇을 판매하려 하는지 간단히 적어보세요."
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-700 focus:bg-white focus:border-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="space-y-2.5 pt-2">
                <label className="block text-sm font-black text-slate-900">
                  무엇을 만들고 판매할 것인가요? (복수 선택 가능)
                </label>
                <p className="text-xs text-slate-500 font-bold">
                  선택한 품목에 따라 KC인증, 영업신고, 책임판매업 등 법정 필수 태스크가 자동 연동됩니다.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {BUSINESS_TYPE_OPTIONS.map((opt) => {
                    const isSelected = businessTypes.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          toggleSelection(businessTypes, setBusinessTypes, opt)
                        }
                        className={`p-3.5 text-left rounded-2xl border text-xs font-black transition-all ${
                          isSelected
                            ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] scale-[1.02]'
                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Target Customers */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-black text-slate-900">
                  2. 주 고객은 누구인가요? (복수 선택 가능)
                </label>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  학교나 공공기관이 포함되면 조달청 나라장터 및 학교장터 S2B 입점 절차가 자동 추가됩니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {TARGET_CUSTOMER_OPTIONS.map((opt) => {
                  const isSelected = targetCustomers.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        toggleSelection(targetCustomers, setTargetCustomers, opt)
                      }
                      className={`p-4 text-left rounded-2xl border text-sm font-black transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Sales Channels */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-black text-slate-900">
                  3. 어디서 판매할 계획인가요? (복수 선택 가능)
                </label>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  스마트스토어 구매안전서비스 확인증, 통신판매업 신고, PG사 연동 등 채널별 필수 절차가 생성됩니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {SALES_CHANNEL_OPTIONS.map((opt) => {
                  const isSelected = salesChannels.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() =>
                        toggleSelection(salesChannels, setSalesChannels, opt)
                      }
                      className={`p-4 text-left rounded-2xl border text-xs font-black transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Current Stage */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-black text-slate-900">
                  4. 현재 사업 준비 단계는 어디인가요?
                </label>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  진행 단계에 맞춰 첫날 바로 실행해야 할 '오늘 해야 할 일'을 맞춤 우선순위로 지정합니다.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {STAGE_OPTIONS.map((opt) => {
                  const isSelected = stage === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStage(opt)}
                      className={`w-full p-4 text-left rounded-2xl border text-sm font-black transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: Corporate & Tax Status */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-black text-slate-900">
                  5. 사업자등록 상태는 어떻게 되나요?
                </label>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  예비창업자에게는 홈택스 사업자등록 및 업종코드 선택 가이드가 우선 배정됩니다.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {CORPORATE_OPTIONS.map((opt) => {
                  const isSelected = corporateStatus === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCorporateStatus(opt)}
                      className={`w-full p-4 text-left rounded-2xl border text-sm font-black transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Staffing */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-black text-slate-900">
                  6. 팀 구성 및 고용 계획이 있나요?
                </label>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  직원/아르바이트 고용 시 4대 보험 가입, 표준근로계약서, 원천세 납부 태스크가 추가됩니다.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {STAFFING_OPTIONS.map((opt) => {
                  const isSelected = staffing === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setStaffing(opt)}
                      className={`w-full p-4 text-left rounded-2xl border text-sm font-black transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: Overseas Sales */}
          {step === 7 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div>
                <label className="block text-sm font-black text-slate-900">
                  7. 해외 수출 및 글로벌 판매 계획이 있나요?
                </label>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  해외 판매 시 마드리드 국제상표, 관세청 영세율 부가세 환급 태스크가 연동됩니다.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {OVERSEAS_OPTIONS.map((opt) => {
                  const isSelected = hasOverseasSales === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setHasOverseasSales(opt)}
                      className={`w-full p-4 text-left rounded-2xl border text-sm font-black transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-2 border-slate-900 bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                          : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                    </button>
                  );
                })}
              </div>

              {/* Ready summary banner */}
              <div className="mt-6 p-5 rounded-[24px] bg-blue-50 border-2 border-blue-200 text-blue-950 space-y-1.5 shadow-xs">
                <div className="flex items-center space-x-2 font-black text-xs text-blue-900">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>맞춤형 사업화 로드맵 준비 완료!</span>
                </div>
                <p className="text-xs text-blue-800 font-bold">
                  입력하신 조건(업종 {businessTypes.length}개, 채널 {salesChannels.length}개)에 따라 규칙 기반 엔진이 최적의 사업화 태스크를 조합합니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Controls */}
        <div className="border-t border-slate-200 pt-6 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="inline-flex items-center space-x-1 px-5 py-2.5 rounded-full text-xs font-black text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>이전</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors"
              >
                취소
              </button>
            )}
          </div>

          <div>
            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full text-xs font-black bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:scale-105 active:scale-95"
              >
                <span>다음 단계</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGenerateRoadmap}
                className="inline-flex items-center space-x-2 px-7 py-3 rounded-full text-xs font-black bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>맞춤형 로드맵 생성하고 시작하기</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
