import React, { useState, useEffect, useRef } from 'react';
import { Project, Task } from '../types';
import { aiProvider } from '../services/ai/aiProvider';
import { useAuth } from '../contexts/AuthContext';
import {
  Bot,
  Send,
  AlertTriangle,
  RotateCcw,
  Crown,
  ShieldAlert,
} from 'lucide-react';

interface AiAssistantViewProps {
  project: Project;
  prefillTask?: Task | null;
  onClearPrefillTask?: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  requiresExpertReview?: boolean;
  expertBadge?: string;
  suggestedActions?: string[];
}

const PRESET_QUESTIONS = [
  '어린이 교구 KC 안전확인 인증 절차와 비용 알려줘',
  '스마트스토어 구매안전서비스이용확인증 어떻게 받아?',
  '간이과세자와 일반과세자의 차이점과 세금 혜택',
  'KIPRIS 상표 선행조사 방법과 출원 팁',
  '통신판매업 신고 절차와 매년 내는 등록면허세',
  '1인 사업자 부가세 10% 관리와 절세 골든룰',
];

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  project,
  prefillTask,
  onClearPrefillTask,
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `반갑습니다! **BizFlow AtoZ** 창업 전문 AI 비서입니다. 💡\n\n현재 진행 중이신 **[${project.title}]** 프로젝트의 법률, KC인증, 상표 출원, 세무, 오픈마켓 입점 및 정산 절차에 대해 궁금하신 점을 무엇이든 질문해 주세요.\n\n아래 추천 질문을 클릭하시거나 입력창에 자유롭게 작성하시면 전문가 가이드를 즉시 제공해 드립니다.`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // If opened from a task modal, prefill and auto-ask
  useEffect(() => {
    if (prefillTask) {
      const q = `[${prefillTask.task_name}] 태스크에 대해 창업자 관점에서 필요 서류, 신청처, 예상 비용과 주의해야 할 실수 사례를 상세히 알려줘.`;
      setInputValue(q);
      handleSend(q, prefillTask);
      if (onClearPrefillTask) {
        onClearPrefillTask();
      }
    }
  }, [prefillTask]);

  const handleSend = async (queryText?: string, specificTask?: Task) => {
    const textToSend = queryText || inputValue;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: textToSend,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiProvider.chat({
        project,
        task: specificTask,
        userQuery: textToSend,
      });

      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        requiresExpertReview: response.requiresExpertReview,
        expertBadge: response.expertBadge,
        suggestedActions: response.suggestedActions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: '네트워크 또는 서버 응답에 일시적 지연이 발생했습니다. 다시 시도해 주세요.',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-170px)] min-h-[600px] bg-white rounded-[32px] border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
      {/* AI Assistant Header */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-white flex items-center justify-between">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">
                BizFlow AI 창업 컨설턴트
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                LIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              특허, KC인증, 세무, 행정 인허가 20년 노하우 기반 자문
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'msg-welcome-reset',
                role: 'assistant',
                content: `대화가 초기화되었습니다. **${project.title}** 프로젝트에 대해 무엇이든 질문하세요.`,
                createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              },
            ])
          }
          className="text-xs text-slate-500 hover:text-slate-900 font-black flex items-center space-x-1.5 px-3 py-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">대화 초기화</span>
        </button>
      </div>

      {/* Preset Question Pills */}
      <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center space-x-2 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 shrink-0">
          추천 질문:
        </span>
        {PRESET_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(q)}
            disabled={isLoading}
            className="px-3.5 py-1.5 rounded-full text-xs bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 whitespace-nowrap transition-all font-black shadow-2xs disabled:opacity-50 hover:scale-[1.02]"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1 font-black text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className="max-w-2xl space-y-2">
              <div
                className={`rounded-[24px] p-5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-slate-900 text-white shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] rounded-tr-xs font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs whitespace-pre-wrap font-medium shadow-xs'
                }`}
              >
                {msg.content}
                <div
                  className={`text-[10px] mt-2 font-mono font-bold ${
                    msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.createdAt}
                </div>
              </div>
              {/* Expert review badge */}
              {msg.role === 'assistant' && msg.requiresExpertReview && msg.expertBadge && (
                <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                  ⚠️ {msg.expertBadge} — 최종 판단은 전문가와 확인하세요.
                </div>
              )}
              {/* Suggested actions */}
              {msg.role === 'assistant' && msg.suggestedActions && msg.suggestedActions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {msg.suggestedActions.map((action, i) => (
                    <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                      → {action}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-[24px] rounded-tl-xs p-5 text-xs text-slate-600 flex items-center space-x-2 font-bold shadow-xs">
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
              <span>창업 법령과 실무 가이드를 분석 중입니다...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 sm:p-5 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center space-x-3"
        >
          <input
            type="text"
            placeholder="어린이 교구 KC인증, 스마트스토어 구매안전서비스확인증, 세무 절세 등 무엇이든 질문하세요..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-full text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:border-slate-900 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-12 h-12 shrink-0 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-full flex items-center justify-center transition-all shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Send className="w-4 h-4 text-blue-400" />
          </button>
        </form>
      </div>
    </div>
  );
};
