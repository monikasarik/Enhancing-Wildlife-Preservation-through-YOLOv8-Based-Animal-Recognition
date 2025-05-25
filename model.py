from ultralytics import YOLO

# Load YOLOv8 model
model = YOLO("best.pt")  # Ensure best.pt is in the same folder

def detect_animals(image):
    results = model(image)
    detections = []
    for result in results:
        for box in result.boxes:
            cls = int(box.cls.item())  # Class index
            conf = float(box.conf.item())  # Confidence score
            x1, y1, x2, y2 = map(int, box.xyxy[0])  # Bounding box

            detections.append({
                'class': cls,
                'confidence': conf,
                'bbox': [x1, y1, x2, y2]
            })
    return detections
