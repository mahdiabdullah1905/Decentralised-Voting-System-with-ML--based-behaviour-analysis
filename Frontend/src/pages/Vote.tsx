
import React, { useEffect, useState } from 'react';
import { useVote } from '../contexts/VoteContext';
import { Check, ShieldAlert, Loader } from 'lucide-react';

const Vote: React.FC = () => {
    const { candidates, castVote, electionStarted, electionEnded, hasVoted, account } = useVote();
    const [votingId, setVotingId] = useState<number | null>(null);
    const [showSurveyFor, setShowSurveyFor] = useState<number | null>(null);
    const [region, setRegion] = useState('');
    const [reason, setReason] = useState('');
    const [pageLoadTime] = useState(Date.now());
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<{ score: number; cluster: number; is_anomaly: boolean } | null>(null);

    const openSurvey = (candidateId: number) => {
        setShowSurveyFor(candidateId);
        setRegion('');
        setReason('');
    };

    const executeVote = async (has_survey: boolean) => {
        if (showSurveyFor === null) return;
        const candidateId = showSurveyFor;
        setShowSurveyFor(null);
        
        setError(null);
        setAnalysisResult(null);
        setVotingId(candidateId);

        const now = Date.now();
        const voteTime = (now - pageLoadTime) / 1000; // seconds taken to vote

        try {
            console.log("Analyzing behavior...");
            const response = await fetch('http://localhost:5000/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    wallet: account,
                    candidateId: candidateId,
                    voteTime: voteTime,
                    timestamp: now,
                    attempts: 1,
                    has_survey: has_survey ? 1.0 : 0.0,
                    region: has_survey ? region : null,
                    reason: has_survey ? reason : null
                })
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server error: ${text}`);
            }

            const data = await response.json();
            setAnalysisResult({
                score: data.anomaly_score,
                cluster: data.cluster,
                is_anomaly: data.is_anomaly
            });

            if (data.is_anomaly) {
                setError("Security Alert: Unusual behavior detected. Your vote has been flagged and blocked.");
                setVotingId(null);
                return;
            }

            // Proceed to vote on blockchain
            await castVote(candidateId);

        } catch (err) {
            console.error("ML Backend Error:", err);
            // Fallback: In development or if ML is down, you might want to allow voting or block it. 
            // For this demo, we'll block it to show the dependency, BUT we can assume safe if backend is just not running?
            // User requested "ML based behavior analysis", so we should show error if backend is unreachable.
            setError("Error connecting to security server. Please try again.");
        } finally {
            setVotingId(null);
        }
    };

    if (!account) {
        return (
            <div className="flex justify-center mt-20">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Connect Wallet</h2>
                    <p className="text-gray-400 mb-6">Please connect your wallet to participate in the election.</p>
                    {/* The Navbar has the connect button, so we just guide them */}
                    <div className="animate-pulse text-blue-400">
                        &uarr; Use the button in the top right
                    </div>
                </div>
            </div>
        );
    }

    if (!electionStarted) {
        return (
            <div className="flex justify-center mt-20">
                <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Election Not Started</h2>
                    <p className="text-gray-400">Please wait for the administrator to start the election.</p>
                </div>
            </div>
        );
    }

    if (electionEnded) {
        return (
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Election Results</h1>
                <div className="grid gap-6">
                    {candidates.sort((a, b) => b.voteCount - a.voteCount).map((c, index) => (
                        <div key={c.id} className="card flex justify-between items-center relative overflow-hidden">
                            {index === 0 && <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-lg">WINNER</div>}
                            <div>
                                <h3 className="text-2xl font-bold">{c.name}</h3>
                                <p className="text-gray-400">Candidate #{c.id}</p>
                            </div>
                            <div className="text-4xl font-bold text-primary">{c.voteCount}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">Cast Your Vote</h1>
            <p className="text-gray-400 mb-8">Select your preferred candidate below. Your vote is secure and immutable.</p>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-8 flex items-center gap-4 animate-shake">
                    <ShieldAlert size={24} />
                    {error}
                </div>
            )}

            {hasVoted ? (
                <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-8 rounded-xl text-center">
                    <Check size={48} className="mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">You have voted!</h2>
                    <p className="mb-4">Thank you for participating in the election.</p>

                    {analysisResult && (
                        <div className="mt-6 bg-slate-900/50 p-4 rounded-lg inline-block text-left border border-slate-700">
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2 font-bold">Behavior Analysis Report</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                <span className="text-gray-400">Status:</span>
                                <span className="text-green-400 font-mono font-bold">VERIFIED NORMAL</span>

                                <span className="text-gray-400">Anomaly Score:</span>
                                <span className="text-white font-mono">{analysisResult.score.toFixed(4)}</span>

                                <span className="text-gray-400">Behavior Cluster:</span>
                                <span className="text-white font-mono">Group {analysisResult.cluster}</span>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {candidates.map((c) => (
                        <div key={c.id} className="card hover:shadow-2xl hover:shadow-primary/10 group">
                            <div className="h-32 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg mb-4 flex items-center justify-center text-4xl font-bold text-slate-600">
                                {c.name.charAt(0)}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{c.name}</h3>
                            <p className="text-sm text-gray-500 mb-6">Candidate ID: {c.id}</p>

                            <button
                                onClick={() => openSurvey(c.id)}
                                disabled={votingId !== null}
                                className="w-full btn-primary py-3 rounded-lg font-bold flex justify-center items-center gap-2 group-hover:bg-indigo-500 transition-colors"
                            >
                                {votingId === c.id ? <Loader className="animate-spin" /> : "Vote Now"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Optional Survey Modal */}
            {showSurveyFor !== null && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-2xl font-bold mb-2">Optional Survey</h2>
                        <p className="text-slate-400 mb-6 text-sm">Help us understand our voters better! Your answers are completely anonymous.</p>
                        
                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Where are you from?</label>
                                <select 
                                    value={region} 
                                    onChange={(e) => setRegion(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select Region</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="West Bengal">West Bengal</option>
                                    <option value="Punjab">Punjab</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Why are you voting for this candidate?</label>
                                <select 
                                    value={reason} 
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-primary"
                                >
                                    <option value="">Select Reason</option>
                                    <option value="Policy Alignment">Policy Alignment</option>
                                    <option value="Past Track Record">Past Track Record</option>
                                    <option value="Campaign Promises">Campaign Promises</option>
                                    <option value="Party Affiliation">Party Affiliation</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button 
                                onClick={() => executeVote(false)}
                                className="flex-1 py-3 px-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors"
                            >
                                Skip & Vote
                            </button>
                            <button 
                                onClick={() => executeVote(true)}
                                disabled={!region || !reason}
                                className="flex-1 py-3 px-4 btn-primary rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Submit & Vote
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vote;
