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
  RotateCcw,
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
      {/* Input Section Card */}
      <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <Compass className="w-3.5 h-3.5" /> GIS & Building Code Intelligence
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-3 tracking-tight">
              주소지 / 점포 입지 분석
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-bold mt-1 max-w-3xl">
              임대하려는 점포의 주소와 희망 업종을 입력하면 건축물대장 주용도, 인허가 적합성, 토지 용도지역, 반경별 경쟁점포 및 상권 스코어를 종합 분석합니다.
            </p>
          </div>
          <div className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl p-3 max-w-sm shrink-0">
            <strong className="text-slate-900 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> 공공데이터 연동
            </strong>
            <span className="block mt-1">
              국토교통부 건축HUB(건축물대장), 소진공 상가(상권)정보, VWorld 전자지도를 교차 분석합니다.
            </span>
          </div>
        </div>

        {/* Input Form */}
        <div className="mt-6 space-y-5">
          {/* Address Input */}
          <div>
            <label className="block text-xs font-black text-slate-800 mb-2">
              점포 주소 (도로명 또는 지번 주소) *
            </label>
            <div className="relative">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRunAnalysis();
                }}
                placeholder="예: 충남 천안시 동남구 신부동 451-1 또는 서울 강남구 역삼동 737"
                className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-4" />
            </div>

            {/* Quick Address Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-2.5">
              <span className="text-[11px] font-bold text-slate-400">추천 예시:</span>
              {SAMPLE_ADDRESSES.map((sample) => (
                <button
                  key={sample.address}
                  type="button"
                  onClick={() => {
                    setAddressInput(sample.address);
                    handleRunAnalysis(sample.address, radius);
                  }}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-colors"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Business Type & Radius Selectors */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Business Type */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-2">
                선택 업종 (또는 직접 입력)
              </label>
              <div className="space-y-2">
                <select
                  value={businessType}
                  onChange={(e) => {
                    setBusinessType(e.target.value);
                    if (e.target.value !== '직접 입력') setCustomBusinessType('');
                  }}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden"
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
                    className="w-full p-3 bg-slate-50 border border-blue-300 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-slate-900 focus:outline-hidden"
                  />
                )}
              </div>
            </div>

            {/* Radius Toggle */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-2">
                분석 반경
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 300, label: '300m (도보 4분)' },
                  { value: 500, label: '500m (기본권장)' },
                  { value: 1000, label: '1km (광역상권)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRadius(opt.value);
                      if (analysisResult) handleRunAnalysis(addressInput, opt.value);
                    }}
                    className={`p-3 rounded-2xl text-xs font-black transition-all border ${
                      radius === opt.value
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => handleRunAnalysis()}
              disabled={isLoading || !addressInput.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-900 text-white rounded-full text-sm font-black shadow-[3px_3px_0px_0px_rgba(16,185,129,1)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:hover:scale-100"
            >
              {isLoading ? (
                <Sparkles className="w-4 h-4 animate-pulse text-emerald-400" />
              ) : (
                <Search className="w-4 h-4 text-emerald-400" />
              )}
              {isLoading ? '건축물대장 및 상권 데이터 분석 중...' : '점포 입지 분석 시작'}
            </button>

            {analysisResult && (
              <button
                type="button"
                onClick={handleSaveToProject}
                disabled={isSaved}
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black border transition-all ${
                  isSaved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-800 border-slate-300 hover:border-slate-900'
                }`}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'}`} />
                {isSaved ? '프로젝트에 저장 완료' : '이 분석 결과 프로젝트에 저장'}
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </section>

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* 1. Overview Score & Verdict Card */}
          <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-200">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  {getVerdictBadge(analysisResult.aiAnalysis.verdict)}
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    데이터 커버리지: {analysisResult.score.dataCoverage}%
                  </span>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    업종: {analysisResult.businessType}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {analysisResult.aiAnalysis.oneLineVerdict}
                </h3>
              </div>

              {/* Big Score Dial */}
              <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-3xl p-4 sm:px-6 shrink-0">
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    입지 종합 스코어
                  </span>
                  <div className="flex items-baseline justify-center gap-1 mt-0.5">
                    <span className="text-4xl font-black text-slate-900">
                      {analysisResult.score.overallScore}
                    </span>
                    <span className="text-xs font-bold text-slate-400">/ 100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscores Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
              {Object.entries(analysisResult.score.breakdown).map(([key, dim]) => (
                <div key={key} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700">{dim.label}</span>
                    <span className="text-xs font-black text-blue-600">
                      {dim.score}/{dim.max}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-900 rounded-full"
                      style={{ width: `${(dim.score / dim.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 leading-tight">
                    {dim.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Map & Geographic Identification Card */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-5">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" /> 상권 지도 및 반경 레이더
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    반경 {analysisResult.radius}m
                  </span>
                </div>

                <LocationMap
                  centerLat={analysisResult.address.lat}
                  centerLng={analysisResult.address.lng}
                  addressTitle={analysisResult.address.roadAddress || analysisResult.inputAddress}
                  radius={analysisResult.radius}
                  competitors={analysisResult.commercialArea.competitors}
                />

                {/* Address Metadata Bar */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-700">
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block uppercase">도로명주소</span>
                    <span className="font-bold text-slate-900">{analysisResult.address.roadAddress}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block uppercase">지번주소</span>
                    <span className="font-bold text-slate-900">{analysisResult.address.jibunAddress}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block uppercase">좌표 (WGS84)</span>
                    <span className="font-bold text-slate-900">
                      {analysisResult.address.lat.toFixed(5)}, {analysisResult.address.lng.toFixed(5)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 block uppercase">PNU (고유번호)</span>
                    <span className="font-mono text-[11px] font-bold text-slate-900">{analysisResult.address.pnu}</span>
                  </div>
                </div>
              </section>

              {/* 3. Commercial Area Breakdown & Competitor List */}
              <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <Store className="w-5 h-5 text-emerald-600" /> 반경 {analysisResult.radius}m 상권 점포 분포
                    </h4>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      소상공인시장진흥공단 상가(상권)정보 기반
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase block">전체 점포수</span>
                      <strong className="text-lg font-black text-slate-900">
                        {analysisResult.commercialArea.totalStoreCount}개
                      </strong>
                    </div>
                    <div className="text-right pl-3 border-l border-slate-200">
                      <span className="text-[10px] font-black text-rose-500 uppercase block">동일 업종</span>
                      <strong className="text-lg font-black text-rose-600">
                        {analysisResult.commercialArea.sameCategoryCount}개
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Industry Breakdown Bars */}
                <div className="space-y-2.5">
                  <span className="text-xs font-black text-slate-800">업종 대분류별 비중</span>
                  <div className="space-y-2">
                    {analysisResult.commercialArea.categoryCounts.map((cat) => (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-700">{cat.category}</span>
                          <span className="text-slate-500">
                            {cat.count}개 ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${cat.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Competitor Stores Table */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">주변 주요 경쟁 및 유관 점포</span>
                    <span className="text-[11px] font-bold text-slate-400">거리순 정렬</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium text-slate-700">
                      <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">구분</th>
                          <th className="py-2.5 px-3">상호명</th>
                          <th className="py-2.5 px-3">업종 분류</th>
                          <th className="py-2.5 px-3">직선거리</th>
                          <th className="py-2.5 px-3">소재지</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {analysisResult.commercialArea.competitors.slice(0, 10).map((store) => (
                          <tr key={store.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2.5 px-3">
                              {store.isSameCategory ? (
                                <span className="inline-block w-2 h-2 rounded-full bg-rose-500" title="동일업종" />
                              ) : (
                                <span className="inline-block w-2 h-2 rounded-full bg-blue-400" title="유사/기타" />
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-slate-900">
                              {store.name} {store.branch && <span className="text-slate-400 text-[10px]">({store.branch})</span>}
                            </td>
                            <td className="py-2.5 px-3 text-slate-600">
                              {store.subCategory || store.midCategory}
                            </td>
                            <td className="py-2.5 px-3 font-bold text-blue-600">{store.distance}m</td>
                            <td className="py-2.5 px-3 text-slate-500 truncate max-w-44">
                              {store.roadAddress || store.address}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Building & Land Details + AI Evaluation */}
            <div className="space-y-6">
              {/* Building Register Card */}
              <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" /> 건축물대장 정보
                  </h4>
                  {getSuitabilityBadge(analysisResult.building.classification.suitabilityLevel)}
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">건물명</span>
                    <strong className="text-slate-900">{analysisResult.building.buildingName}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">건축물 주용도</span>
                    <strong className="text-blue-700">{analysisResult.building.mainPurpose}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">기타용도</span>
                    <span className="text-slate-800 truncate max-w-40">{analysisResult.building.etcPurpose}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">건축구조</span>
                    <span className="text-slate-800">{analysisResult.building.structure}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">규모</span>
                    <span className="text-slate-800">
                      지상 {analysisResult.building.grndFlrCnt || '-'}층 / 지하 {analysisResult.building.ugrndFlrCnt || '-'}층
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">연면적</span>
                    <span className="text-slate-800">
                      {analysisResult.building.totArea ? `${analysisResult.building.totArea.toLocaleString()} ㎡` : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">주차 / 승강기</span>
                    <span className="text-slate-800">
                      {analysisResult.building.parkingCnt || 0}대 / {analysisResult.building.rideUseElvtCnt || 0}대
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-bold">사용승인일</span>
                    <span className="text-slate-800">{analysisResult.building.useAprDay || '-'}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] font-bold text-blue-900">
                  <span className="block font-black text-blue-950 mb-0.5">📌 용도 적합성 판정 의견</span>
                  {analysisResult.building.classification.suitabilitySummary}
                </div>
              </section>

              {/* Land Use & Zoning Card */}
              <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-3">
                  <Layers className="w-4 h-4 text-emerald-600" /> 토지 / 용도지역·지구
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">용도지역</span>
                    <strong className="text-slate-900">{analysisResult.landUse.zoningArea}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500 font-bold">용도지구</span>
                    <span className="text-slate-800">{analysisResult.landUse.zoningDistrict}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-bold">지구단위계획</span>
                    <span className="text-slate-800">{String(analysisResult.landUse.districtPlan)}</span>
                  </div>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">행위제한 참고사항</span>
                  <ul className="space-y-1 text-[11px] font-medium text-slate-600 list-disc list-inside">
                    {analysisResult.landUse.restrictions.map((res, i) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* AI Comprehensive Analysis Card */}
              <section className="bg-slate-900 text-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] p-6 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <h4 className="text-sm font-black">AI 입지 종합 컨설팅</h4>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    {analysisResult.aiAnalysis.source}
                  </span>
                </div>

                {/* Pros */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 주요 장점 (Pros)
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 font-medium pl-2">
                    {analysisResult.aiAnalysis.pros.map((p, i) => (
                      <li key={i}>• {p}</li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div className="space-y-1.5">
                  <span className="text-xs font-black text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 위험 요인 및 주의점 (Risks)
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 font-medium pl-2">
                    {analysisResult.aiAnalysis.risks.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>

                {/* Pre-Lease Checklist */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-xs font-black text-blue-300 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> 임대차 계약 전 필수 점검 항목
                  </span>
                  <ul className="space-y-1 text-[11px] text-slate-300 font-medium pl-2">
                    {analysisResult.aiAnalysis.preLeaseChecklist.map((c, i) => (
                      <li key={i}>✓ {c}</li>
                    ))}
                  </ul>
                </div>

                {/* Legal Disclaimer Box */}
                <div className="p-3 bg-slate-800/80 rounded-2xl text-[10px] text-slate-400 font-medium leading-relaxed border border-slate-700">
                  ⚠️ {analysisResult.aiAnalysis.legalDisclaimer}
                </div>
              </section>
            </div>
          </div>

          {/* Phase 2 Data Availability Status Bar */}
          <section className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-3">
              Phase 2 빅데이터 연동 준비 현황 (공식 Open API 확장 영역)
            </h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Object.entries(analysisResult.phase2Metrics).map(([key, metric]) => (
                <div key={key} className="bg-white p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">{metric.label}</span>
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      미연결
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{metric.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Official Data Sources List */}
          <section className="bg-white border border-slate-200 rounded-3xl p-6 space-y-3 text-xs">
            <h4 className="font-black text-slate-900">공공데이터 출처 및 기준일시</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {analysisResult.sources.map((src, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                  <span className="text-[10px] font-black text-blue-600 block">{src.provider}</span>
                  <strong className="text-slate-900 block truncate">{src.dataset}</strong>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>{new Date(src.retrievedAt).toLocaleDateString()}</span>
                    <a
                      href={src.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
                    >
                      공식포털 <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Saved Analysis History for the Active Project */}
      {project.locationAnalyses && project.locationAnalyses.length > 0 && (
        <section className="bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-600" /> 저장된 점포 입지 분석 히스토리
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
