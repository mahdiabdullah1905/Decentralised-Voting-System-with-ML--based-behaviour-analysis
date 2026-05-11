
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers, BrowserProvider, Contract } from 'ethers';
import VotingAbi from '../abi/Voting.json';

// UPDATE THIS ADDRESS AFTER DEPLOYMENT
const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

declare global {
    interface Window {
        ethereum: any;
    }
}

interface Candidate {
    id: number;
    name: string;
    voteCount: number;
}

interface VoteContextType {
    account: string | null;
    provider: BrowserProvider | null;
    contract: Contract | null;
    connectWallet: () => Promise<void>;
    candidates: Candidate[];
    electionStarted: boolean;
    electionEnded: boolean;
    isAdmin: boolean;
    hasVoted: boolean;
    isLoading: boolean;
    isInitializing: boolean;
    refreshData: () => Promise<void>;
    castVote: (candidateId: number) => Promise<void>;
    addCandidate: (name: string) => Promise<void>;
    startElection: () => Promise<void>;
    endElection: () => Promise<void>;
    resetElection: () => Promise<void>;
    disconnectWallet: () => void;
}

const VoteContext = createContext<VoteContextType | undefined>(undefined);

export const VoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [contract, setContract] = useState<Contract | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [electionStarted, setElectionStarted] = useState(false);
    const [electionEnded, setElectionEnded] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                if (window.ethereum) {
                    const _provider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(_provider);

                    try {
                        const accounts = await _provider.listAccounts();
                        if (accounts.length > 0) {
                            const address = await accounts[0].getAddress();
                            setAccount(address);
                            await initContract(_provider, address);
                        }
                    } catch (err) {
                        console.error("Error listing accounts:", err);
                    }

                    window.ethereum.on('accountsChanged', async (accounts: string[]) => {
                        if (accounts.length > 0) {
                            // accounts returned by event are strings
                            setAccount(accounts[0]);
                            await initContract(_provider, accounts[0]);
                        } else {
                            setAccount(null);
                            setContract(null);
                            setIsAdmin(false);
                        }
                    });
                } else {
                    console.warn("Metamask not detected");
                }
            } finally {
                setIsInitializing(false);
            }
        };
        init();
    }, []);

    const initContract = async (_provider: BrowserProvider, _account: string) => {
        const signer = await _provider.getSigner();
        const _contract = new ethers.Contract(CONTRACT_ADDRESS, VotingAbi, signer);
        setContract(_contract);
        await fetchData(_contract, _account);
    };

    const fetchData = async (_contract: Contract, _account: string) => {
        try {
            // Check owner
            const owner = await _contract.owner();
            console.log("Connected:", _account);
            console.log("Contract Owner:", owner);
            console.log("Is Owner?", owner.toLowerCase() === _account.toLowerCase());

            setIsAdmin(owner.toLowerCase() === _account.toLowerCase());

            // Status
            const [started, ended] = await _contract.getElectionStatus();
            setElectionStarted(started);
            setElectionEnded(ended);

            // Candidates
            const _candidates = await _contract.getAllCandidates();
            const formattedCandidates = _candidates.map((c: any) => ({
                id: Number(c.id),
                name: c.name,
                voteCount: Number(c.voteCount)
            }));
            setCandidates(formattedCandidates);

            // Has Voted
            if (started && !ended) {
                const voted = await _contract.hasVoted(_account);
                setHasVoted(voted);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const connectWallet = async () => {
        let _provider = provider;

        if (!_provider) {
            if (window.ethereum) {
                _provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(_provider);
            } else {
                alert("Please install Metamask to use this application!");
                return;
            }
        }

        try {
            // Force Switch to Localhost
            await _provider.send("wallet_addEthereumChain", [{
                chainId: "0x7A69", // 31337
                chainName: "Hardhat Localhost",
                nativeCurrency: {
                    name: "ETH",
                    symbol: "ETH",
                    decimals: 18
                },
                rpcUrls: ["http://127.0.0.1:8545"]
            }]);

            await _provider.send("wallet_switchEthereumChain", [{ chainId: "0x7A69" }]);

            // eth_requestAccounts returns string[]
            const accounts = await _provider.send("eth_requestAccounts", []);
            if (accounts.length > 0) {
                setAccount(accounts[0]);
                await initContract(_provider, accounts[0]);
            }
        } catch (error) {
            console.error("Connection failed", error);
            alert("Failed to connect. Please ensure you are on Localhost:8545 (Chain ID 31337).");
        }
    };

    const refreshData = async () => {
        if (contract && account) {
            await fetchData(contract, account);
        }
    };

    const castVote = async (candidateId: number) => {
        if (!contract) return;
        try {
            setIsLoading(true);
            const tx = await contract.castVote(candidateId);
            await tx.wait();
            await refreshData();
        } catch (error: any) {
            console.error("Error casting vote:", error);
            alert(`Error casting vote: ${error.reason || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const addCandidate = async (name: string) => {
        if (!contract) return;
        try {
            setIsLoading(true);
            const tx = await contract.addCandidate(name);
            await tx.wait();
            await refreshData();
        } catch (error: any) {
            console.error("Error adding candidate:", error);
            alert(`Error adding candidate: ${error.reason || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const startElection = async () => {
        if (!contract) return;
        try {
            setIsLoading(true);
            const tx = await contract.startElection();
            await tx.wait();
            await refreshData();
        } catch (error: any) {
            console.error("Error starting election:", error);
            alert(`Error starting election: ${error.reason || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const endElection = async () => {
        if (!contract) return;
        setIsLoading(true);
        try {
            const tx = await contract.endElection();
            await tx.wait();
            await refreshData();
        } catch (error: any) {
            console.error("Error ending election:", error);
            alert(`Error ending election: ${error.reason || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const resetElection = async () => {
        if (!contract) return;
        setIsLoading(true);
        try {
            const tx = await contract.resetElection();
            await tx.wait();
            await refreshData();
        } catch (error: any) {
            console.error("Error resetting election:", error);
            alert(`Error resetting election: ${error.reason || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const disconnectWallet = () => {
        setAccount(null);
        setContract(null);
        setIsAdmin(false);
        setCandidates([]);
        setElectionStarted(false);
        setElectionEnded(false);
        setHasVoted(false);
    };

    return (
        <VoteContext.Provider value={{
            account, provider, contract, connectWallet,
            candidates, electionStarted, electionEnded, isAdmin, hasVoted, isLoading, isInitializing,
            refreshData, castVote, addCandidate, startElection, endElection, resetElection, disconnectWallet
        }}>
            {children}
        </VoteContext.Provider>
    );
};

export const useVote = () => {
    const context = useContext(VoteContext);
    if (!context) {
        throw new Error('useVote must be used within a VoteProvider');
    }
    return context;
};
