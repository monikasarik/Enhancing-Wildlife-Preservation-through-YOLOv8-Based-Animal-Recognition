from flask import Flask, render_template, request, jsonify, send_file
from ultralytics import YOLO
import cv2
import numpy as np
from PIL import Image
import os
import mysql.connector
import io
import csv
from datetime import datetime

app = Flask(__name__)


# Database connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root@123",  # your mysql password
    database="wildlife_auth"  # your database
)
cursor = db.cursor()

# Load YOLO model
model = YOLO("best.pt")

# In-memory list to store detection history
detection_history = []

@app.route("/")
def index():
    return render_template("index.html")

# Signup Route
@app.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.get_json()
        username = data['username']
        email = data['email']
        password = data['password']

        cursor.execute("SELECT * FROM users WHERE username = %s OR email = %s", (username, email))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({"success": False, "message": "Username or Email already exists."})

        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, password))
        db.commit()

        return jsonify({"success": True, "message": "Signup successful!"})
    except Exception as e:
        print("Signup Error:", e)
        return jsonify({"success": False, "message": "Server error during signup."}), 500

# Login Route
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        username = data['username']
        password = data['password']

        cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
        user = cursor.fetchone()

        if user:
            return jsonify({"success": True, "message": "Login successful!"})
        else:
            return jsonify({"success": False, "message": "Invalid username or password."})
    except Exception as e:
        print("Login Error:", e)
        return jsonify({"success": False, "message": "Server error during login."}), 500

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html", username="User")  # Replace "User" dynamically if needed

# Predict Route (Animal detection)
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    img = Image.open(file)

    # Convert image to OpenCV format
    img = np.array(img)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # Perform animal detection
    results = model(img)

    detected_animals = []
    for box in results[0].boxes:
        class_id = int(box.cls)
        label = results[0].names[class_id]
        confidence = float(box.conf)
        x1, y1, x2, y2 = map(int, box.xyxy[0])

        # Draw bounding boxes
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(img, f"{label} {confidence:.2f}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

        detected_animals.append({
            "name": label,
            "confidence": confidence,
            "bbox": [x1, y1, x2, y2]
        })

        # Save each detection to detection history
        detection_history.append({
            "timestamp": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "animal": label
        })

    # Save detected image
    output_path = "static/detected.jpg"
    cv2.imwrite(output_path, img)
    print(f"Saved detected image: {os.path.abspath(output_path)}")

    return jsonify({
        "animals": detected_animals,
        "image_url": "/static/detected.jpg"
    })

# API Route to return recent detection history
@app.route("/api/detection-history")
def api_detection_history():
    return jsonify(detection_history[-15:])  # Last 15 detections

# Route to download detection logs as CSV
@app.route("/download-logs")
def download_logs():
    si = io.StringIO()
    cw = csv.writer(si)
    cw.writerow(['Timestamp', 'Animal Detected'])

    for detection in detection_history:
        cw.writerow([detection['timestamp'], detection['animal']])

    output = io.BytesIO()
    output.write(si.getvalue().encode('utf-8'))
    output.seek(0)

    return send_file(output, mimetype='text/csv', as_attachment=True, download_name='detection_logs.csv')

if __name__ == "__main__":
    app.run(debug=True)