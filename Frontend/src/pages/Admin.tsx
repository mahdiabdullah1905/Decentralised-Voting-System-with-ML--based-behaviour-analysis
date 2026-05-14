
import React, { useState } from 'react';
import { useVote } from '../contexts/VoteContext';
import { Plus, Play, Square, Loader, Activity, ShieldAlert, Users } from 'lucide-react';
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend, ErrorBar
} from 'recharts';

interface AnalysisLog {
    anomaly_score: number;
    is_anomaly: boolean;
    cluster: number;
    timestamp: number;
    voteTime: number;
    attempts: number;
    wallet: string;
}

const Admin: React.FC = () => {
    const {
        candidates,
        addCandidate,
        startElection,
        endElection,
        resetElection,
        electionStarted,
        electionEnded,
        isAdmin,
        isLoading,
        account,
        disconnectWallet
    } = useVote();

    const [newCandidateName, setNewCandidateName] = useState('');
    const [history, setHistory] = useState<AnalysisLog[]>([]);
    const [centroids, setCentroids] = useState<any[]>([]);
    const [isSimulating, setIsSimulating] = useState(false);

    React.useEffect(() => {
        // Fetch current session data on load
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            console.log("Fetching history from http://127.0.0.1:5000/history");
            const res = await fetch('http://127.0.0.1:5000/history', {
                cache: "no-store",
                headers: {
                    "Cache-Control": "no-cache"
                }
            });

            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

            const textData = await res.text();
            let data;
            try {
                data = JSON.parse(textData);
            } catch (e) {
                console.error("JSON Parse Error:", e);
                data = [];
            }
            setHistory(Array.isArray(data) ? data : []);

            // Also fetch centroids
            try {
                const resC = await fetch('http://127.0.0.1:5000/centroids');
                if (resC.ok) {
                    const cData = await resC.json();
                    setCentroids(cData);
                }
            } catch (e) { console.error("Centroid fetch failed", e); }

        } catch (err) {
            console.error("Failed to fetch history", err);
            setHistory([]);
        }
    };

    const clearHistory = async () => {
        try {
            await fetch('http://127.0.0.1:5000/clear', { method: 'POST' });
            setHistory([]);
            setCentroids([]);
            alert("Analysis history cleared.");
        } catch (e) {
            console.error("Failed to clear history", e);
        }
    };

    const runSimulation = async () => {
        if (isSimulating) return;
        setIsSimulating(true);
        let successCount = 0;
        let failCount = 0;

        try {
            // Clear previous history first
            await fetch('http://127.0.0.1:5000/clear', { method: 'POST' });
            setHistory([]);

            // Gaussian random helper
            const gaussianRandom = (mean: number, stdev: number) => {
                const u = 1 - Math.random();
                const v = Math.random();
                const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
                return z * stdev + mean;
            };

            for (let i = 0; i < 100; i++) {
                // 70% Normal, 30% Anomaly for simulation
                const isNormal = Math.random() > 0.3;
                let voteTime, attempts;

                if (isNormal) {
                    voteTime = Math.max(3, Math.min(25, gaussianRandom(12, 4)));
                    attempts = Math.random() < 0.85 ? 1 : 2;
                } else {
                    voteTime = Math.max(0.2, Math.min(4, gaussianRandom(1.5, 0.7)));
                    attempts = Math.floor(Math.random() * (6 - 2 + 1)) + 2;
                }

                try {
                    const payload = {
                        wallet: `0xSimulated${Math.floor(Math.random() * 10000)}`,
                        voteTime: voteTime,
                        timestamp: Date.now(),
                        attempts: attempts
                    };

                    const res = await fetch('http://127.0.0.1:5000/analyze', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (res.ok) successCount++;
                    else failCount++;

                } catch (e) { failCount++; }

                // update history every 5 requests
                if (i % 5 === 0) await fetchHistory();

                // Slow down loop
                await new Promise(r => setTimeout(r, 50));
            }
            await fetchHistory();
            alert(`Simulation Done! Success: ${successCount}, Failed: ${failCount}`);
        } catch (err) {
            console.error("Simulation error", err);
        } finally {
            setIsSimulating(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCandidateName) return;
        await addCandidate(newCandidateName);
        setNewCandidateName('');
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    {account && (
                        <div className="flex items-center gap-4 mt-1">
                            <p className="text-sm text-gray-400 font-mono">
                                Connected: <span className="text-blue-400">{account}</span>
                                {isAdmin && <span className="ml-2 text-green-400">(Admin)</span>}
                            </p>
                            <button
                                onClick={disconnectWallet}
                                className="text-xs bg-red-900/40 hover:bg-red-900/60 text-red-200 px-3 py-1 rounded border border-red-800/50 transition-colors"
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={async () => {
                            await fetch('http://127.0.0.1:5000/test_populate');
                            fetchHistory();
                        }}
                        className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Force Add Data
                    </button>
                    <button
                        onClick={async () => {
                            try {
                                const res = await fetch('http://127.0.0.1:5000/history');
                                const text = await res.text();
                                alert(`Server Response: ${res.status} ${res.statusText}\nData: ${text.substring(0, 100)}...`);
                                fetchHistory();
                            } catch (e: any) {
                                alert(`Connection Error: ${e.message}`);
                            }
                        }}
                        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                    >
                        Test Server Connection
                    </button>
                    {isLoading && <span className="text-yellow-500 flex items-center gap-2"><Loader className="animate-spin" /> Processing Blockchain...</span>}
                </div>
            </div>

            {/* Election Control */}
            <div className="card mb-8">
                <h2 className="text-xl font-bold mb-4">Election Control</h2>
                <div className="flex gap-4 items-center">
                    <div className="flex-1">
                        <p className="text-gray-400">Current Status:</p>
                        <p className={`text-xl font-bold ${electionStarted && !electionEnded ? "text-green-500" : electionEnded ? "text-red-500" : "text-yellow-500"}`}>
                            {electionStarted && !electionEnded ? "Active" : electionEnded ? "Ended" : "Not Started"}
                        </p>
                    </div>

                    {!electionStarted && !electionEnded && (
                        <button
                            onClick={startElection}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
                        >
                            {isLoading ? <Loader className="animate-spin" /> : <Play size={20} />}
                            Start Election
                        </button>
                    )}

                    {electionStarted && !electionEnded && (
                        <button
                            onClick={endElection}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
                        >
                            {isLoading ? <Loader className="animate-spin" /> : <Square size={20} />}
                            End Election
                        </button>
                    )}

                    {electionEnded && (
                        <button
                            onClick={resetElection}
                            disabled={isLoading}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
                        >
                            {isLoading ? <Loader className="animate-spin" /> : <Play size={20} />}
                            Reset Election
                        </button>
                    )}

                    <div className="ml-auto border-l pl-4 border-slate-700 flex gap-2">
                        <button
                            onClick={clearHistory}
                            className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
                        >
                            Clear Data
                        </button>
                        <button
                            onClick={runSimulation}
                            disabled={isSimulating}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2"
                        >
                            {isSimulating ? <Loader className="animate-spin" /> : <Activity size={20} />}
                            Simulate 100 Votes
                        </button>
                    </div>
                </div>

                {/* Analytics Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                    {/* Isolation Forest Section */}
                    <div className="card border-l-4 border-l-red-500">
                        <div className="flex items-center gap-2 mb-6">
                            <ShieldAlert className="text-red-500" />
                            <h2 className="text-xl font-bold">Security Analysis (Isolation Forest)</h2>
                        </div>

                        <div className="grid gap-6">
                            {/* Isolation Forest Chart */}
                            <div className="h-96 bg-slate-900/50 rounded-lg p-4">
                                <h3 className="text-sm text-gray-400 mb-2">Anomaly Detection (X: Time, Y: Anomaly Score)</h3>
                                <p className="text-xs text-slate-500 mb-2">Lower score = More Anomalous</p>
                                {history.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis
                                                type="number"
                                                dataKey="voteTime"
                                                name="Time Taken"
                                                unit="s"
                                                stroke="#94a3b8"
                                                domain={[0, 'dataMax + 2']}
                                            />
                                            <YAxis
                                                type="number"
                                                dataKey="anomaly_score"
                                                name="Anomaly Score"
                                                stroke="#94a3b8"
                                                domain={['auto', 'auto']}
                                            />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />
                                            <Scatter name="Votes" data={history} fill="#8884d8">
                                                {history.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.is_anomaly ? '#ef4444' : '#22c55e'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500">
                                        No data available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* K-Means Section */}
                    <div className="card border-l-4 border-l-blue-500">
                        <div className="flex items-center gap-2 mb-6">
                            <Users className="text-blue-500" />
                            <h2 className="text-xl font-bold">Behavior Clustering (K-Means)</h2>
                        </div>

                        <div className="h-96 bg-slate-900/50 rounded-lg p-4">
                            <h3 className="text-sm text-gray-400 mb-2">Voter Clusters (PCA Projection) + Centroids (X)</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis type="number" dataKey="pca_1" name="PC 1" stroke="#94a3b8" />
                                    <YAxis type="number" dataKey="pca_2" name="PC 2" stroke="#94a3b8" />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155' }} />

                                    {/* Main Data Points */}
                                    <Scatter name="Voters" data={history} fill="#8884d8" opacity={0.6}>
                                        {history.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#ef4444', '#f59e0b', '#ec4899'][entry.cluster % 4]} />
                                        ))}
                                    </Scatter>

                                    {/* Centroids */}
                                    <Scatter name="Centroids" data={centroids} shape="cross" fill="#ffffff" legendType="cross">
                                        <ErrorBar dataKey="errorY" width={0} strokeWidth={2} stroke="white" direction="y" />
                                        {centroids.map((entry, index) => (
                                            <Cell key={`center-${index}`} fill="white" stroke="white" strokeWidth={2} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                            <div className="mt-4 text-xs text-gray-400 flex gap-4">
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> Normal Behavior</div>
                                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Anomalous/Bot</div>
                                <div className="flex items-center gap-1"><span className="text-white font-bold text-lg">×</span> Centroids</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Debug Data Table */}
                <div className="card mb-8">
                    <h2 className="text-xl font-bold mb-4">Raw Data Debug </h2>
                    <div className="max-h-60 overflow-y-auto bg-slate-900 p-4 rounded text-xs font-mono">
                        {history.length === 0 ? (
                            <p className="text-gray-500">No data in history state.</p>
                        ) : (
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-700">
                                        <th className="p-2">Time</th>
                                        <th className="p-2">VoteTime</th>
                                        <th className="p-2">Attempts</th>
                                        <th className="p-2">Anomaly?</th>
                                        <th className="p-2">Cluster</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.slice(-10).map((h, i) => (
                                        <tr key={i} className="border-b border-gray-800">
                                            <td className="p-2">{new Date(h.timestamp).toLocaleTimeString()}</td>
                                            <td className="p-2">{Number(h.voteTime).toFixed(2)}</td>
                                            <td className="p-2">{h.attempts}</td>
                                            <td className={`p-2 ${h.is_anomaly ? 'text-red-500' : 'text-green-500'}`}>{h.is_anomaly ? 'YES' : 'NO'}</td>
                                            <td className="p-2">{h.cluster}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <p className="mt-2 text-gray-500">Showing last 10 records. Total: {history.length}</p>
                    </div>
                </div>

                {/* Add Candidate */}
                <div className="card mb-8">
                    <h2 className="text-xl font-bold mb-4">Add Candidates</h2>
                    {electionStarted ? (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg">
                            Cannot add candidates while election is active or ended.
                        </div>
                    ) : !isAdmin ? (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
                            Only the contract owner (admin) can add candidates.
                        </div>
                    ) : (
                        <form onSubmit={handleAdd} className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Candidate Name"
                                value={newCandidateName}
                                onChange={(e) => setNewCandidateName(e.target.value)}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !newCandidateName}
                                className="btn-primary flex items-center gap-2"
                            >
                                {isLoading ? <Loader className="animate-spin" /> : <Plus size={20} />}
                                Add
                            </button>
                        </form>
                    )}
                </div>

                {/* Candidate List */}
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Registered Candidates</h2>
                    {candidates.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No candidates added yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {candidates.map((c) => (
                                <div key={c.id} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                                    <span className="font-bold text-lg">#{c.id} {c.name}</span>
                                    <span className="text-gray-400">{c.voteCount} votes</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;
