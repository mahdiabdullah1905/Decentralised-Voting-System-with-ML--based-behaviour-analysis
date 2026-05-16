// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    struct Vote {
        address voter;
        uint256 candidateId;
        uint256 timestamp;
    }

    address public owner;
    bool public electionStarted;
    bool public electionEnded;
    uint256 public electionId; // Track election generation

    mapping(uint256 => Candidate) public candidates;
    // hasVoted tracks: electionId => voter => bool
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    uint256 public candidatesCount;
    uint256 public totalVotes;

    event ElectionStarted();
    event ElectionEnded();
    event ElectionReset(uint256 indexed electionId);
    event CandidateAdded(uint256 indexed candidateId, string name);
    event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyDuringElection() {
        require(electionStarted, "Election has not started yet");
        require(!electionEnded, "Election has already ended");
        _;
    }

    constructor() {
        owner = msg.sender;
        electionStarted = false;
        electionEnded = false;
    }

    function addCandidate(string memory _name) public onlyOwner {
        require(!electionStarted, "Cannot add candidates after election has started");
        
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        
        emit CandidateAdded(candidatesCount, _name);
    }

    function startElection() public onlyOwner {
        require(!electionStarted, "Election already started");
        electionStarted = true;
        emit ElectionStarted();
    }

    function endElection() public onlyOwner {
        require(electionStarted, "Election has not started yet");
        require(!electionEnded, "Election already ended");
        electionEnded = true;
        emit ElectionEnded();
    }

    function resetElection() public onlyOwner {
        require(electionEnded, "Can only reset after election ends");
        electionStarted = false;
        electionEnded = false;
        
        // Reset candidates by resetting the counter. New candidates will overwrite.
        candidatesCount = 0;

        electionId++; // Increment session ID
        totalVotes = 0;
        
        emit ElectionReset(electionId);
    }

    function castVote(uint256 _candidateId) public onlyDuringElection {
        require(!hasVoted[electionId][msg.sender], "You have already voted in this election");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");

        hasVoted[electionId][msg.sender] = true;
        candidates[_candidateId].voteCount++;
        totalVotes++;

        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }

    // ONLY FOR DEMONSTRATION/SIMULATION PURPOSES
    function adminSimulateVote(uint256 _candidateId) public onlyOwner onlyDuringElection {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        
        candidates[_candidateId].voteCount++;
        totalVotes++;
        
        // Emitting a mock vote cast to ensure logs capture it. Using a mock address.
        address mockVoter = address(uint160(uint256(keccak256(abi.encodePacked(block.timestamp, _candidateId)))));
        emit VoteCast(mockVoter, _candidateId, block.timestamp);
    }

    function getAllCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidatesCount);
        for (uint256 i = 1; i <= candidatesCount; i++) {
            allCandidates[i - 1] = candidates[i];
        }
        return allCandidates;
    }

    function getElectionStatus() public view returns (bool, bool) {
        return (electionStarted, electionEnded);
    }
}
