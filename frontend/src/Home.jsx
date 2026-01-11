import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Code2, ArrowRight } from 'lucide-react';

export default function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const createSession = async () => {
        try {
            setLoading(true);
            // In dev, usage of full URL or proxy. Assuming proxy works or CORS allows.
            const response = await axios.post('http://localhost:3001/api/sessions');
            navigate(`/session/${response.data.sessionId}`);
        } catch (error) {
            console.error("Failed to create session", error);
            alert("Error connecting to server. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full flex-center flex-col" style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, #1e293b 0%, #0f172a 100%)' }}>
            <div className="card" style={{ maxWidth: '500px', width: '90%', textAlign: 'center' }}>
                <div className="flex-center mb-4">
                    <div style={{ padding: '1rem', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                        <Code2 size={48} />
                    </div>
                </div>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: 800 }}>Code Sync</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                    The premium platform for technical interviews. <br />
                    Real-time collaboration, instant execution.
                </p>

                <button className="btn btn-primary w-full flex-center" onClick={createSession} disabled={loading} style={{ padding: '1rem', fontSize: '1.2rem' }}>
                    {loading ? 'Creating...' : (
                        <>
                            Start New Interview <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>

            <div style={{ marginTop: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Built with React, Vite, Express & Socket.io
            </div>
        </div>
    );
}
