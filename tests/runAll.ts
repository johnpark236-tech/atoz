import { execSync } from 'child_process';

console.log('================================================================');
console.log('Running BizFlow AtoZ Verification & Smoke Test Suites');
console.log('================================================================\n');

try {
  console.log('▶ [1/3] Running Cloud Storage Integration Tests...');
  execSync('node --import tsx tests/cloudStorage.test.ts', { stdio: 'inherit' });
  console.log('\n▶ [2/3] Running Location & Commercial Analysis Tests...');
  execSync('node --import tsx tests/locationAnalysis.test.ts', { stdio: 'inherit' });
  console.log('\n▶ [3/3] Running Market Research Service Tests...');
  execSync('node --import tsx tests/marketResearch.test.ts', { stdio: 'inherit' });
  console.log('\n================================================================');
  console.log('✅ ALL TEST SUITES PASSED SUCCESSFULLY (100% PASS RATE)');
  console.log('================================================================');
} catch (error) {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
}
