
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useVote } from '../contexts/VoteContext';
import { Wallet, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';

const Navbar: React.FC = () => {
    const { account, connectWallet, electionEnded } = useVote();
    const location = useLocation();

    const formatAddress = (addr: string) => {
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <nav className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold">
                    <ShieldCheck className="w-8 h-8 text-primary" />
                    <span className="gradient-text">SecureVote</span>
                </Link>

                <div className="flex items-center gap-6">
                    {account && (
                        <div className="hidden md:flex items-center gap-6">
                            <Link
                                to="/vote"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    location.pathname === '/vote' ? "text-primary" : "text-gray-400"
                                )}
                            >
                                Vote
                            </Link>

                            <Link
                                to="/admin"
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary",
                                    location.pathname === '/admin' ? "text-primary" : "text-gray-400"
                                )}
                            >
                                Admin Panel
                            </Link>
                            
                            {electionEnded && (
                                <Link
                                    to="/results"
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-yellow-400",
                                        location.pathname === '/results' ? "text-yellow-400" : "text-gray-400"
                                    )}
                                >
                                    Results
                                </Link>
                            )}

                        </div>
                    )}

                    <button
                        onClick={connectWallet}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                            account
                                ? "bg-surface border border-slate-700 text-gray-300 hover:bg-slate-700 cursor-pointer"
                                : "bg-primary hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                        )}
                        title="Click to switch wallet or network"
                    >
                        <Wallet className="w-4 h-4" />
                        {account ? formatAddress(account) : "Connect Wallet"}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
