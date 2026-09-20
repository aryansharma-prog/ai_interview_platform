import { CheckCircle2, XCircle, Clock, Zap, Cpu, AlertTriangle } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { ExecutionResults, ComplexityAnalysis } from '@/types';

interface TestResultsPanelProps {
  executionResults?: ExecutionResults | null;
  complexityAnalysis?: ComplexityAnalysis | null;
  isLoading?: boolean;
}

export default function TestResultsPanel({
  executionResults,
  complexityAnalysis,
  isLoading = false,
}: TestResultsPanelProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-xl border border-neutral/10 bg-ink-800 text-slate-light font-mono text-xs animate-pulse">
        <Zap className="h-4 w-4 text-signal mr-2 animate-bounce" />
        Running test cases in isolated sandbox...
      </div>
    );
  }

  if (!executionResults) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-neutral/10 bg-ink-800/40 text-center text-xs text-slate">
        Run your code to execute against visible & hidden test cases and receive AI Big-O complexity feedback.
      </div>
    );
  }

  const { passed, testsPassed, totalTests, runtimeMs, stdout, stderr, testResults } = executionResults;

  return (
    <div className="space-y-4 rounded-xl border border-neutral/10 bg-ink-800 p-4">
      {/* Header Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral/10 pb-3">
        <div className="flex items-center gap-2">
          {passed ? (
            <div className="flex items-center gap-1.5 text-mint font-semibold text-sm">
              <CheckCircle2 className="h-4 w-4" /> All Tests Passed ({testsPassed}/{totalTests})
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-coral font-semibold text-sm">
              <XCircle className="h-4 w-4" /> Tests Failed ({testsPassed}/{totalTests})
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-light">
          <span className="flex items-center gap-1 bg-ink-700 px-2.5 py-1 rounded-md">
            <Clock className="h-3 w-3 text-signal" /> {runtimeMs}ms
          </span>
          {complexityAnalysis && (
            <>
              <Badge tone="signal" className="font-mono">
                Time: {complexityAnalysis.timeComplexity}
              </Badge>
              <Badge tone="default" className="font-mono">
                Space: {complexityAnalysis.spaceComplexity}
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Individual Test Cases */}
      {testResults && testResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-slate font-medium">Test Suite Breakdown</p>
          <div className="grid grid-cols-1 gap-2">
            {testResults.map((tc) => (
              <div
                key={tc.testIndex}
                className={`p-3 rounded-lg border text-xs font-mono ${
                  tc.passed
                    ? 'border-mint/20 bg-mint/5 text-mint'
                    : 'border-coral/20 bg-coral/5 text-coral'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">
                    Case {tc.testIndex} {tc.isHidden && '(Hidden Test)'}
                  </span>
                  <span>{tc.passed ? '✓ Passed' : '✗ Failed'}</span>
                </div>
                <div className="text-[11px] text-slate-light space-y-0.5 mt-1">
                  <p><span className="text-slate">Input:</span> {tc.input}</p>
                  <p><span className="text-slate">Expected:</span> {tc.expected}</p>
                  {!tc.passed && <p><span className="text-coral">Actual:</span> {tc.actual}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Complexity & Optimization Feedback */}
      {complexityAnalysis && (
        <div className="p-3.5 rounded-lg border border-signal/20 bg-signal/5 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-signal font-semibold">
            <Cpu className="h-4 w-4" /> AI Algorithmic & Complexity Analysis
          </div>
          {complexityAnalysis.codeQuality && (
            <p className="text-slate-light">{complexityAnalysis.codeQuality}</p>
          )}
          {complexityAnalysis.optimizationChallenge && (
            <div className="mt-2 p-2 rounded bg-ink-700/80 text-signal-soft border border-signal/10 flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-signal mt-0.5 shrink-0" />
              <div>
                <span className="font-semibold text-paper">Follow-Up Challenge: </span>
                {complexityAnalysis.optimizationChallenge}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stdout Logs */}
      {stdout && (
        <div className="mt-2 text-xs">
          <p className="text-slate font-mono text-[11px] mb-1">Standard Output (console.log):</p>
          <pre className="p-2.5 rounded bg-ink-900 border border-neutral/10 text-slate-light font-mono text-[11px] overflow-x-auto">
            {stdout}
          </pre>
        </div>
      )}

      {/* Stderr Error */}
      {stderr && (
        <div className="mt-2 text-xs">
          <p className="text-coral font-mono text-[11px] mb-1">Error Trace:</p>
          <pre className="p-2.5 rounded bg-coral/10 border border-coral/20 text-coral font-mono text-[11px] overflow-x-auto">
            {stderr}
          </pre>
        </div>
      )}
    </div>
  );
}
