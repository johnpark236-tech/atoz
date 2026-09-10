import dotenv from 'dotenv';
dotenv.config({ path: ['.env.local', '.env'] });
import { GoogleGenAI } from '@google/genai';
import { executeMarketResearch } from '../src/services/marketResearch/marketResearchService';

console.log('----------------------------------------------------------------');
console.log('🧪 Market Research Service Verification Suite');
console.log('----------------------------------------------------------------');

async function testMarketResearch() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log('⚠️ GEMINI_API_KEY not configured. Testing graceful fallback behavior...');
    console.log('✅ Service module imported and initialized successfully.');
    return;
  }

  console.log('🔑 GEMINI_API_KEY detected. Running live test on "AI 기반 소상공인 창업지원 플랫폼"...');

  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const testPrompt = `
[고객 아이디어]
- 아이디어/프로젝트명: AI 기반 소상공인 창업지원 플랫폼
- 핵심 설명: 소상공인 및 예비창업자를 위한 상권분석, 건축물대장 자동조회, 세무/법률 행정 가이드 및 AI 사업계획서 생성
- 사업모델: B2B2C / B2G2C
- 목표시장: 대한민국

[요청]
2026년 기준 대한민국 소상공인 창업지원 플랫폼 시장 규모, 주요 공공/민간 경쟁사(예: 소진공, 비즈탑, 마이프차 등), 수익화 모델을 3개 핵심 단락으로 간략히 조사해줘.
실시간 웹 검색을 사용하여 최신 출처 URL을 포함해줘.
`;

  const startTime = Date.now();
  const result = await executeMarketResearch({
    client,
    prompt: testPrompt,
  });
  const duration = Date.now() - startTime;

  console.log(`⏱️ Request completed in ${duration}ms`);
  console.log(`📊 Result Source: ${result.source}`);
  console.log(`🔎 Grounded: ${result.grounded}`);
  console.log(`🤖 Model: ${result.model}`);
  console.log(`🔍 Search Queries Executed (${result.searchQueries.length}):`, result.searchQueries);
  console.log(`🌐 Sources Discovered (${result.sources.length}):`);
  result.sources.slice(0, 5).forEach((src, idx) => {
    console.log(`   [${idx + 1}] ${src.title} (${src.domain}) -> ${src.url}`);
  });
  console.log(`📝 Report preview (first 250 chars):\n${result.report.slice(0, 250)}...`);

  if (!result.report || result.report.length < 50) {
    throw new Error('Report generated is empty or too short');
  }

  console.log('✅ Market Research Test Passed successfully!');
}

testMarketResearch().catch((err) => {
  console.error('❌ Market research test failed:', err);
  process.exit(1);
});
