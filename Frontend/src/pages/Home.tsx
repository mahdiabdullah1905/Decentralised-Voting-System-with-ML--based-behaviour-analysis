
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVote } from '../contexts/VoteContext';
import { Shield, Lock, Zap } from 'lucide-react';

const Home: React.FC = () => {
    const { account, connectWallet, isLoading } = useVote();
    const navigate = useNavigate();

    const handleAction = async () => {
        if (account) {
            navigate('/vote');
        } else {
            await connectWallet();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 animate-pulse delay-1000"></div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Decentralized <br />
                <span className="gradient-text">Voting System</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mb-12">
                Secure, transparent, and AI-powered voting platform.
                Leveraging blockchain for immutability and Machine Learning for anomaly detection.
            </p>

            <button
                onClick={handleAction}
                className="btn-primary text-lg px-8 py-3 rounded-full shadow-xl shadow-primary/25 hover:scale-105 transition-transform"
            >
                {account ? "Go to Dashboard" : "Get Started"}
            </button>

            <div className="grid md:grid-cols-3 gap-8 mt-20 text-left">
                <FeatureCard
                    icon={<Shield className="w-8 h-8 text-primary" />}
                    title="Secure & Immutable"
                    description="Every vote is recorded on the blockchain, ensuring it cannot be tampered with or deleted."
                />
                <FeatureCard
                    icon={<Lock className="w-8 h-8 text-secondary" />}
                    title="ML-Powered Security"
                    description="Advanced behavior analysis detects and prevents bot activity and fraudulent voting attempts."
                />
                <FeatureCard
                    icon={<Zap className="w-8 h-8 text-amber-500" />}
                    title="Real-time Results"
                    description="View election results instantly as votes are cast, with full transparency."
                />
            </div>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
    <div className="card bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

export default Home;
