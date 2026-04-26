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
        target_length = 48000
        if len(y) < target_length:
            y = np.pad(y, (0, target_length - len(y)), 'constant')
        else:
            y = y[:target_length]
            
        N = 65536
        y_padded = np.pad(y, (0, N - len(y)), 'constant')
        Y = np.abs(np.fft.fft(y_padded))[:N//2]
        
        mfccs = np.zeros(40, dtype=np.float32)
        min_bin = int(20.0 * N / sr)
        max_bin = int(8000.0 * N / sr)
        
        bins = np.geomspace(min_bin, max_bin, num=41).astype(int)
        for i in range(40):
            start = bins[i]
            end = bins[i+1]
            if start >= end: end = start + 1
            mfccs[i] = np.log10(np.mean(Y[start:end]) + 1e-6)
            
        rms = np.float32(np.sqrt(np.mean(y**2)))
        zcr = np.float32(np.sum((y[1:] >= 0) != (y[:-1] >= 0)) / len(y))
        
        mags = np.abs(y)
        total_mag = np.sum(mags)
        centroid = np.float32(np.sum(np.arange(len(y)) * mags) / (total_mag * len(y)) if total_mag > 0 else 0.0)
        
        features = np.concatenate([mfccs, [rms], [zcr], [centroid]])
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
    count = 0
    for file in os.listdir(class_path):
        if count >= 300: break
        if file.endswith('.wav'):
            feat = extract_features(os.path.join(class_path, file))
            if feat is not None:
                X.append(feat)
                y_labels.append(label_idx)
                count += 1

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
model.fit(X_train, y_train, validation_split=0.2, epochs=40, batch_size=32, verbose=0)
loss, acc = model.evaluate(X_test, y_test, verbose=0)
print("TEST ACCURACY:", acc)
y_pred = np.argmax(model.predict(X_test, verbose=0), axis=1)
try:
    print(classification_report(y_test, y_pred, target_names=CLASSES))
except Exception as e:
    print(e)
