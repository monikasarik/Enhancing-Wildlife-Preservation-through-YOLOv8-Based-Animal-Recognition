
<h1 align="center">🦁 Enhancing Wildlife Preservation through Animal Recognition</h1>
<h3 align="center">Real-Time Wildlife Detection using YOLOv8 + Flask Web App</h3>

<p align="center">
  <img src="screenshots/WhatsApp Image 2025-05-25 at 10.22.20 AM.jpeg" alt="Wildlife Detection Screenshot" width="600"/>
</p>

---

### 🧠 About the Project

This project aims to support wildlife preservation by building a real-time object detection system that uses **YOLOv8** to recognize animals from images and identify potential human intrusions in protected zones. It provides a secure **Flask web interface** for users to upload images, get instant detection results, and receive email alerts if humans are detected.

---

### 🛠️ What I Used:

- 🐍 **YOLOv8** for object detection (via [Ultralytics](https://github.com/ultralytics/ultralytics))
- ⚙️ **Flask** for backend and REST API
- 🗃️ **MySQL** for secure user and detection data storage
- 📧 **Flask-Mail** to trigger human-detection alerts
- 🧠 **Wikipedia API** for fetching real-time animal facts
- 🎨 **HTML/CSS + JS** for responsive frontend interface

---

### 🎯 Features

- ✅ Upload animal images for real-time object detection
- 📬 Sends **email alerts** to registered users if a human is detected (anti-poaching aid)
- 🧠 View **Wikipedia-based facts** about detected animals
- 📦 Stores **per-user detection logs** in MySQL and allows **CSV download**
- 🔐 Secure login/signup system with per-user data isolation
- 📱 Clean, responsive web design with **interactive feedback**

---

<p align="center">
  <img src="https://github.com/your-username/your-repo-name/blob/main/Screenshots/user-dashboard.png" alt="Dashboard Screenshot" width="600"/>
</p>

---

### 🔐 User Flow

1. 🧾 **Register/Login**  
2. 📤 **Upload Image**  
3. 🧠 **Detect Animal(s)** using YOLOv8  
4. 📬 **Receive Email Alert** (if human is found)  
5. 📈 **View & Download Logs**

---

### 📂 Project Structure

