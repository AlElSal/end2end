import React from 'react';
import { Terminal as TerminalIcon, Play, Trash2 } from 'lucide-react';

export default function Console({ output, onRun, onClear, isRunning }) {
    return (
        <div className="h-full flex flex-col" style={{ background: '#0d1117' }}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800">
                <div className="flex items-center gap-2 text-slate-300">
                    <TerminalIcon size={16} />
                    <span className="font-semibold text-sm">Console</span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onClear}
                        className="p-1 hover:bg-slate-700 rounded text-slate-400"
                        title="Clear Console"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={onRun}
                        disabled={isRunning}
                        className="btn btn-primary py-1 px-3 text-sm flex gap-1"
                    >
                        <Play size={14} /> Run
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-auto font-mono text-sm">
                {output.length === 0 && (
                    <div className="text-slate-500 italic">Hit 'Run' to execute code...</div>
                )}
                {output.map((log, i) => (
                    <div key={i} className={`mb-1 ${log.type === 'error' ? 'text-red-400' : 'text-slate-300'}`}>
                        <span className="opacity-50 select-none mr-2">{'>'}</span>
                        {log.content}
                    </div>
                ))}
                {isRunning && <div className="text-blue-400 mt-2">Running...</div>}
            </div>
        </div>
    );
}
