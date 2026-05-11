import hashlib
import numpy as np

def hash_wallet(wallet):
    return int(hashlib.sha256(wallet.encode()).hexdigest(), 16) % (10**8)

def extract_features(payload):
    # wallet = payload.get("wallet") # Removed for clustering logic - behavior only!
    vote_time = float(payload.get("voteTime", 0))
    # timestamp = payload.get("timestamp") # Removed: Time-series bias
    attempts = float(payload.get("attempts", 1))

    # Derived Feature: Voting Speed (How fast the user is acting)
    # Avoid division by zero
    voting_speed = 1.0 / (vote_time + 0.1)

    # Return raw features. Scaling will be handled by StandardScaler in the main pipeline.
    # Features: [Time Taken, Number of Attempts, Voting Speed]
    features = np.array([
        vote_time,
        attempts,
        voting_speed
    ])

    return features.reshape(1, -1)
