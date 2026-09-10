import React, { useState } from 'react';
import { Project } from '../types';
import {
  LocationAnalysisResult,
  LocationAnalysisRecord,
  CommercialStore,
} from '../services/location/types';
import { LocationMap } from '../components/LocationMap';
import { saveSingleProject } from '../services/storage';
import {
  MapPin,
  Building2,
  Compass,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  Search,
  Bookmark,
  ExternalLink,
  ShieldAlert,
  Store,
  Layers,
  FileText,
  Clock,
  Trash2,
  Info,
  Check,
  Building,
  Navigation,
} from 'lucide-react';

interface LocationAnalysisViewProps {
  project: Project;
  onProjectUpdated?: (updated: Project) => void;
}

const BUSINESS_TYPE_PRESETS = [
  '카페 / 디저트',
  '한국어 학원 / 어학원',
  '일반음식점 / 식당',
  '보습학원 / 교습소',
  '미용실 / 네일샵',
  '편의점 / 무인소매점',
  '헬스 / 필라테스',
  '베이커리 / 제과점',
  '사무실 / 공유오피스',
  '의류 / 패션잡화',
];

const SAMPLE_ADDRESSES = [
  { label: '천안 신부동 상가', address: '충남 천안시 동남구 신부동 451-1' },
  { label: '천안 불당동 상가', address: '충남 천안시 서북구 불당동 1535' },
  { label: '서울 강남 역삼동', address: '서울 강남구 역삼동 737' },
  { label: '서울 마포 서교동', address: '서울 마포구 서교동 365-1' },
];

export const LocationAnalysisView: React.FC<LocationAnalysisViewProps> = ({
  project,
  onProjectUpdated,
}) => {
  const [addressInput, setAddressInput] = useState('');
  const [businessType, setBusinessType] = useState('카페 / 디저트');
  const [customBusinessType, setCustomBusinessType] = useState('');
  const [radius, setRadius] = useState<number>(500);

  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<LocationAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const activeBusinessType = customBusinessType.trim() || businessType;

  const handleRunAnalysis = async (targetAddress = addressInput, targetRadius = radius) => {
    if (!targetAddress.trim()) {
      setErrorMessage('분석할 점포 주소를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsSaved(false);

    try {
      // 1. Try backend proxy POST /api/location/analyze
      const response = await fetch('/api/location/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: targetAddress.trim(),
          businessType: activeBusinessType,
          radius: targetRadius,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as LocationAnalysisResult;
        setAnalysisResult(data);
        setIsLoading(false);
        return;
      }
      throw new Error(`Server returned ${response.status}`);
    } catch (apiErr) {
      console.warn('Backend proxy unavailable, running client-side location analysis service:', apiErr);

      // 2. Client-side fallback service execution
      try {
        const { analyzeLocation } = await import('../services/location/locationAnalysisService');
        const fallbackResult = await analyzeLocation(
          targetAddress.trim(),
          activeBusinessType,
          targetRadius
        );
        setAnalysisResult(fallbackResult);
      } catch (clientErr: any) {
        setErrorMessage(`주소지 분석 중 오류가 발생했습니다: ${clientErr?.message || '네트워크 오류'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToProject = () => {
    if (!analysisResult) return;

    const record: LocationAnalysisRecord = {
      ...analysisResult,
      id: analysisResult.analysisId,
      projectId: project.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existing = project.locationAnalyses || [];
    const updatedList = [record, ...existing.filter((a) => a.id !== record.id)];
    const updatedProject: Project = {
      ...project,
      locationAnalyses: updatedList,
      updatedAt: new Date().toISOString(),
    };

    saveSingleProject(updatedProject);
    if (onProjectUpdated) onProjectUpdated(updatedProject);
    setIsSaved(true);
  };

  const handleLoadSavedRecord = (record: LocationAnalysisRecord) => {
    setAddressInput(record.inputAddress);
    setBusinessType(record.businessType);
    setCustomBusinessType('');
    setRadius(record.radius);
    setAnalysisResult(record);
    setIsSaved(true);
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const handleDeleteSavedRecord = (recordId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const existing = project.locationAnalyses || [];
    const updatedList = existing.filter((a) => a.id !== recordId);
    const updatedProject: Project = {
      ...project,
      locationAnalyses: updatedList,
      updatedAt: new Date().toISOString(),
    };

    saveSingleProject(updatedProject);
    if (onProjectUpdated) onProjectUpdated(updatedProject);
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'GOOD':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 추천 입지 (GOOD)
          </span>
        );
      case 'CONDITIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-700 border border-blue-300">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> 조건부 추천 (CONDITIONAL)
          </span>
        );
      case 'CAUTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 인허가 주의 (CAUTION)
          </span>
        );
      case 'NOT_RECOMMENDED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-300">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> 비추천 (NOT RECOMMENDED)
          </span>
        );
    }
  };

  const getSuitabilityBadge = (level: string) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
            ✓ 용도 적합 (가능성 높음)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800">
            △ 기재변경/조건부 적합
          </span>
        );
      case 'REQUIRES_PERMIT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800">
            ✕ 용도변경/인허가 필요
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Input Section Card */}
      <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <Compass className="w-3.5 h-3.5" /> GIS & Building BigData
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
              점포·상권 분석
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-bold mt-1.5 max-w-3xl leading-relaxed">
              창업 예정지의 주소를 입력하면 VWorld·건축물대장·상가(상권) 공공데이터를 이용해 건물용도와 주변 상권을 실데이터로 분석합니다.
            </p>
          </div>
          <div className="flex flex-wrap md:flex-col gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-2xl p-3 shrink-0">
            <span className="text-slate-900 font-black flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> 공공데이터 실시간 연동
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> VWorld 전자지도 (PNU/좌표)
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> 국토교통부 건축HUB (건축물대장)
            </span>
            <span className="inline-flex items-center gap-1 text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> 소상공인시장진흥공단 (상권정보)
            </span>
          </div>
        </div>

        {/* Big Address Input Bar */}
        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-900 mb-2">
              점포 주소 입력 (도로명 또는 지번 주소) *
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRunAnalysis();
                  }}
                  placeholder="예: 충청남도 천안시 동남구 신부동 462-1 또는 서울 강남구 역삼동 737"
                  className="w-full pl-11 pr-4 py-4 min-h-[52px] bg-slate-50 border-2 border-slate-300 rounded-2xl text-sm sm:text-base font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden transition-colors"
                />
                <MapPin className="w-5 h-5 text-emerald-600 absolute left-3.5 top-4" />
              </div>

              <button
                type="button"
                onClick={() => handleRunAnalysis()}
                disabled={isLoading || !addressInput.trim()}
                className="min-h-[52px] px-8 py-4 bg-slate-900 text-white rounded-2xl text-sm sm:text-base font-black shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 whitespace-nowrap inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <Sparkles className="w-5 h-5 animate-pulse text-emerald-400" />
                ) : (
                  <Search className="w-5 h-5 text-emerald-400" />
                )}
                <span>{isLoading ? '실데이터 분석 중...' : '주소 분석하기'}</span>
              </button>
            </div>

            {/* Quick Address Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-[11px] font-black text-slate-400">추천 빠른조회:</span>
              {SAMPLE_ADDRESSES.map((sample) => (
                <button
                  key={sample.address}
                  type="button"
                  onClick={() => {
                    setAddressInput(sample.address);
                    handleRunAnalysis(sample.address, radius);
                  }}
                  className="min-h-[32px] text-[11px] font-bold px-3 py-1.5 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Analysis Radius & Business Type Options */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
            {/* Radius Selector */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 block">분석 반경</span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 300, label: '300m', desc: '도보 4분' },
                  { value: 500, label: '500m', desc: '기본권장' },
                  { value: 1000, label: '1km', desc: '광역상권' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRadius(opt.value);
                      if (analysisResult) handleRunAnalysis(addressInput, opt.value);
                    }}
                    className={`min-h-[46px] p-2.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 border cursor-pointer ${
                      radius === opt.value
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-white'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                        radius === opt.value ? 'border-white bg-white' : 'border-slate-400 bg-white'
                      }`}
                    >
                      {radius === opt.value && <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                    </span>
                    <span>
                      {opt.label} <span className="text-[10px] font-normal opacity-70">({opt.desc})</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Business Type Selector */}
            <div className="space-y-2">
              <span className="text-xs font-black text-slate-900 block">희망 업종 선택</span>
              <div className="space-y-2">
                <select
                  value={businessType}
                  onChange={(e) => {
                    setBusinessType(e.target.value);
                    if (e.target.value !== '직접 입력') setCustomBusinessType('');
                  }}
                  className="w-full min-h-[46px] p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden"
                >
                  {BUSINESS_TYPE_PRESETS.map((preset) => (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  ))}
                  <option value="직접 입력">+ 직접 입력하기</option>
                </select>

                {(businessType === '직접 입력' || customBusinessType) && (
                  <input
                    type="text"
                    value={customBusinessType}
                    onChange={(e) => setCustomBusinessType(e.target.value)}
                    placeholder="희망 업종 직접 입력 (예: 애견 미용샵, 무인 스튜디오)"
                    className="w-full min-h-[44px] p-3 bg-slate-50 border border-blue-300 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden"
                  />
                )}
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </section>

      {/* Analysis Results Display: Exact Decision-Making Order */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Floating Action: Save Result */}
          <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-slate-900 shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]">
            <div className="flex items-center gap-2 text-xs font-black text-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>{analysisResult.address.roadAddress || analysisResult.inputAddress}</strong> 분석 완료
              </span>
            </div>
            <button
              type="button"
              onClick={handleSaveToProject}
              disabled={isSaved}
              className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black border transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'text-emerald-600 fill-emerald-600' : 'text-blue-400'}`} />
              <span>{isSaved ? '프로젝트에 저장 완료' : '이 분석 결과 프로젝트에 저장'}</span>
            </button>
          </div>

          {/* 1. 주소 확인 (Address Confirmation) */}
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-blue-600" /> 주소 확인
                </h3>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                VWorld 실데이터
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">도로명주소</span>
                <strong className="text-slate-900 text-sm block mt-1">
                  {analysisResult.address.roadAddress || '-'}
                </strong>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">지번주소</span>
                <strong className="text-slate-900 text-sm block mt-1">
                  {analysisResult.address.jibunAddress || '-'}
                </strong>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">좌표 (WGS84)</span>
                <strong className="text-slate-900 text-sm block mt-1 font-mono">
                  {analysisResult.address.lat.toFixed(6)}, {analysisResult.address.lng.toFixed(6)}
                </strong>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">PNU (고유번호)</span>
                <strong className="text-slate-900 text-sm block mt-1 font-mono tracking-tight">
                  {analysisResult.address.pnu}
                </strong>
              </div>
            </div>
          </section>

          {/* 2 & 3. 건물 기본정보 & 건물 주용도 (Building Basic Info & Main Purpose) */}
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" /> 건물 기본정보 및 주용도
                </h3>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                국토교통부 건축물대장
              </span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-blue-600 block uppercase">건물명</span>
                <strong className="text-slate-900 text-base block mt-1">
                  {analysisResult.building.buildingName}
                </strong>
              </div>
              <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-blue-600 block uppercase">3. 건축물 주용도</span>
                <strong className="text-blue-700 text-base block mt-1">
                  {analysisResult.building.mainPurpose}
                </strong>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">기타용도</span>
                <span className="text-slate-800 font-bold block mt-1 truncate">
                  {analysisResult.building.etcPurpose || '-'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">건축구조</span>
                <span className="text-slate-800 font-bold block mt-1">
                  {analysisResult.building.structure || '-'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">층수 규모</span>
                <span className="text-slate-800 font-bold block mt-1">
                  지상 {analysisResult.building.grndFlrCnt ?? '-'}층 / 지하 {analysisResult.building.ugrndFlrCnt ?? '-'}층
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">연면적</span>
                <span className="text-slate-800 font-bold block mt-1">
                  {analysisResult.building.totArea ? `${analysisResult.building.totArea.toLocaleString()} ㎡` : '-'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">주차 / 승강기</span>
                <span className="text-slate-800 font-bold block mt-1">
                  {analysisResult.building.parkingCnt !== null ? `${analysisResult.building.parkingCnt}대` : '-'} /{' '}
                  {analysisResult.building.rideUseElvtCnt !== null ? `${analysisResult.building.rideUseElvtCnt}대` : '-'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <span className="text-[10px] font-black text-slate-400 block uppercase">사용승인일</span>
                <span className="text-slate-800 font-bold block mt-1 font-mono">
                  {analysisResult.building.useAprDay || '-'}
                </span>
              </div>
            </div>
          </section>

          {/* 4. 해당 업종 사용 적합성 (Operational Suitability) */}
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center">
                  4
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 해당 업종 운영 적합성 분석
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500">
                  선택 업종: <strong className="text-slate-900">{analysisResult.businessType}</strong>
                </span>
                {getSuitabilityBadge(analysisResult.building.classification.suitabilityLevel)}
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
              <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-700" /> 건축물 용도 적합성 판정 의견
              </span>
              <p className="text-xs sm:text-sm font-bold text-emerald-900 leading-relaxed">
                {analysisResult.building.classification.suitabilitySummary}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-black text-slate-800 block">임대 전 필수 행정·인허가 사전 확인사항</span>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
                {analysisResult.building.classification.recommendedChecks.map((check, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{check}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 5. 반경 내 전체 점포 (Total Stores in Radius) */}
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-800 font-black text-xs flex items-center justify-center">
                  5
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-indigo-600" /> 반경 {analysisResult.radius}m 전체 점포 분포
                </h3>
              </div>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                소상공인시장진흥공단 상가(상권)정보
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center sm:text-left">
                <span className="text-[10px] font-black text-slate-400 block uppercase">반경 내 전체 실점포수</span>
                <strong className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">
                  {analysisResult.commercialArea.totalStoreCount.toLocaleString()}개
                </strong>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center sm:text-left">
                <span className="text-[10px] font-black text-slate-400 block uppercase">상권 점포 밀집도</span>
                <strong className="text-2xl sm:text-3xl font-black text-blue-600 block mt-1">
                  {analysisResult.commercialArea.densityLevel}
                </strong>
                <span className="text-[11px] font-bold text-slate-500 block mt-1">
                  {analysisResult.commercialArea.densityDescription}
                </span>
              </div>
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-center sm:text-left">
                <span className="text-[10px] font-black text-rose-500 block uppercase">동일/유사업종 점포수</span>
                <strong className="text-2xl sm:text-3xl font-black text-rose-600 block mt-1">
                  {analysisResult.commercialArea.sameCategoryCount}개
                </strong>
                <span className="text-[11px] font-bold text-rose-700 block mt-1">
                  유사 업종 {analysisResult.commercialArea.similarCategoryCount}개 포함
                </span>
              </div>
            </div>

            {/* Category Breakdown Bars */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-black text-slate-800 block">업종 대분류별 점포 비중</span>
              <div className="grid sm:grid-cols-2 gap-3">
                {analysisResult.commercialArea.categoryCounts.map((cat) => (
                  <div key={cat.category} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-800">{cat.category}</span>
                      <span className="text-slate-600 font-mono">
                        {cat.count}개 ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: `${cat.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 6. 동일/유사업종 경쟁점포 (Competitor Stores) */}
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-800 font-black text-xs flex items-center justify-center">
                  6
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Store className="w-4 h-4 text-rose-600" /> 동일 / 유사업종 경쟁점포 목록
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">거리순 정렬</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium text-slate-700">
                <thead className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">구분</th>
                    <th className="py-3 px-3">상호명</th>
                    <th className="py-3 px-3">업종 분류</th>
                    <th className="py-3 px-3">직선거리</th>
                    <th className="py-3 px-3">소재지</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {analysisResult.commercialArea.competitors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-400 font-bold">
                        반경 내 조회된 경쟁 점포가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    analysisResult.commercialArea.competitors.slice(0, 15).map((store) => (
                      <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3">
                          {store.isSameCategory ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              동일업종
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                              유사업종
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {store.name} {store.branch && <span className="text-slate-400 text-[10px]">({store.branch})</span>}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {store.subCategory || store.midCategory}
                        </td>
                        <td className="py-3 px-3 font-bold text-blue-600 font-mono">{store.distance}m</td>
                        <td className="py-3 px-3 text-slate-500 truncate max-w-52">
                          {store.roadAddress || store.address}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 7. 지도 (Interactive Map) */}
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                  7
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-600" /> 상권 지도 및 반경 레이더
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500">
                반경 {analysisResult.radius}m ({analysisResult.commercialArea.competitors.length}개 점포 표시)
              </span>
            </div>

            <LocationMap
              centerLat={analysisResult.address.lat}
              centerLng={analysisResult.address.lng}
              addressTitle={analysisResult.address.roadAddress || analysisResult.inputAddress}
              radius={analysisResult.radius}
              competitors={analysisResult.commercialArea.competitors}
            />
          </section>

          {/* 8. 상권 요약 (Commercial Area Summary & Scores) */}
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 font-black text-xs flex items-center justify-center">
                  8
                </div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> 상권 종합 요약 및 스코어
                </h3>
              </div>
              <div className="flex items-center gap-3">
                {getVerdictBadge(analysisResult.aiAnalysis.verdict)}
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  데이터 커버리지: {analysisResult.score.dataCoverage}%
                </span>
              </div>
            </div>

            {/* Big Score Dial */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50 border border-slate-200 rounded-3xl p-6">
              <div>
                <span className="text-xs font-black text-slate-500 block uppercase">
                  종합 입지 적합도 평가
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {analysisResult.aiAnalysis.oneLineVerdict}
                </h4>
              </div>

              <div className="text-center sm:text-right shrink-0">
                <span className="text-[10px] font-black uppercase text-slate-400 block">종합 스코어</span>
                <div className="flex items-baseline justify-center sm:justify-end gap-1 mt-0.5">
                  <span className="text-4xl sm:text-5xl font-black text-slate-900">
                    {analysisResult.score.overallScore}
                  </span>
                  <span className="text-sm font-bold text-slate-400">/ 100</span>
                </div>
              </div>
            </div>

            {/* 5-Dimension Score Bars */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {Object.entries(analysisResult.score.breakdown).map(([key, dim]) => (
                <div key={key} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800">{dim.label}</span>
                    <span className="text-xs font-black text-blue-600 font-mono">
                      {dim.score}/{dim.max}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 rounded-full" style={{ width: `${(dim.score / dim.max) * 100}%` }} />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 leading-tight">
                    {dim.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 9. AI 입지 의견 (AI Location Evaluation) */}
          <section className="bg-slate-900 text-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                  9
                </div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" /> AI 입지 종합 의견
                </h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {analysisResult.aiAnalysis.source}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Pros */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
                <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 주요 강점 (Pros)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 font-medium pl-1">
                  {analysisResult.aiAnalysis.pros.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
                <span className="text-xs font-black text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> 위험 요인 및 주의점 (Risks)
                </span>
                <ul className="space-y-1.5 text-xs text-slate-300 font-medium pl-1">
                  {analysisResult.aiAnalysis.risks.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Pre-Lease Checklist */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-2">
              <span className="text-xs font-black text-blue-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-400" /> 임대차 계약 전 필수 점검 항목
              </span>
              <ul className="grid sm:grid-cols-2 gap-2 text-xs text-slate-300 font-medium">
                {analysisResult.aiAnalysis.preLeaseChecklist.map((c, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 10. 주의사항 (Precautions & Legal Disclaimers) */}
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
              <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">
                10
              </div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> 법적 주의사항 및 데이터 출처
              </h3>
            </div>

            {/* Legal Disclaimer Box */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-xs font-medium text-amber-900 leading-relaxed space-y-1">
              <span className="font-black flex items-center gap-1 text-amber-950">
                <ShieldAlert className="w-4 h-4 text-amber-700" /> 법적 효력 면책 공고
              </span>
              <p>{analysisResult.aiAnalysis.legalDisclaimer}</p>
            </div>

            {/* Land Use Restrictions */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2 text-xs">
              <span className="font-black text-slate-900 flex items-center gap-1">
                <Layers className="w-4 h-4 text-emerald-600" /> 토지 용도지역 및 행위제한
              </span>
              <div className="flex flex-wrap gap-4 text-slate-700">
                <span>용도지역: <strong>{analysisResult.landUse.zoningArea}</strong></span>
                <span>용도지구: <strong>{analysisResult.landUse.zoningDistrict}</strong></span>
                <span>지구단위계획: <strong>{String(analysisResult.landUse.districtPlan)}</strong></span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 pt-1">
                {analysisResult.landUse.restrictions.map((res, i) => (
                  <li key={i}>{res}</li>
                ))}
              </ul>
            </div>

            {/* Official Data Sources Matrix */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-black text-slate-900 block">공공데이터 출처 및 기준일자</span>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {analysisResult.sources.map((src, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
                    <span className="text-[10px] font-black text-blue-600 block">{src.provider}</span>
                    <strong className="text-slate-900 block truncate">{src.dataset}</strong>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>{new Date(src.retrievedAt).toLocaleDateString()}</span>
                      <a
                        href={src.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-0.5 font-bold"
                      >
                        공식포털 <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Saved Analysis History for the Active Project */}
      {project.locationAnalyses && project.locationAnalyses.length > 0 && (
        <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-600" /> 저장된 점포·상권 분석 히스토리
            </h3>
            <span className="text-xs font-bold text-slate-500">
              총 {project.locationAnalyses.length}개 저장됨 (클라우드 동기화)
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.locationAnalyses.map((rec) => (
              <div
                key={rec.id}
                onClick={() => handleLoadSavedRecord(rec)}
                className="group cursor-pointer p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-900 hover:shadow-md transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    {rec.businessType}
                  </span>
                  <button
                    onClick={(e) => handleDeleteSavedRecord(rec.id, e)}
                    className="text-slate-400 hover:text-rose-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="저장 내역 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-sm font-black text-slate-900 truncate">{rec.inputAddress}</p>

                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>점수: {rec.score.overallScore}/100</span>
                  <span>반경 {rec.radius}m</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(rec.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-blue-600 font-bold group-hover:underline">불러오기 →</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
