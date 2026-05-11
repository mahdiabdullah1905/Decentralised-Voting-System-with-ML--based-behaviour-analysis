import React from 'react';
import { useVote } from '../contexts/VoteContext';
import { Trophy, Users, BarChart } from 'lucide-react';

const Results: React.FC = () => {
    const { candidates, electionEnded } = useVote();

    if (!electionEnded) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 max-w-lg text-center shadow-xl">
                    <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Results Not Available Yet</h2>
                    <p className="text-slate-400">
                        The election is currently ongoing or hasn't started. Results will be published here once the election concludes.
                    </p>
                </div>
            </div>
        );
    }

    if (candidates.length === 0) {
        return (
            <div className="flex justify-center py-20">
                <p className="text-slate-400">No candidates found for this election.</p>
            </div>
        );
    }

    // Sort candidates descending by vote count
    const sortedCandidates = [...candidates].sort((a, b) => b.voteCount - a.voteCount);
    
    const totalVotes = candidates.reduce((sum, c) => sum + c.voteCount, 0);
    const topVotes = sortedCandidates[0].voteCount;
    
    // Find all candidates that tie for first place
    const winners = sortedCandidates.filter(c => c.voteCount === topVotes);
    
    // The runner-up is the first candidate in the sorted list who is NOT one of the winners
    const runnerUp = sortedCandidates.find(c => c.voteCount < topVotes);
    const victoryMargin = runnerUp ? topVotes - runnerUp.voteCount : topVotes;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold gradient-text pb-2">Election Results</h1>
                <p className="text-slate-400 text-lg">The final results are in!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-4">
                    <div className="bg-primary/20 p-4 rounded-xl text-primary">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium">Total Votes</p>
                        <p className="text-3xl font-bold">{totalVotes}</p>
                    </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex items-center gap-4 md:col-span-2">
                    <div className="bg-yellow-500/20 p-4 rounded-xl text-yellow-500">
                        <Trophy className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 font-medium">
                            {winners.length > 1 ? "It's a Tie!" : "Official Winner"}
                        </p>
                        <p className="text-2xl font-bold text-yellow-400">
                            {winners.map(w => w.name).join(", ")}
                        </p>
                    </div>
                </div>
            </div>

            {winners.length === 1 && totalVotes > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl text-center">
                    <p className="text-emerald-400 text-lg">
                        <strong>{winners[0].name}</strong> won by a victory margin of <strong>{victoryMargin}</strong> vote{victoryMargin !== 1 ? 's' : ''}!
                    </p>
                </div>
            )}

            <div className="bg-slate-800/80 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                <div className="p-6 border-b border-slate-700 flex items-center gap-2">
                    <BarChart className="text-primary w-5 h-5" />
                    <h3 className="text-xl font-bold">Final Tally</h3>
                </div>
                <div className="p-6">
                    <div className="space-y-6">
                        {sortedCandidates.map((candidate, index) => {
                            const isWinner = candidate.voteCount === topVotes && topVotes > 0;
                            const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : "0.0";
                            
                            return (
                                <div key={candidate.id} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                                index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                                                index === 1 ? 'bg-slate-400/20 text-slate-400' :
                                                index === 2 ? 'bg-amber-700/20 text-amber-500' :
                                                'bg-slate-800 text-slate-500'
                                            }`}>
                                                #{index + 1}
                                            </span>
                                            <span className={`text-lg font-medium ${isWinner ? 'text-yellow-400' : 'text-white'}`}>
                                                {candidate.name}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-bold">{candidate.voteCount}</span>
                                            <span className="text-slate-400 text-sm ml-1">votes ({percentage}%)</span>
                                        </div>
                                    </div>
                                    <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${
                                                isWinner ? 'bg-yellow-500' : 'bg-primary'
                                            }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Results;
