import React, { useState, useMemo } from 'react';
import { Task, TaskStatus } from '../types';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Coins,
  ExternalLink,
  ChevronDown,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface RoadmapViewProps {
  tasks: Task[];
  initialCategory?: string | null;
  onOpenTaskModal: (task: Task) => void;
  onQuickUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

const CATEGORIES = [
  { id: 'all', label: '전체 보기' },
  { id: '01_아이디어', label: '1. 아이디어/기획' },
  { id: '02_지식재산', label: '2. 지식재산(IP)' },
  { id: '03_인증인허가', label: '3. 인증/인허가' },
  { id: '04_제조시제품', label: '4. 제조/시제품' },
  { id: '05_사업자세무', label: '5. 사업자/행정' },
  { id: '06_판매준비', label: '6. 판매준비' },
  { id: '07_주문배송', label: '7. 주문/배송' },
  { id: '08_정산입금', label: '8. 정산/수익' },
  { id: '09_세무회계', label: '9. 세무/회계' },
  { id: '10_사업성장', label: '10. 사업성장' },
];

const STATUS_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: '상태 전체' },
  { id: '미착수', label: '미착수' },
  { id: '진행중', label: '진행/준비중' },
  { id: '심사중', label: '심사/승인대기' },
  { id: '보완요청', label: '보완요청' },
  { id: '완료', label: '완료' },
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  tasks,
  initialCategory,
  onOpenTaskModal,
  onQuickUpdateStatus,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategory || 'all'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mandatoryOnly, setMandatoryOnly] = useState(false);

  // Sync if initialCategory changed from outside
  React.useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all') {
        if (selectedStatus === '진행중') {
          if (!['준비중', '신청준비', '신청완료'].includes(task.status)) return false;
        } else if (selectedStatus === '심사중') {
          if (!['심사중', '승인'].includes(task.status)) return false;
        } else if (task.status !== selectedStatus) {
          return false;
        }
      }

      // Mandatory filter
      if (mandatoryOnly && !task.mandatory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = task.task_name.toLowerCase().includes(q);
        const matchDesc = task.description.toLowerCase().includes(q);
        const matchOrg = task.organization.toLowerCase().includes(q);
        const matchSub = task.sub_category.toLowerCase().includes(q);
        const matchDoc = task.required_documents.some((d) =>
          d.toLowerCase().includes(q)
        );
        if (!matchName && !matchDesc && !matchOrg && !matchSub && !matchDoc) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, selectedCategory, selectedStatus, mandatoryOnly, searchQuery]);

  // Status badge style helper
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case '완료':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-black';
      case '심사중':
        return 'bg-blue-50 text-blue-700 border-blue-300 font-black';
      case '보완요청':
        return 'bg-red-50 text-red-700 border-red-300 font-black animate-pulse';
      case '준비중':
      case '신청준비':
      case '신청완료':
      case '승인':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-black';
      case '불필요':
        return 'bg-slate-100 text-slate-500 border-slate-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls: Search & Filters */}
      <div className="bg-white rounded-[28px] border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="태스크명, 기관명, 서류명, 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900 transition-all"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mandatory toggle */}
            <label className="flex items-center space-x-2 text-xs font-black text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-2.5 rounded-2xl border border-slate-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mandatoryOnly}
                onChange={(e) => setMandatoryOnly(e.target.checked)}
                className="rounded-sm text-slate-900 focus:ring-slate-900 w-3.5 h-3.5 cursor-pointer"
              />
              <span>필수 법정 절차만</span>
            </label>

            {/* Status Filter */}
            <div className="flex items-center space-x-1 overflow-x-auto">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedStatus(f.id)}
                  className={`px-3 py-2 rounded-full text-xs font-black transition-all ${
                    selectedStatus === f.id
                      ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-3 border-t border-slate-100 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count =
              cat.id === 'all'
                ? tasks.length
                : tasks.filter((t) => t.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] scale-[1.02]'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Count & Info */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-bold">
          조회된 태스크: <strong className="text-slate-900 font-black text-sm">{filteredTasks.length}개</strong>
        </span>
        <span className="font-medium text-slate-400">카드를 클릭하면 상세 법정 가이드와 신청 서류를 확인할 수 있습니다.</span>
      </div>

      {/* Task Cards Grid */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-[28px] border border-slate-200 space-y-2">
          <p className="text-sm font-black text-slate-700">
            조건에 일치하는 태스크가 없습니다.
          </p>
          <p className="text-xs text-slate-400 font-medium">
            필터 조건을 변경하거나 검색어를 비워보세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.task_id}
              className="bg-white rounded-[28px] border border-slate-200 hover:border-slate-900 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all p-5 flex flex-col justify-between space-y-4 group"
            >
              {/* Card Top: Tags and Status */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    <span className="text-[10px] font-mono font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {task.task_id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {task.sub_category}
                    </span>
                    {task.mandatory && (
                      <span className="text-[10px] font-black text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        필수
                      </span>
                    )}
                    {task.is_industry_specific && (
                      <span className="text-[10px] font-black text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                        {task.industry_tag}
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider ${getStatusBadge(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>

                {/* Title & description */}
                <h3
                  onClick={() => onOpenTaskModal(task)}
                  className="font-black text-slate-900 text-lg hover:text-blue-600 cursor-pointer leading-snug line-clamp-2 tracking-tight"
                >
                  {task.task_name}
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                  {task.description}
                </p>
              </div>

              {/* Card Middle: Key Metadata */}
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5 font-bold">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate max-w-[150px]">{task.organization}</span>
                  </span>
                  <span className="text-slate-800 font-black">{task.estimated_cost}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>소요: {task.estimated_days}</span>
                  </span>
                  <span className="text-slate-500 truncate max-w-[140px] font-medium">
                    {task.result_document}
                  </span>
                </div>
              </div>

              {/* Card Bottom: Quick Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => onOpenTaskModal(task)}
                  className="text-xs font-black text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1"
                >
                  <span>가이드·서류 확인 →</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() =>
                      onQuickUpdateStatus(
                        task.task_id,
                        task.status === '완료' ? '미착수' : '완료'
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
                      task.status === '완료'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {task.status === '완료' ? '완료됨 ✓' : '완료 처리'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
