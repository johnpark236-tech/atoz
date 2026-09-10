import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini lazily
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      service: "BizFlow AtoZ API",
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // AI Business Consultant endpoint
  app.post("/api/ai/consult", async (req, res) => {
    try {
      const { question, projectContext, taskContext } = req.body;

      if (!question || typeof question !== "string") {
        return res.status(400).json({ error: "질문 내용이 필요합니다." });
      }

      const client = getGeminiClient();

      if (client) {
        const systemInstruction = `당신은 대한민국 20년차 창업지원 전문 컨설턴트, 변리사, 세무사 자문을 아우르는 'BizFlow AtoZ 사업화 도우미'입니다.
한국의 예비창업자, 1인 사업자, 창작자에게 친절하고 명확하며 실무적인 가이드를 제공합니다.
사용자의 질문에 대해 법령, 특허청(KIPRIS), 국세청 홈택스, 공정위, 국가표준기술원(Safety Korea)의 최신 실무 절차를 기반으로 답변하세요.

중요 원칙:
1. 답변 말미에는 항상 "[공식기관 확인 필요] 본 안내는 참고용 실무 정보이며 최종 등록 및 심사는 관할 공공기관(특허청, 세무서, 인증기관 등)의 규정을 확인해야 합니다."를 명시하세요.
2. 실행 단계(Step-by-step), 비용, 소요기간, 준비서류를 구조적으로 나누어 안내하세요.
3. 사용자의 현재 프로젝트 정보와 선택된 Task 맥락을 적극 반영하여 맞춤형으로 설명하세요.`;

        const promptContext = `
[프로젝트 정보]
- 프로젝트명: ${projectContext?.title || "미정"}
- 사업유형: ${projectContext?.businessType || "미정"}
- 판매대상: ${projectContext?.targetCustomer || "미정"}
- 판매채널: ${(projectContext?.salesChannels || []).join(", ") || "미정"}
- 현재단계: ${projectContext?.stage || "아이디어"}
- 사업자형태: ${projectContext?.corporateStatus || "없음"}

[현재 선택된 Task]
- 업무명: ${taskContext?.task_name || "일반 문의"}
- 담당기관: ${taskContext?.organization || "해당없음"}
- 내용: ${taskContext?.description || "없음"}

[사용자 질문]
${question}
`;

        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: promptContext,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        return res.json({
          reply: response.text || "답변을 생성하지 못했습니다. 다시 시도해주세요.",
          source: "gemini-3.8-flash",
          disclaimer: "공식기관 확인 필요",
        });
      }

      // Fallback domain response when GEMINI_API_KEY is not set
      let fallbackReply = "";
      const q = question.toLowerCase();

      if (q.includes("kc") || q.includes("인증") || q.includes("어린이") || q.includes("교구")) {
        fallbackReply = `### 📋 KC 인증 및 어린이제품 안전기준 실무 가이드

1. **대상 판정 기준 (어린이제품안전특별법)**
   - 만 13세 이하 어린이가 사용하는 교구·완구는 **'어린이제품 안전인증'** 또는 **'공급자적합성확인'** 대상입니다.
   - 단순 종이 인쇄물(도서)은 면제될 수 있으나, 목재·플라스틱 주사위, 카드, 보드게임 구성품은 유해물질(프탈레이트 가소제, 납, 카드뮴) 검사 및 물리적 안전검사(삼킴 방지 크기 테스트)가 필수입니다.

2. **소요 비용 및 기간**
   - 수수료: 항목당 약 30만 원 ~ 80만 원 선 (시험 항목 수에 따라 변동)
   - 소요 기간: 시료 접수 후 2~4주

3. **추천 공인시험기관**
   - KCL (한국건설생활환경시험연구원)
   - KTR (한국화학융합시험연구원)
   - KATRI (한국의류시험연구원)

4. **행동 요령**
   - 시제품(샘플 3~5개)을 제작한 뒤 시험기관 사전 상담 후 성적서를 발급받고, 안전확인신고 후 KC 마크와 제품표시사항을 패키지에 인쇄하세요.`;
      } else if (q.includes("상표") || q.includes("kipris") || q.includes("28류")) {
        fallbackReply = `### 🏷️ 상표 사전검색 및 제28류 상품분류 가이드

1. **KIPRIS 검색 요령**
   - 특허정보검색서비스(www.kipris.or.kr)에서 동일한 상호뿐 아니라 유사 발음(칭호), 외관, 관념이 겹치는지 확인합니다.

2. **교육용 교구 / 완구의 분류 (제28류)**
   - 제28류 주요 지정상품: '교육용 완구', '주사위게임기', '보드게임', '퍼즐', '교구용 조립블록'
   - 온라인 디지털 콘텐츠나 앱이 동반되는 경우: **제09류(소프트웨어/모바일앱)** 및 **제41류(온라인 교육제공업)** 교차 출원을 권장합니다.

3. **비용 및 기간**
   - 특허로 전자출원 시 1개 류 기준 관납료: 약 5만 6천원 (기본 20개 상품 기준)
   - 출원 후 심사까지: 일반심사 약 12~14개월 (우선심사 신청 시 1~2개월 단축 가능, 우선심사 신청료 약 16만원)`;
      } else if (q.includes("사업자") || q.includes("업종코드") || q.includes("간이") || q.includes("홈택스")) {
        fallbackReply = `### 🏢 사업자등록 및 업종코드 가이드

1. **추천 업종코드**
   - **통신판매업(전자상거래)**: 525101 (도매 및 소매업 / 전자상거래 소매업)
   - **완구/교구 도소매**: 523932 (완구 소매업)
   - **자체 기획 후 외주제조(OEM) 판매 시**: 513932 (완구 도매업)
   - **출판/교육콘텐츠**: 581100 (서적 출판업) 또는 581900 (기타 인쇄물 출판업)

2. **간이과세 vs 일반과세**
   - 초기 시설투자나 제조원가 세금계산서 매입세액 공제가 많다면 **일반과세자**가 유리할 수 있습니다.
   - 초기 연 매출 1억 400만원 미만 예상이며 B2C 위주라면 **간이과세자**로 시작하여 세무 부담을 줄이는 것도 좋습니다. (단, 4,800만원 이상 간이과세자는 세금계산서 발급 의무 발생)`;
      } else if (q.includes("구매안전") || q.includes("에스크로") || q.includes("통신판매")) {
        fallbackReply = `### 📦 구매안전서비스(에스크로) 및 통신판매업 신고 가이드

1. **필요 순서**
   - 사업자등록증 발급 → 은행 또는 플랫폼(스마트스토어 등)에서 구매안전서비스이용확인증 발급 → 정부24에서 통신판매업 신고.
2. **스마트스토어 활용 팁**
   - 네이버 스마트스토어 판매자센터 가입 신청 시 '구매안전서비스 이용확인증'을 PDF로 즉시 무료 출력 가능합니다. 이를 정부24에 첨부하면 은행 방문 없이 신청할 수 있습니다.
3. **면제 요령**
   - 직전 연도 통신판매 거래횟수가 50회 미만인 경우 통신판매업 신고 면제 대상이나, 네이버/쿠팡 등 주요 오픈마켓 입점 시에는 사실상 필수 제출 서류입니다.`;
      } else {
        fallbackReply = `### 💡 사업화 실무 안내

질문해주신 **"${question}"** 건에 대한 핵심 체크리스트입니다:

1. **현재 단계 점검**: 프로젝트 진행 로드맵에서 선행 업무(시장조사, 권리확보, 규격확인)가 누락되지 않았는지 확인하세요.
2. **공식 행정 창구**:
   - 지식재산권(상표/특허): 특허로 (www.patent.go.kr)
   - 사업자/세무: 국세청 홈택스 (www.hometax.go.kr)
   - 인증확인: 제품안전정보포털 Safety Korea (www.safetykorea.kr)
   - 통신판매 신고: 정부24 (www.gov.kr)
3. **리스크 예방**: 제품 출시 전 상표 출원 번호 및 필수 표시사항(제조국, 성분, 연령 등)을 제품 패키지에 누락 없이 기재해야 유통 시 분쟁을 방지할 수 있습니다.`;
      }

      return res.json({
        reply: fallbackReply,
        source: "domain-expert-fallback",
        disclaimer: "공식기관 확인 필요",
      });
    } catch (err: any) {
      console.error("AI consult error:", err);
      return res.status(500).json({
        error: "상담 처리 중 오류가 발생했습니다.",
        details: err?.message,
      });
    }
  });

  // Location Analysis Health Endpoint
  app.get("/api/location/health", (req, res) => {
    res.json({
      status: "ok",
      hasDataGoKrKey: Boolean(process.env.DATA_GO_KR_SERVICE_KEY || process.env.PUBLIC_DATA_PORTAL_KEY),
      hasVworldKey: Boolean(process.env.VWORLD_API_KEY),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString(),
    });
  });

  // Location & Commercial Area Analysis Endpoint
  app.post("/api/location/analyze", async (req, res) => {
    try {
      const { address, businessType, radius } = req.body;

      if (!address || typeof address !== "string" || !address.trim()) {
        return res.status(400).json({
          error: "분석할 주소(도로명 또는 지번)를 입력해주세요.",
        });
      }

      const client = getGeminiClient();
      const vworldApiKey = process.env.VWORLD_API_KEY;
      const dataGoKrServiceKey = process.env.DATA_GO_KR_SERVICE_KEY || process.env.PUBLIC_DATA_PORTAL_KEY;

      const { analyzeLocation } = await import("./src/services/location/locationAnalysisService");

      const result = await analyzeLocation(
        address.trim(),
        businessType || "카페",
        Number(radius) || 500,
        {
          vworldApiKey,
          dataGoKrServiceKey,
          geminiClient: client,
        }
      );

      return res.json(result);
    } catch (err: any) {
      console.error("Location analysis error:", err);
      return res.status(500).json({
        error: "주소지 및 상권 분석 중 오류가 발생했습니다.",
        details: err?.message,
      });
    }
  });

  // Market Research API endpoint
  app.post("/api/market-research", async (req, res) => {
    try {
      const { prompt, form } = req.body;
      const client = getGeminiClient();

      if (client && prompt) {
        const response = await client.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            temperature: 0.7,
          },
        });

        return res.json({
          report: response.text || "시장조사 보고서를 생성하지 못했습니다.",
          source: "gemini-3.8-flash",
        });
      }

      return res.status(503).json({
        error: "AI 시장조사 모델이 준비되지 않았습니다.",
      });
    } catch (err: any) {
      console.error("Market research error:", err);
      return res.status(500).json({
        error: "시장조사 처리 중 오류가 발생했습니다.",
        details: err?.message,
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BizFlow AtoZ Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
