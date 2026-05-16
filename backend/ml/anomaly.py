from sklearn.ensemble import IsolationForest
import joblib
import os

MODEL_PATH = "models/isolation_forest.pkl"

def load_or_train_model(X):
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)

    model = IsolationForest(
        n_estimators=100,
        contamination='auto',
        random_state=42
    )
    model.fit(X)
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model

def detect_anomaly(model, X):
    score = model.decision_function(X)[0]
    prediction = model.predict(X)[0]   # -1 = anomaly
    return score, prediction
