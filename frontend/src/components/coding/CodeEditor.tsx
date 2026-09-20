import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CodeEditorProps {
  initialCode?: string;
  language?: string;
  onCodeChange: (code: string) => void;
  onRunCode: () => void;
  isRunning?: boolean;
}

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript (Node.js)' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python 3' },
  { id: 'cpp', label: 'C++' },
  { id: 'java', label: 'Java' },
  { id: 'go', label: 'Go' },
];

export default function CodeEditor({
  initialCode = '// Write your solution here\n',
  language = 'javascript',
  onCodeChange,
  onRunCode,
  isRunning = false,
}: CodeEditorProps) {
  const [selectedLang, setSelectedLang] = useState(language);
  const [code, setCode] = useState(initialCode);

  const handleEditorChange = (value?: string) => {
    const updated = value || '';
    setCode(updated);
    onCodeChange(updated);
  };

  const handleReset = () => {
    setCode(initialCode);
    onCodeChange(initialCode);
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-neutral/10 bg-[#1e1e1e] overflow-hidden shadow-2xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-neutral/10 bg-[#252526] px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="font-mono text-signal font-semibold">CODE STUDIO</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="rounded bg-[#333333] px-2.5 py-1 text-slate-light text-xs font-mono outline-none border border-neutral/10 focus:border-signal/60"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-slate-light hover:text-paper px-2 py-1 transition-colors"
            title="Reset code"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <Button size="sm" onClick={onRunCode} isLoading={isRunning} className="gap-1.5 font-mono">
            <Play className="h-3.5 w-3.5 fill-current" /> Run Test Suite
          </Button>
        </div>
      </div>

      {/* Monaco Editor / Fallback */}
      <div className="flex-1 min-h-[380px]">
        <Editor
          height="100%"
          language={selectedLang === 'cpp' ? 'cpp' : selectedLang}
          value={code}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, monospace",
            fontLigatures: true,
            tabSize: 2,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
          }}
          loading={
            <div className="flex h-full items-center justify-center bg-[#1e1e1e] text-slate-light font-mono text-xs">
              <Sparkles className="h-4 w-4 animate-spin mr-2 text-signal" /> Loading Code Studio...
            </div>
          }
        />
      </div>
    </div>
  );
}
