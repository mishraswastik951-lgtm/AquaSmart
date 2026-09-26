import pandas as pd
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load data
data = pd.read_csv("irrigation_data.csv")

# Features & Target
X = data[['soil_moisture', 'temperature', 'humidity', 'rainfall']]
y = data['irrigate']

# Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# 🔥 BASE MODEL (parallel processing)
rf = RandomForestClassifier(
    n_jobs=-1,        # USE ALL CPU CORES (faster)
    random_state=42
)

# 🔥 HYPERPARAMETER SEARCH SPACE
param_dist = {
    'n_estimators': [100, 200, 300],
    'max_depth': [5, 10, 20, None],
    'max_features': ['sqrt', 'log2'],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'bootstrap': [True]
}

# 🔥 RANDOM SEARCH (FASTER THAN GRID SEARCH)
search = RandomizedSearchCV(
    rf,
    param_distributions=param_dist,
    n_iter=20,              # fewer iterations = faster
    cv=5,                  # cross-validation
    scoring='accuracy',
    n_jobs=-1,
    random_state=42
)

# Train optimized model
search.fit(X_train, y_train)

# Best model
best_model = search.best_estimator_

# Predict
y_pred = best_model.predict(X_test)

# Accuracy
print("Optimized Accuracy:", accuracy_score(y_test, y_pred))

# Save model
joblib.dump(best_model, "irrigation_model.pkl")

# Predict new data
new_data = [[25, 37, 40, 0]]
prediction = best_model.predict(new_data)
probability = best_model.predict_proba(new_data)

print("Prediction:", prediction[0])
print("Confidence:", probability[0])