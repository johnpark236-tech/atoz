import React, { useState } from 'react';
import { OFFICIAL_ORGANIZATIONS } from '../data/organizations';
import {
  Building2,
  ExternalLink,
  Search,
  CheckCircle2,
  Shield,
  FileText,
  Bookmark,
} from 'lucide-react';

export const OrganizationsView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['전체', '지식재산', '사업자/세금', '판매', '인증', '지원사업'];

  const filteredOrgs = OFFICIAL_ORGANIZATIONS.filter((org) => {
    if (selectedCategory !== '전체' && org.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = org.name.toLowerCase().includes(q);
      const matchPurpose = org.purpose.toLowerCase().includes(q);
      const matchTask = org.keyTasks.some((t) => t.toLowerCase().includes(q));
      return matchName || matchPurpose || matchTask;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-[32px] border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>GOVERNMENT &amp; OFFICIAL DIRECTORY</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          정부기관, 인증원, 오픈마켓 공식 포털
        </h2>
        <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
          사기성 민간 대행 사이트나 피싱 사이트를 피하고, 정부 공식 기관에서 수수료 없이 직접 신청하세요.
        </p>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-6 border-t border-slate-100 mt-6">
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="기관명 또는 업무 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900"
            />
          </div>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrgs.map((org) => (
          <div
            key={org.id}
            className="bg-white rounded-[28px] border border-slate-200 hover:border-slate-900 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all p-6 shadow-xs flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-black text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  {org.category}
                </span>
                {org.badge && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    {org.badge}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-black text-slate-900 tracking-tight leading-snug group-hover:text-blue-600 transition-colors">
                {org.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                {org.purpose}
              </p>

              {/* Key Tasks Bullet Points */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  주요 처리 업무
                </span>
                <ul className="space-y-1.5">
                  {org.keyTasks.map((task, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-slate-700 font-bold flex items-center space-x-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                      <span className="truncate">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Official Link Button */}
            <div className="pt-3 border-t border-slate-100">
              <a
                href={org.officialUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs font-black transition-all shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>공식 사이트 접속</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-300" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
