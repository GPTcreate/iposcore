import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

const DAY_MS = 86400000;
const source = fs.readFileSync('src/lib/useKstDayRefresh.ts', 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;

type Listener = () => void;
type UseDayRefresh = (refresh: Listener, evaluatedAt?: number) => void;

/** Execute the real hook with a controlled browser clock; no React DOM or network. */
function browserFixture(initialTime: string, evaluatedAt?: number) {
  let clock = Date.parse(initialTime);
  let nextTimer = 0;
  let refreshCount = 0;
  let cleanup: (() => void) | undefined;
  let dependencies: unknown[] | undefined;
  const timers = new Map<number, { at: number; delay: number; callback: Listener }>();
  const windowListeners = new Map<string, Set<Listener>>();
  const documentListeners = new Map<string, Set<Listener>>();
  const add = (listeners: Map<string, Set<Listener>>, type: string, listener: Listener) => {
    if (!listeners.has(type)) listeners.set(type, new Set());
    listeners.get(type)!.add(listener);
  };
  const remove = (listeners: Map<string, Set<Listener>>, type: string, listener: Listener) => {
    listeners.get(type)?.delete(listener);
  };
  const document = {
    visibilityState: 'visible',
    addEventListener: (type: string, listener: Listener) => add(documentListeners, type, listener),
    removeEventListener: (type: string, listener: Listener) => remove(documentListeners, type, listener),
  };
  const exports: { useKstDayRefresh?: UseDayRefresh } = {};
  vm.runInNewContext(compiled, {
    exports, module: { exports }, Date: { now: () => clock },
    require: (name: string) => {
      assert.equal(name, 'react', 'The hook fixture permits no other runtime imports.');
      return { useEffect: (effect: () => (() => void), nextDependencies: unknown[]) => {
        const unchanged = dependencies && dependencies.length === nextDependencies.length
          && nextDependencies.every((value, index) => Object.is(value, dependencies![index]));
        if (unchanged) return;
        cleanup?.();
        dependencies = Array.from(nextDependencies);
        cleanup = effect();
      } };
    },
    window: {
      addEventListener: (type: string, listener: Listener) => add(windowListeners, type, listener),
      removeEventListener: (type: string, listener: Listener) => remove(windowListeners, type, listener),
    },
    document,
    setTimeout: (callback: Listener, delay: number) => {
      assert(Number.isFinite(delay) && delay > 0 && delay <= DAY_MS + 50);
      const timer = ++nextTimer;
      timers.set(timer, { at: clock + delay, delay, callback });
      return timer;
    },
    clearTimeout: (timer: number) => timers.delete(timer),
  });
  assert.equal(typeof exports.useKstDayRefresh, 'function');
  const refresh = () => { refreshCount++; };
  const render = (serverTime?: number) => exports.useKstDayRefresh!(refresh, serverTime);
  render(evaluatedAt);

  return {
    get refreshCount() { return refreshCount; },
    get now() { return clock; },
    timers,
    listenerCount: () => [...windowListeners.values(), ...documentListeners.values()]
      .reduce((count, listeners) => count + listeners.size, 0),
    jump: (milliseconds: number) => { clock += milliseconds; },
    // Timers execute at the current clock, modelling callbacks delayed by tab suspension.
    flushDue: () => {
      let callbacks = 0;
      while (true) {
        const due = [...timers].filter(([, timer]) => timer.at <= clock)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!due) return;
        assert(++callbacks <= 10, 'The hook must not spin on an already due timer.');
        timers.delete(due[0]);
        due[1].callback();
      }
    },
    focus: () => { for (const listener of [...windowListeners.get('focus') || []]) listener(); },
    visibility: (state: 'visible' | 'hidden') => {
      document.visibilityState = state;
      for (const listener of [...documentListeners.get('visibilitychange') || []]) listener();
    },
    render,
    unmount: () => { cleanup?.(); cleanup = undefined; },
  };
}

test('an open page refreshes once at KST midnight and schedules the following day', () => {
  const browser = browserFixture('2026-10-31T14:59:59.000Z'); // KST 23:59:59.
  assert.equal(browser.refreshCount, 0);
  assert.equal([...browser.timers.values()][0].delay, 1050);
  browser.jump(1049);
  browser.flushDue();
  assert.equal(browser.refreshCount, 0);
  browser.jump(1);
  browser.flushDue();
  assert.equal(browser.refreshCount, 1);
  assert.equal(browser.timers.size, 1);
  assert.equal([...browser.timers.values()][0].delay, DAY_MS);
  browser.jump(DAY_MS);
  browser.flushDue();
  assert.equal(browser.refreshCount, 2);
  assert.equal(browser.timers.size, 1);
  browser.unmount();
});

test('focus and visibility recover a changed KST date without duplicate refreshes', () => {
  const browser = browserFixture('2026-10-31T14:59:59.000Z');
  browser.focus();
  browser.visibility('visible');
  assert.equal(browser.refreshCount, 0);
  browser.jump(1000); // Exact KST midnight, before the timer's 50 ms margin.
  browser.focus();
  browser.visibility('visible');
  browser.focus();
  assert.equal(browser.refreshCount, 1);
  browser.jump(50);
  browser.flushDue();
  assert.equal(browser.refreshCount, 1);
  assert.equal(browser.timers.size, 1);
  browser.unmount();
});

test('a suspended tab catches up once after several days and replaces its overdue timer', () => {
  const browser = browserFixture('2026-10-31T14:00:00.000Z');
  browser.visibility('hidden');
  browser.jump(2 * DAY_MS + 2 * 3600000);
  browser.visibility('hidden');
  assert.equal(browser.refreshCount, 0);
  browser.visibility('visible');
  assert.equal(browser.refreshCount, 1);
  browser.focus();
  browser.flushDue();
  assert.equal(browser.refreshCount, 1);
  assert.equal(browser.timers.size, 1);
  assert([...browser.timers.values()][0].at > browser.now);
  browser.unmount();
});

test('unmount removes the timer and both browser listeners without later callbacks', () => {
  const browser = browserFixture('2026-10-31T14:59:59.000Z');
  assert.equal(browser.listenerCount(), 2);
  assert.equal(browser.timers.size, 1);
  browser.unmount();
  assert.equal(browser.listenerCount(), 0);
  assert.equal(browser.timers.size, 0);
  browser.jump(DAY_MS);
  browser.focus();
  browser.visibility('visible');
  browser.flushDue();
  assert.equal(browser.refreshCount, 0);
});

test('hydration after KST midnight immediately refreshes a page evaluated on the prior day', () => {
  const browser = browserFixture('2026-12-31T15:00:00.200Z', Date.parse('2026-12-31T14:59:59.900Z'));
  assert.equal(browser.refreshCount, 1);
  browser.focus();
  browser.visibility('visible');
  assert.equal(browser.refreshCount, 1);
  assert.equal(browser.timers.size, 1);
  browser.unmount();
  const sameDay = browserFixture('2026-12-31T15:00:00.200Z', Date.parse('2026-12-31T15:00:00.100Z'));
  assert.equal(sameDay.refreshCount, 0);
  sameDay.unmount();
});

test('a new server evaluation timestamp replaces the effect without leaking timers or listeners', () => {
  const initial = Date.parse('2026-10-31T14:59:59.000Z');
  const browser = browserFixture('2026-10-31T14:59:59.000Z', initial);
  const originalTimer = [...browser.timers.keys()][0];
  browser.render(initial);
  assert.equal([...browser.timers.keys()][0], originalTimer);
  browser.jump(1100);
  browser.render(browser.now); // A server refresh already returned the new day's score.
  assert.equal(browser.refreshCount, 0);
  assert(!browser.timers.has(originalTimer));
  assert.equal(browser.timers.size, 1);
  assert.equal(browser.listenerCount(), 2);
  browser.focus();
  browser.flushDue();
  assert.equal(browser.refreshCount, 0);
  browser.unmount();
  assert.equal(browser.timers.size, 0);
  assert.equal(browser.listenerCount(), 0);
});
