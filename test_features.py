import librosa
import numpy as np
import os
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import tensorflow as tf
from tensorflow.keras import layers, models

DATASET_PATH = r"C:\Users\Jeeva K\AndroidStudioProjects\acousafe 2\Sound data"
CLASSES = ["normal", "panic", "crowd", "fight", "gunshot"]

def extract_features(file_path):
    try:
        y, sr = librosa.load(file_path, sr=16000, duration=3)
        target_length = 16000 * 3
        if len(y) < target_length:
            y = np.pad(y, (0, target_length - len(y)), 'constant')
            
        # 1. MFCC "placeholder" (chunked temporal mean absolute)
        num_coeffs = 40
        chunk_size = len(y) // num_coeffs
        mfccs = np.zeros(num_coeffs)
        for i in range(num_coeffs):
            start = i * chunk_size
            end = min(start + chunk_size, len(y))
            mfccs[i] = np.mean(np.abs(y[start:end]))
            
        # 2. RMS
        rms = np.sqrt(np.mean(y**2))
        
        # 3. ZCR
        zcr = np.sum((y[1:] >= 0) != (y[:-1] >= 0)) / len(y)
        
        # 4. Spectral Centroid equivalent in Kotlin
        mags = np.abs(y)
        indices = np.arange(len(y))
        total_mag = np.sum(mags)
        centroid = np.sum(indices * mags) / (total_mag * len(y)) if total_mag > 0 else 0.0
        
        features = np.concatenate([mfccs, [rms], [zcr], [centroid]])
        
        # Normalization
        max_abs = np.max(np.abs(features))
        if max_abs > 0:
            features = features / max_abs
            
        return features
    except Exception as e:
        return None

X, y_labels = [], []
for label_idx, label in enumerate(CLASSES):
    class_path = os.path.join(DATASET_PATH, label)
    if not os.path.isdir(class_path): continue
    for file in os.listdir(class_path):
        if file.endswith('.wav'):
            feat = extract_features(os.path.join(class_path, file))
            if feat is not None:
                X.append(feat)
                y_labels.append(label_idx)

X = np.array(X)
y_labels = np.array(y_labels)

if len(X) == 0:
    print("NO DATA")
    exit()

X_train, X_test, y_train, y_test = train_test_split(X, y_labels, test_size=0.2, random_state=42, stratify=y_labels)

model = models.Sequential([
    layers.Input(shape=(43,)),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(64, activation='relu'),
    layers.Dense(5, activation='softmax')
])
model.compile(optimizer='adam', loss='sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(X_train, y_train, validation_split=0.2, epochs=30, batch_size=32, verbose=0)
loss, acc = model.evaluate(X_test, y_test, verbose=0)
print("TEST ACCURACY:", acc)
y_pred = np.argmax(model.predict(X_test, verbose=0), axis=1)
print(classification_report(y_test, y_pred, target_names=CLASSES))
