from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import sys

from ml.features import extract_features
from ml.anomaly import load_or_train_model, detect_anomaly
from ml.clustering import load_or_train_cluster, assign_cluster

import sys

# CREATE FLASK APP FIRST
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# dummy base data to initialize models
import time

import time
import random

# dummy base data to initialize models
# timestamps should be close to current time
current_time = int(time.time() * 1000)

# INITIALIZE SCALER AND MODELS
# ----------------------------
from sklearn.preprocessing import StandardScaler
import os
import joblib
from sklearn.decomposition import PCA

SCALER_PATH = "models/scaler.pkl"
PCA_MODEL_PATH = "models/pca_model.pkl"

# Generate diverse BASE_DATA to train initial models (Cold Start Strategy)
# We simulate two clusters: Normal Voters vs Bots/Attackers
# Features: [vote_time, attempts, voting_speed]
base_data_list = []

# 1. Normal Voters (Gaussian: Mean=12s, SD=4s | Attempts: 70% 1, 20% 2, 10% 3)
for _ in range(100): 
    # Normal distribution with slight noise
    t = random.gauss(12, 4)
    # Allow some overlap with lower times (down to 1.0s instead of hard 2s)
    t = max(1.0, min(30.0, t)) 
    
    # Attempts: 70% -> 1, 20% -> 2, 10% -> 3
    r = random.random()
    if r < 0.70: a = 1.0
    elif r < 0.90: a = 2.0
    else: a = 3.0
    
    # Add slight random noise to derived speed to prevent perfect 1/x curve
    s = (1.0 / (t + 0.1)) + random.uniform(-0.01, 0.01)
    base_data_list.append([t, a, max(0.01, s)])

# 2. Anomalous Voters (Gaussian: Mean=0.5s, SD=0.5s | Attempts: 2-6 but rarely 1)
# Increased overlap: Time 0.05 - 1s (Super fast bots)
for _ in range(25): 
    t = random.gauss(0.5, 0.5)
    t = max(0.05, min(1.0, t)) 
    
    # Attempts: mostly 2-6, but small chance (5%) of 1 to confuse model slightly
    if random.random() < 0.05:
        a = 1.0
    else:
        a = float(random.randint(2, 6))
    
    s = (1.0 / (t + 0.1)) + random.uniform(-0.02, 0.02)
    base_data_list.append([t, a, max(0.01, s)])

BASE_DATA = np.array(base_data_list)

# Initialize and Fit Scaler
if os.path.exists(SCALER_PATH):
    scaler = joblib.load(SCALER_PATH)
else:
    scaler = StandardScaler()
    scaler.fit(BASE_DATA)
    os.makedirs("models", exist_ok=True)
    joblib.dump(scaler, SCALER_PATH)

# Scale data for training
base_data_scaled = scaler.transform(BASE_DATA)

# Train Models on SCALED data
if os.path.exists(PCA_MODEL_PATH):
    pca = joblib.load(PCA_MODEL_PATH)
else:
    pca = PCA(n_components=2)
    pca.fit(base_data_scaled)
    joblib.dump(pca, PCA_MODEL_PATH)

anomaly_model = load_or_train_model(base_data_scaled)
cluster_model = load_or_train_cluster(base_data_scaled)

# Store analysis history
HISTORY = []

@app.route('/analyze', methods=['POST'])
def analyze_data():
    data = request.json
    print(f"Received Simulation Data: {data}", file=sys.stderr)
    
    try:
        # Extract features [vote_time, attempts, voting_speed]
        # Shape is (1, 3)
        raw_features = extract_features(data)
        
        # SCALE FEATURES
        scaled_features = scaler.transform(raw_features)
        
        # Apply PCA for Visualization
        pca_features = pca.transform(scaled_features) # [[p1, p2]]
        p1, p2 = pca_features[0]

        # ML Analysis on SCALED features
        # Decision function returns density score (higher = more normal, lower/negative = anomaly)
        anomaly_score = float(anomaly_model.decision_function(scaled_features)[0])
        is_anomaly = bool(anomaly_model.predict(scaled_features)[0] == -1)
        
        cluster = int(cluster_model.predict(scaled_features)[0])
        
        result = {
            "anomaly_score": anomaly_score,
            "is_anomaly": is_anomaly,
            "cluster": cluster,
            "timestamp": data.get('timestamp', 0),
            "voteTime": data.get('voteTime', 0),
            "attempts": data.get('attempts', 1),
            "voting_speed": 1.0 / (float(data.get('voteTime', 1)) + 0.1), # Add derived feature to output
            "pca_1": float(p1),
            "pca_2": float(p2),
            "wallet": data.get('wallet', 'unknown')
        }
        
        HISTORY.append(result)
        print(f"Appended to HISTORY. New size: {len(HISTORY)}", file=sys.stderr)
        return jsonify(result)
    except Exception as e:
        import traceback
        traceback.print_exc(file=sys.stderr)
        return jsonify({"error": str(e)}), 500

@app.route('/history', methods=['GET'])
def get_history():
    print(f"Returning HISTORY of size: {len(HISTORY)}", file=sys.stderr)
    return jsonify(HISTORY)

@app.route('/test_populate', methods=['GET'])
def test_populate():
    global HISTORY
    HISTORY.append({
        "mock": "data", 
        "voteTime": 10, 
        "is_anomaly": False, 
        "attempts": 1, 
        "timestamp": 12345, 
        "cluster": 0,
        "anomaly_score": 0.5,
        "wallet": "0xTest"
    })
    print(f"Manually populated. Size: {len(HISTORY)}", file=sys.stderr)
    return jsonify({"status": "populated", "size": len(HISTORY)})

@app.route('/clear', methods=['POST'])
def clear_history():
    global HISTORY
    HISTORY = []
    print("History cleared.", file=sys.stderr)
    return jsonify({"status": "cleared"})

@app.route('/centroids', methods=['GET'])
def get_centroids():
    try:
        if not hasattr(cluster_model, 'cluster_centers_'):
            return jsonify([])
            
        # Get scaled centroids
        scaled_centers = cluster_model.cluster_centers_
        
        # Transform centroids using PCA
        pca_centers = pca.transform(scaled_centers)
        
        centroids_data = []
        for i, center in enumerate(pca_centers):
            centroids_data.append({
                "cluster": i,
                "pca_1": float(center[0]),
                "pca_2": float(center[1])
            })
            
        return jsonify(centroids_data)
    except Exception as e:
        print(f"Error getting centroids: {e}", file=sys.stderr)
        return jsonify([])
    # print(f"Body: {request.get_data()}", file=sys.stderr)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
