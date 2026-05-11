from sklearn.cluster import KMeans
import joblib
import os

MODEL_PATH = "models/kmeans.pkl"

def load_or_train_cluster(X):
    if os.path.exists(MODEL_PATH):
        return joblib.load(MODEL_PATH)

    model = KMeans(n_clusters=2, random_state=42)
    model.fit(X)
    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    return model

def assign_cluster(model, X):
    return int(model.predict(X)[0])
