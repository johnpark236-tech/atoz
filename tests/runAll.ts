import { execSync } from 'child_process';

console.log('================================================================');
console.log('Running BizFlow AtoZ Verification & Smoke Test Suites');
console.log('================================================================\n');

try {
  console.log('▶ [1/2] Running Cloud Storage Integration Tests...');
  execSync('npx tsx tests/cloudStorage.test.ts', { stdio: 'inherit' });
  console.log('\n▶ [2/2] Running Location & Commercial Analysis Tests...');
  execSync('npx tsx tests/locationAnalysis.test.ts', { stdio: 'inherit' });
  console.log('\n================================================================');
  console.log('✅ ALL TEST SUITES PASSED SUCCESSFULLY (100% PASS RATE)');
  console.log('================================================================');
} catch (error) {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
}
