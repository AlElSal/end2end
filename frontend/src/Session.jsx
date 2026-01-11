import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { Share2, ArrowLeft, Users } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import Console from './components/Console';

export default function Session() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [code, setCode] = useState('// Loading...');
    const [output, setOutput] = useState([]);
    const [language, setLanguage] = useState('javascript');
    const [participantCount, setParticipantCount] = useState(1);
    const [isRunning, setIsRunning] = useState(false);

    const socketRef = useRef();

    // Initialize Session
    useEffect(() => {
        // Connect to Socket server
        socketRef.current = io('http://localhost:3001');

        socketRef.current.on('connect', () => {
            console.log('Connected to socket server');
            socketRef.current.emit('join-session', sessionId);
        });

        socketRef.current.on('init-session', (data) => {
            setCode(data.code);
            setLanguage(data.language);
        });

        socketRef.current.on('code-update', (newCode) => {
            setCode(newCode);
        });

        socketRef.current.on('language-update', (newLang) => {
            setLanguage(newLang);
        });

        socketRef.current.on('user-joined', ({ count }) => {
            setParticipantCount(count);
        });

        socketRef.current.on('user-left', ({ count }) => {
            setParticipantCount(count);
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, [sessionId]);

    // Code Change Handler
    const handleCodeChange = (newCode) => {
        setCode(newCode); // Optimistic update
        socketRef.current.emit('code-change', { sessionId, code: newCode });
    };

    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setLanguage(newLang);
        socketRef.current.emit('language-change', { sessionId, language: newLang });
    };

    const [pyodide, setPyodide] = useState(null);
    const [isPyLoading, setIsPyLoading] = useState(false);

    // Load Pyodide lazily
    const loadPyodide = async () => {
        if (pyodide) return pyodide;
        setIsPyLoading(true);
        try {
            // Load script dynamically
            if (!window.loadPyodide) {
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js";
                document.head.appendChild(script);
                await new Promise((resolve) => (script.onload = resolve));
            }
            const py = await window.loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/"
            });
            setPyodide(py);
            setIsPyLoading(false);
            return py;
        } catch (err) {
            console.error("Failed to load Pyodide", err);
            setIsPyLoading(false);
            return null;
        }
    };

    // Run Code
    const runCode = async () => {
        setIsRunning(true);
        setOutput([]);

        if (language === 'javascript') {
            executeJS();
        } else if (language === 'python') {
            await executePython();
        } else {
            setOutput(prev => [...prev, { type: 'error', content: `Execution for ${language} is not supported yet.` }]);
            setIsRunning(false);
        }
    };

    const executePython = async () => {
        const py = await loadPyodide();
        if (!py) {
            setOutput(prev => [...prev, { type: 'error', content: "Failed to load Python environment." }]);
            setIsRunning(false);
            return;
        }

        try {
            // Redirect stdout
            py.setStdout({
                batched: (str) => {
                    setOutput(prev => [...prev, { type: 'log', content: str }]);
                }
            });
            py.setStderr({
                batched: (str) => {
                    setOutput(prev => [...prev, { type: 'error', content: str }]);
                }
            });

            await py.runPythonAsync(code);
        } catch (err) {
            setOutput(prev => [...prev, { type: 'error', content: err.toString() }]);
        } finally {
            setIsRunning(false);
        }
    };

    const executeJS = () => {
        // Create a worker to run the code
        const workerCode = `
      self.onmessage = function(e) {
        const code = e.data;
        
        // Override console
        console.log = (...args) => self.postMessage({ type: 'log', content: args.join(' ') });
        console.error = (...args) => self.postMessage({ type: 'error', content: args.join(' ') });
        
        try {
           const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
           const func = new AsyncFunction(code);
           func().then(() => self.postMessage({ type: 'done' }))
                .catch(err => { console.error(err.toString()); self.postMessage({ type: 'done' }); });
        } catch (err) {
          console.error(err.toString());
          self.postMessage({ type: 'done' });
        }
      };
    `;

        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const timeout = setTimeout(() => {
            worker.terminate();
            setOutput(prev => [...prev, { type: 'error', content: 'Execution timed out (5s limit)' }]);
            setIsRunning(false);
        }, 5000);

        worker.onmessage = (e) => {
            const { type, content } = e.data;
            if (type === 'done') {
                clearTimeout(timeout);
                setIsRunning(false);
                worker.terminate();
            } else {
                setOutput(prev => [...prev, { type, content }]);
            }
        };

        worker.postMessage(code);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="h-full flex flex-col bg-slate-900 text-white">
            {/* Navbar */}
            <header className="h-14 border-b border-slate-700 bg-slate-800 flex items-center justify-between px-4 z-10">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="font-bold text-lg flex items-center gap-2">
                        <span className="text-blue-500">Code</span>Sync
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-full text-xs text-slate-300">
                        <Users size={12} /> {participantCount} Active
                    </div>
                    <button onClick={copyLink} className="btn btn-secondary text-sm py-1 px-3">
                        <Share2 size={14} /> Share
                    </button>
                    <div className="flex items-center bg-slate-700 rounded-md overflow-hidden border border-slate-600">
                        <select
                            value={language}
                            onChange={handleLanguageChange}
                            className="bg-transparent text-sm px-3 py-1 outline-none cursor-pointer text-slate-200"
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="cpp">C++</option>
                            <option value="html">HTML</option>
                        </select>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Editor Area */}
                <div className="flex-1 relative min-h-0">
                    <CodeEditor
                        code={code}
                        onChange={handleCodeChange}
                        language={language}
                    />
                </div>

                {/* Console Panel - Fixed Bottom Layout */}
                <div className="h-300px w-full border-t border-slate-700 shrink-0 flex flex-col bg-slate-900">
                    <Console
                        output={output}
                        onRun={runCode}
                        onClear={() => setOutput([])}
                        isRunning={isRunning}
                    />
                </div>
            </div>
        </div>
    );
}
