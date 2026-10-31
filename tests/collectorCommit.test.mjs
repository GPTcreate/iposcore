import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

// Exercise the actual workflow commit script using local repositories only.
const workflow = fs.readFileSync('.github/workflows/collect-reviews.yml', 'utf8').replace(/\r\n/g, '\n');
const block = workflow.split('      - name: Preserve data and failed-attempt metadata on the default branch\n')[1];
assert(block, 'Missing collector commit step');
const script = block.split('        run: |\n')[1].split('\n      - name:')[0]
  .split('\n').map(line => line.slice(10)).join('\n');
const bash = process.platform === 'win32' ? 'C:\\Program Files\\Git\\bin\\bash.exe' : 'bash';
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const write = (cwd, file, value) => {
  fs.mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
  fs.writeFileSync(path.join(cwd, file), value);
};
const data = 'src/data/customIpos.json';
const initial = JSON.stringify([{ id: 'preserved', value: 1 }]);
const collected = JSON.stringify([{ id: 'preserved', value: 1 }, { id: 'collected', value: 2 }]);

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'iposcore-commit-fixture-'));
  const remote = path.join(root, 'origin.git');
  const collector = path.join(root, 'collector');
  const developer = path.join(root, 'developer');
  git(root, 'init', '--bare', '--initial-branch=main', remote);
  git(root, 'clone', remote, collector);
  const configure = cwd => {
    git(cwd, 'config', 'user.name', 'IPO fixture');
    git(cwd, 'config', 'user.email', 'fixture@example.invalid');
    git(cwd, 'config', 'commit.gpgsign', 'false');
  };
  configure(collector);
  write(collector, data, initial);
  write(collector, 'src/data/reviewSnapshots.json', '{}');
  write(collector, 'code.txt', 'initial\n');
  write(collector, 'package.json', JSON.stringify({ scripts: { 'validate:data': 'node validate.mjs' } }));
  write(collector, 'validate.mjs', "import fs from 'node:fs';const rows=JSON.parse(fs.readFileSync('src/data/customIpos.json'));if(new Set(rows.map(x=>x.id)).size!==rows.length)process.exit(1);\n");
  git(collector, 'add', '.');
  git(collector, 'commit', '-m', 'fixture baseline');
  git(collector, 'push', 'origin', 'main');
  git(root, 'clone', remote, developer);
  configure(developer);
  write(collector, data, collected);
  const run = () => execFileSync(bash, ['-euo', 'pipefail', '-c', script], {
    cwd: collector, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, DEFAULT_BRANCH: 'main' },
  });
  return { root, remote, collector, developer, run };
}

test('collector rebases a concurrent code commit, revalidates and preserves both changes', () => {
  const f = fixture();
  write(f.developer, 'code.txt', 'concurrent source update\n');
  git(f.developer, 'add', 'code.txt');
  git(f.developer, 'commit', '-m', 'concurrent source');
  git(f.developer, 'push', 'origin', 'main');
  const output = f.run();
  assert.match(output, /validate:data/);
  assert.equal(git(f.root, '--git-dir', f.remote, 'show', 'main:code.txt'), 'concurrent source update');
  assert.equal(git(f.root, '--git-dir', f.remote, 'show', `main:${data}`), collected);
  assert.equal(git(f.collector, 'status', '--porcelain'), '');
});

test('collector aborts conflicting concurrent data changes without overwriting either result', () => {
  const f = fixture();
  const concurrent = JSON.stringify([{ id: 'preserved', value: 99 }]);
  write(f.developer, data, concurrent);
  git(f.developer, 'add', data);
  git(f.developer, 'commit', '-m', 'concurrent data correction');
  git(f.developer, 'push', 'origin', 'main');
  assert.throws(f.run);
  assert.equal(git(f.root, '--git-dir', f.remote, 'show', `main:${data}`), concurrent);
  assert.equal(fs.readFileSync(path.join(f.collector, data), 'utf8'), collected);
  assert.equal(git(f.collector, 'status', '--porcelain'), '');
  assert(workflow.includes('name: collected-data-recovery'));
});
