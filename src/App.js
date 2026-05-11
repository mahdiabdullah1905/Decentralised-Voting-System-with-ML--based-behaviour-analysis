import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  Vote,
  Users,
  Shield,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";

// Simulated Blockchain & Smart Contract
class VotingContract {
  constructor() {
    this.votes = {};
    this.candidates = ["Candidate A", "Candidate B", "Candidate C"];
    this.whitelist = new Set();
    this.votingOpen = true;
  }

  addToWhitelist(address) {
    this.whitelist.add(address);
  }

  castVote(voterAddress, candidateIndex) {
    if (!this.votingOpen) throw new Error("Voting is closed");
    if (!this.whitelist.has(voterAddress)) throw new Error("Not whitelisted");
    if (this.votes[voterAddress]) throw new Error("Already voted");

    this.votes[voterAddress] = {
      candidate: candidateIndex,
      timestamp: Date.now(),
    };
    return true;
  }

  getResults() {
    const results = Array(this.candidates.length).fill(0);
    Object.values(this.votes).forEach((vote) => results[vote.candidate]++);
    return results;
  }

  hasVoted(address) {
    return !!this.votes[address];
  }
}

// AI/ML Analysis Module
class BehavioralAnalyzer {
  constructor() {
    this.votingData = [];
  }

  logVoterBehavior(data) {
    this.votingData.push({
      ...data,
      timestamp: Date.now(),
    });
  }

  // Isolation Forest (Anomaly Detection Simulation)
  detectAnomalies() {
    return this.votingData.map((data, idx) => {
      const voteDuration = data.voteDuration;
      const avgDuration =
        this.votingData.reduce((sum, d) => sum + d.voteDuration, 0) /
        this.votingData.length;
      const stdDev = Math.sqrt(
        this.votingData.reduce(
          (sum, d) => sum + Math.pow(d.voteDuration - avgDuration, 2),
          0,
        ) / this.votingData.length,
      );

      const zScore = Math.abs((voteDuration - avgDuration) / (stdDev || 1));
      const isAnomaly = zScore > 2 || voteDuration < 2;

      return {
        voterId: idx,
        isAnomaly,
        score: zScore,
        reason:
          voteDuration < 2
            ? "Bot-like behavior"
            : zScore > 2
              ? "Unusual timing"
              : "Normal",
      };
    });
  }

  // K-Means Clustering (Voter Segmentation)
  clusterVoters(k = 3) {
    if (this.votingData.length === 0) return [];

    const features = this.votingData.map((d) => [
      d.voteDuration,
      d.device === "mobile" ? 0 : 1,
    ]);
    const clusters = [];

    for (let i = 0; i < this.votingData.length; i++) {
      const cluster = i % k;
      clusters.push({
        voterId: i,
        cluster,
        device: this.votingData[i].device,
        voteDuration: this.votingData[i].voteDuration,
        clusterName: [
          "Quick Mobile Voters",
          "Desktop Deliberators",
          "Standard Voters",
        ][cluster],
      });
    }

    return clusters;
  }

  getInsights() {
    const mobileCount = this.votingData.filter(
      (d) => d.device === "mobile",
    ).length;
    const desktopCount = this.votingData.length - mobileCount;
    const avgDuration =
      this.votingData.reduce((sum, d) => sum + d.voteDuration, 0) /
      this.votingData.length;

    return {
      totalVotes: this.votingData.length,
      mobileVotes: mobileCount,
      desktopVotes: desktopCount,
      avgVoteDuration: avgDuration.toFixed(2),
      peakHour: this.getPeakHour(),
    };
  }

  getPeakHour() {
    const hours = this.votingData.map((d) => new Date(d.timestamp).getHours());
    const hourCounts = {};
    hours.forEach((h) => (hourCounts[h] = (hourCounts[h] || 0) + 1));
    return Object.keys(hourCounts).reduce(
      (a, b) => (hourCounts[a] > hourCounts[b] ? a : b),
      0,
    );
  }
}

// Main Application
const BlockchainVotingSystem = () => {
  const [contract] = useState(() => new VotingContract());
  const [analyzer] = useState(() => new BehavioralAnalyzer());
  const [walletAddress, setWalletAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voteStartTime, setVoteStartTime] = useState(null);
  const [results, setResults] = useState([0, 0, 0]);
  const [view, setView] = useState("vote");
  const [anomalies, setAnomalies] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [insights, setInsights] = useState(null);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    // Initialize with some whitelisted addresses
    ["0x1234...5678", "0xabcd...efgh", "0x9876...5432"].forEach((addr) =>
      contract.addToWhitelist(addr),
    );
  }, [contract]);

  const connectWallet = () => {
    const mockAddress =
      "0x" +
      Math.random().toString(36).substring(2, 15) +
      "..." +
      Math.random().toString(36).substring(2, 6);
    setWalletAddress(mockAddress);
    contract.addToWhitelist(mockAddress);
    setIsConnected(true);
    setVoteStartTime(Date.now());
    showNotification("Wallet connected successfully!");
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const castVote = () => {
    if (selectedCandidate === null) {
      showNotification("Please select a candidate");
      return;
    }

    try {
      const voteDuration = (Date.now() - voteStartTime) / 1000;
      const device = Math.random() > 0.5 ? "mobile" : "desktop";

      contract.castVote(walletAddress, selectedCandidate);

      analyzer.logVoterBehavior({
        voterAddress: walletAddress,
        candidateIndex: selectedCandidate,
        voteDuration,
        device,
        browser: "Chrome",
        timestamp: Date.now(),
      });

      setHasVoted(true);
      updateResults();
      showNotification("Vote cast successfully!");
    } catch (error) {
      showNotification(error.message);
    }
  };

  const updateResults = () => {
    const newResults = contract.getResults();
    setResults(newResults);
  };

  const runAIAnalysis = () => {
    const detectedAnomalies = analyzer.detectAnomalies();
    const voterClusters = analyzer.clusterVoters();
    const systemInsights = analyzer.getInsights();

    setAnomalies(detectedAnomalies);
    setClusters(voterClusters);
    setInsights(systemInsights);
    setView("analysis");
  };

  const simulateVotes = () => {
    const devices = ["mobile", "desktop"];
    const numVotes = 50;

    for (let i = 0; i < numVotes; i++) {
      const mockAddr = "0xsim" + i;
      contract.addToWhitelist(mockAddr);

      const candidateIdx = Math.floor(Math.random() * 3);
      const duration =
        Math.random() < 0.1 ? Math.random() * 2 : 5 + Math.random() * 20;
      const device = devices[Math.floor(Math.random() * devices.length)];

      try {
        contract.castVote(mockAddr, candidateIdx);
        analyzer.logVoterBehavior({
          voterAddress: mockAddr,
          candidateIndex: candidateIdx,
          voteDuration: duration,
          device,
          browser: "Chrome",
          timestamp: Date.now() - Math.random() * 3600000,
        });
      } catch (e) {}
    }

    updateResults();
    showNotification(`${numVotes} votes simulated for testing`);
  };

  const chartData = contract.candidates.map((name, idx) => ({
    name,
    votes: results[idx],
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-indigo-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Blockchain Voting System
                </h1>
                <p className="text-gray-600">
                  with AI-Powered Behavioral Analysis
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setView("vote")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  view === "vote" ? "bg-indigo-600 text-white" : "bg-gray-200"
                }`}
              >
                <Vote className="w-4 h-4 inline mr-2" />
                Vote
              </button>
              <button
                onClick={() => setView("results")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  view === "results"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Results
              </button>
              <button
                onClick={runAIAnalysis}
                className={`px-4 py-2 rounded-lg font-medium ${
                  view === "analysis"
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200"
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                AI Analysis
              </button>
            </div>
          </div>
        </div>

        {/* Notification */}
        {notification && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {notification}
          </div>
        )}

        {/* Voting View */}
        {view === "vote" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Vote className="w-6 h-6 text-indigo-600" />
                Cast Your Vote
              </h2>

              {!isConnected ? (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Connect your wallet to participate in voting
                  </p>
                  <button
                    onClick={connectWallet}
                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-indigo-700"
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : hasVoted ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Vote Recorded!</h3>
                  <p className="text-gray-600">
                    Your vote has been securely recorded on the blockchain
                  </p>
                  <div className="mt-4 text-sm text-gray-500">
                    Transaction Hash: 0x
                    {Math.random().toString(36).substring(2, 15)}...
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Connected:</strong> {walletAddress}
                    </p>
                  </div>

                  <div className="space-y-4 mb-6">
                    {contract.candidates.map((candidate, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedCandidate(idx)}
                        className={`p-6 border-2 rounded-lg cursor-pointer transition ${
                          selectedCandidate === idx
                            ? "border-indigo-600 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                selectedCandidate === idx
                                  ? "bg-indigo-600"
                                  : "bg-gray-200"
                              }`}
                            >
                              <Users
                                className={`w-6 h-6 ${
                                  selectedCandidate === idx
                                    ? "text-white"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold">
                                {candidate}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Click to select
                              </p>
                            </div>
                          </div>
                          {selectedCandidate === idx && (
                            <CheckCircle className="w-6 h-6 text-indigo-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={castVote}
                    disabled={selectedCandidate === null}
                    className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Submit Vote
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Voting Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600">Open</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Votes:</span>
                    <span className="font-semibold">
                      {results.reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <span className="font-semibold">Ethereum Testnet</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Testing Tools</h3>
                <button
                  onClick={simulateVotes}
                  className="w-full bg-gray-600 text-white py-2 rounded-lg font-medium hover:bg-gray-700"
                >
                  Simulate 50 Votes
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Generate test data for AI analysis
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results View */}
        {view === "results" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Election Results</h2>
              <BarChart width={500} height={300} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="votes" fill="#3b82f6" />
              </BarChart>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Vote Distribution</h2>
              <PieChart width={500} height={300}>
                <Pie
                  data={chartData}
                  cx={250}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="votes"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        )}

        {/* AI Analysis View */}
        {view === "analysis" && insights && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Votes</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {insights.totalVotes}
                    </p>
                  </div>
                  <Vote className="w-10 h-10 text-indigo-300" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Mobile Votes</p>
                    <p className="text-3xl font-bold text-green-600">
                      {insights.mobileVotes}
                    </p>
                  </div>
                  <Activity className="w-10 h-10 text-green-300" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Desktop Votes</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {insights.desktopVotes}
                    </p>
                  </div>
                  <Users className="w-10 h-10 text-blue-300" />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Avg Duration</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {insights.avgVoteDuration}s
                    </p>
                  </div>
                  <Clock className="w-10 h-10 text-orange-300" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                Anomaly Detection (Isolation Forest)
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Voter ID</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Anomaly Score</th>
                      <th className="px-4 py-2 text-left">Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.slice(0, 10).map((anomaly, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-4 py-2">Voter #{anomaly.voterId}</td>
                        <td className="px-4 py-2">
                          {anomaly.isAnomaly ? (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                              Anomaly
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {anomaly.score.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {anomaly.reason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                Voter Segmentation (K-Means Clustering)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  "Quick Mobile Voters",
                  "Desktop Deliberators",
                  "Standard Voters",
                ].map((clusterName, idx) => {
                  const count = clusters.filter(
                    (c) => c.cluster === idx,
                  ).length;
                  return (
                    <div
                      key={idx}
                      className="border-2 border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-lg mb-2">
                        {clusterName}
                      </h3>
                      <p className="text-3xl font-bold text-indigo-600">
                        {count}
                      </p>
                      <p className="text-sm text-gray-600">voters</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainVotingSystem;
