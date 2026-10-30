import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Pure domain tests. Do not call live APIs, use credentials, or send messages.
const output = mkdtempSync(path.join(tmpdir(), 'iposcore-content-tests-'));
const run = (args) => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: { ...process.env, NODE_PATH: path.resolve('node_modules') } });
  if (result.status !== 0) throw new Error(`Content checks failed (${result.status}).`);
};
const tests = ['contentQuality', 'reviewEvidence', 'reviewCollector', 'reviewArchive', 'ipoDiscovery', 'financialSync', 'dartFilingParser', 'financialRunner', 'dartSchedule', 'officialVerification', 'dartMetricCache'];
run(['node_modules/typescript/bin/tsc', '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node', '--outDir', output, '--esModuleInterop', '--skipLibCheck', '--resolveJsonModule',
  ...tests.map(name => `tests/${name}.test.ts`)]);
run(['--test', ...tests.map(name => path.join(output, `tests/${name}.test.js`))]);
run(['--experimental-strip-types', '--test', 'tests/ipoCalculation.test.ts']);
