import React from 'react';
import { FileText, Shield, AlertTriangle } from 'lucide-react';

type LegalType = 'terms' | 'privacy';

interface LegalViewProps {
  type: LegalType;
}

export const LegalView: React.FC<LegalViewProps> = ({ type }) => {
  const isTerms = type === 'terms';

  return (
    <div className="max-w-3xl mx-auto">
      {/* Draft notice */}
      <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-black text-amber-800">임시 문안 (법률 검토 전)</p>
          <p className="text-xs text-amber-700 font-medium mt-1">
            운영 전 반드시 법무사 또는 변호사의 검토가 필요합니다. 이 문안은 예시용이며 법적 효력이 없습니다.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        <div className="bg-slate-900 px-8 py-6 flex items-center gap-3">
          {isTerms ? (
            <FileText className="w-6 h-6 text-blue-400" />
          ) : (
            <Shield className="w-6 h-6 text-blue-400" />
          )}
          <div>
            <h1 className="text-xl font-black text-white">
              {isTerms ? '이용약관' : '개인정보처리방침'}
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              버전 1.0.0 · 시행일: 2026-09-06 (임시)
            </p>
          </div>
        </div>

        <div className="p-8 prose prose-slate max-w-none text-sm leading-relaxed space-y-6">
          {isTerms ? <TermsContent /> : <PrivacyContent />}
        </div>
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h2 className="text-base font-black text-slate-900 mb-3 pb-2 border-b border-slate-100">{title}</h2>
    <div className="text-slate-700 font-medium space-y-2">{children}</div>
  </section>
);

const TermsContent: React.FC = () => (
  <>
    <Section title="제1조 (목적)">
      <p>
        이 약관은 BizFlow AtoZ(이하 "서비스")를 운영하는 회사(이하 "회사")가 제공하는
        서비스의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 등 기본적인 사항을 규정함을 목적으로 합니다.
      </p>
      <p className="text-amber-600 text-xs font-bold">⚠️ TODO: 법인명, 대표자, 사업자등록번호 기재 필요</p>
    </Section>

    <Section title="제2조 (정의)">
      <ul className="list-disc pl-5 space-y-1">
        <li>"서비스"라 함은 회사가 제공하는 BizFlow AtoZ 창업 지원 플랫폼을 의미합니다.</li>
        <li>"이용자"라 함은 이 약관에 따라 서비스를 이용하는 모든 회원 및 비회원을 말합니다.</li>
        <li>"회원"이라 함은 회사에 개인정보를 제공하여 회원 등록을 한 자입니다.</li>
      </ul>
    </Section>

    <Section title="제3조 (서비스 이용)">
      <p>회사는 다음 서비스를 제공합니다:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>창업 로드맵 및 체크리스트 서비스</li>
        <li>매출·정산 관리 서비스</li>
        <li>AI 창업 상담 서비스</li>
        <li>문서 보관 서비스(유료)</li>
        <li>기타 회사가 추가 개발하는 서비스</li>
      </ul>
    </Section>

    <Section title="제4조 (유료 서비스 및 결제)">
      <p>
        유료 PRO 서비스는 월 ₩19,900의 구독료가 부과됩니다. 결제는 등록한 카드로 매월 자동 청구됩니다.
      </p>
      <p>
        이용자는 구독을 언제든지 해지할 수 있으며, 해지 후 현재 결제 기간 종료일까지 서비스를 이용할 수 있습니다.
      </p>
      <p className="text-amber-600 text-xs font-bold">⚠️ TODO: 실제 결제 조건 및 환불 정책 법률 검토 필요</p>
    </Section>

    <Section title="제5조 (환불 정책)">
      <p>
        「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 구독 서비스 결제일로부터 7일 이내에
        청약철회를 요청할 수 있습니다. 단, 이미 사용한 서비스 기간에 해당하는 금액은 공제될 수 있습니다.
      </p>
    </Section>

    <Section title="제6조 (면책조항)">
      <p>
        본 서비스는 창업 실무 절차 가이드 및 시뮬레이터입니다.
        행정처분, 세무 신고, 법적 판단의 최종 책임은 이용자 본인에게 있습니다.
        AI 응답은 참고용이며 법적 효력이 없습니다.
      </p>
    </Section>

    <p className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100">
      본 약관은 2026년 9월 6일부터 시행됩니다. (임시 문안 — 운영 전 법률 검토 필요)
    </p>
  </>
);

const PrivacyContent: React.FC = () => (
  <>
    <Section title="1. 수집하는 개인정보">
      <p>회사는 다음과 같은 개인정보를 수집합니다:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>필수: 이메일 주소, 비밀번호(암호화 저장)</li>
        <li>선택: 표시 이름</li>
        <li>자동 수집: 서비스 이용 기록, 접속 로그</li>
      </ul>
    </Section>

    <Section title="2. 개인정보 수집 및 이용 목적">
      <ul className="list-disc pl-5 space-y-1">
        <li>회원 가입 및 서비스 제공</li>
        <li>서비스 개선 및 신규 기능 개발</li>
        <li>고객 문의 및 민원 처리</li>
        <li>결제 및 환불 처리</li>
        <li>마케팅·광고 활용 (선택 동의자에 한함)</li>
      </ul>
    </Section>

    <Section title="3. 개인정보 보유 및 이용 기간">
      <p>
        회원 탈퇴 시 즉시 삭제합니다. 단, 관계 법령에 의해 보존이 필요한 경우 아래 기간 동안 보관합니다:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>계약 또는 청약철회 기록: 5년 (전자상거래법)</li>
        <li>대금결제 및 재화 공급 기록: 5년 (전자상거래법)</li>
        <li>소비자 불만 및 분쟁 처리 기록: 3년 (전자상거래법)</li>
      </ul>
    </Section>

    <Section title="4. 개인정보 제3자 제공">
      <p>
        회사는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다.
        단, 다음의 경우는 예외로 합니다:
      </p>
      <ul className="list-disc pl-5 space-y-1">
        <li>이용자가 사전에 동의한 경우</li>
        <li>법령의 규정에 의거하거나 수사기관이 법령에 정한 절차에 따라 요구하는 경우</li>
      </ul>
    </Section>

    <Section title="5. 이용자의 권리">
      <p>이용자는 언제든지 다음 권리를 행사할 수 있습니다:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>개인정보 열람 요청</li>
        <li>개인정보 수정·삭제 요청</li>
        <li>처리 정지 요청</li>
        <li>회원 탈퇴 (계정 삭제)</li>
      </ul>
    </Section>

    <Section title="6. 개인정보 보호책임자">
      <p className="text-amber-600 text-xs font-bold">⚠️ TODO: 개인정보 보호책임자 성명, 직위, 연락처 기재 필요</p>
      <p>이름: [책임자명] / 이메일: [이메일] / 전화: [전화번호]</p>
    </Section>

    <Section title="7. 쿠키 및 자동 수집 장치">
      <p>
        현재 서비스는 localStorage를 통해 기기 내 데이터를 저장합니다. 서버로 전송되는 쿠키는 사용하지 않습니다.
      </p>
    </Section>

    <p className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100">
      본 방침은 2026년 9월 6일부터 시행됩니다. (임시 문안 — 운영 전 법률 검토 필요)
    </p>
  </>
);
