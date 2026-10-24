import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Pure domain tests. Do not call live APIs, use credentials, or send messages.
const output = mkdtempSync(path.join(tmpdir(), 'iposcore-content-tests-'));
const run = (args) => {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`Content checks failed (${result.status}).`);
};
run(['node_modules/typescript/bin/tsc', '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node', '--outDir', output, '--esModuleInterop', '--skipLibCheck',
  'src/lib/contentQuality.ts', 'src/lib/scoring.ts', 'src/lib/sentimentAnalyzer.ts', 'tests/contentQuality.test.ts']);
run(['--test', path.join(output, 'tests/contentQuality.test.js')]);
run(['--experimental-strip-types', '--test', 'tests/ipoCalculation.test.ts']);
