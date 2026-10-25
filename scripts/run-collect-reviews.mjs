import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = process.cwd();
const output = mkdtempSync(path.join(tmpdir(), 'iposcore-review-collection-'));
const compile = spawnSync(process.execPath, [
  path.join(root, 'node_modules', 'typescript', 'bin', 'tsc'),
  '--target', 'ES2022', '--module', 'commonjs', '--moduleResolution', 'node',
  '--rootDir', root, '--outDir', output, '--esModuleInterop', '--resolveJsonModule', '--skipLibCheck',
  path.join(root, 'scripts', 'collect-reviews.ts'),
], { cwd: root, stdio: 'inherit' });
if (compile.status !== 0) process.exit(compile.status || 1);
const result = spawnSync(process.execPath, [path.join(output, 'scripts', 'collect-reviews.js'), ...process.argv.slice(2)], {
  cwd: root, stdio: 'inherit',
  env: { ...process.env, NODE_PATH: [path.join(root, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter) },
});
process.exit(result.status ?? 1);
