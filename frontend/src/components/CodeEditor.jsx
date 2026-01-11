import React from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, onChange, language = 'javascript' }) {
    // Common themes: vs-dark is built-in

    const handleEditorChange = (value) => {
        onChange(value);
    };

    return (
        <div className="h-full w-full overflow-hidden border-r border-slate-700">
            <Editor
                height="100%"
                defaultLanguage="javascript"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={handleEditorChange}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    automaticLayout: true,
                    padding: { top: 20 },
                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    fontLigatures: true,
                }}
            />
        </div>
    );
}
