import os
from io import BytesIO
import cv2
import numpy as np
import tensorflow as tf
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from tensorflow.keras.utils import CustomObjectScope

# Define a small smoothing constant
smooth = 1e-15

# Custom metrics and loss functions
def dice_coef(y_true, y_pred):
    y_true = tf.keras.layers.Flatten()(y_true)
    y_pred = tf.keras.layers.Flatten()(y_pred)
    intersection = tf.reduce_sum(y_true * y_pred)
    return (2. * intersection + smooth) / (tf.reduce_sum(y_true) + tf.reduce_sum(y_pred) + smooth)

def dice_loss(y_true, y_pred):
    return 1.0 - dice_coef(y_true, y_pred)

# Directories for results
Malignant = 'results_malignant/'
Benign = "results_benign/"

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Allow frontend at localhost:3000

app.config['Upload_malignant'] = Malignant
app.config['Upload_benign'] = Benign

# Global parameters for image processing
H, W = 256, 768

# Load the pre-trained malignant model
model_path_malignant = "model_malignant.keras"  # Update this path as needed
with CustomObjectScope({"dice_coef": dice_coef, "dice_loss": dice_loss}):
    malignant_model = tf.keras.models.load_model(model_path_malignant)

# Load the pre-trained benign model
model_path_benign = "model_benign.keras"  # Update this path as needed
with CustomObjectScope({"dice_coef": dice_coef, "dice_loss": dice_loss}):
    benign_model = tf.keras.models.load_model(model_path_benign)

# Create result directories
def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

create_dir(app.config['Upload_malignant'])
create_dir(app.config['Upload_benign'])

# Function to save the result image
def save_results(image, y_pred, save_image_path, mask=None):
    """
    Save results with the original image, predicted mask as an outline, and the prediction overlay.
    """
    if mask is not None:
        mask = mask.reshape(256, 256, 3)

    # Convert prediction to RGB format
    y_pred_rgb = np.expand_dims(y_pred, axis=-1)  # Add channel dimension
    y_pred_rgb = np.concatenate([y_pred_rgb, y_pred_rgb, y_pred_rgb], axis=-1) * 255  # Convert to RGB (0-255)

    # Generate the outline
    red_color = (0, 0, 255)  # Red color for the outline
    contours, _ = cv2.findContours(y_pred.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    boundary_image = np.zeros_like(image)  # Create an empty image for the boundary
    cv2.drawContours(boundary_image, contours, -1, red_color, 2)  # Draw the contours

    # Blend the original image with the boundary
    blended = cv2.addWeighted(image, 0.7, boundary_image, 0.3, 0)

    # Create a separator line
    line = np.ones((H, 10, 3), dtype=np.uint8) * 255  # White line

    # Concatenate the images
    cat_images = np.concatenate([image, line, mask, line, y_pred_rgb, line, blended], axis=1)

    # Add labels
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.6
    color = (255, 255, 255)
    thickness = 1
    cv2.putText(cat_images, "Input Image", (20, 30), font, font_scale, color, thickness, cv2.LINE_AA)
    cv2.putText(cat_images, "Ground Truth", (H + 20, 30), font, font_scale, color, thickness, cv2.LINE_AA)
    cv2.putText(cat_images, "Prediction Mask", (2 * H + 20, 30), font, font_scale, color, thickness, cv2.LINE_AA)
    cv2.putText(cat_images, "Prediction Outline", (3 * H + 40, 30), font, font_scale, color, thickness, cv2.LINE_AA)

    # Save the concatenated image
    cv2.imwrite(save_image_path, cat_images)
    print(f"Saved result to {save_image_path}")

@app.route('/upload', methods=['POST'])
def upload_malignant():
    if 'image' not in request.files or 'mask' not in request.files:
        return jsonify({'error': 'No files uploaded'}), 400

    image_file = request.files['image']
    mask_file = request.files['mask']

    img_path = os.path.join(app.config['Upload_malignant'], image_file.filename)
    mask_path = os.path.join(app.config['Upload_malignant'], mask_file.filename)

    image_file.save(img_path)
    mask_file.save(mask_path)

    image = cv2.imread(img_path)
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    mask = cv2.resize(mask, (W, H))

    image_resized = cv2.resize(image, (256, 256))
    x = image_resized / 255.0
    x = np.expand_dims(x, axis=0)

    y_pred = malignant_model.predict(x, verbose=0)[0]
    y_pred = np.squeeze(y_pred, axis=-1) >= 0.5
    y_pred = y_pred.astype(np.int32)

    save_image_path = os.path.join(app.config['Upload_malignant'], image_file.filename)
    save_results(image_resized, y_pred, save_image_path, mask)

    return jsonify({
        'combined_image': f"http://localhost:5001/results/{image_file.filename}"
    })

@app.route('/uploadbenign', methods=['POST'])
def upload_benign():
    if 'image' not in request.files or 'mask' not in request.files:
        return jsonify({'error': 'No files uploaded'}), 400

    image_file = request.files['image']
    mask_file = request.files['mask']

    img_path = os.path.join(app.config['Upload_benign'], image_file.filename)
    mask_path = os.path.join(app.config['Upload_benign'], mask_file.filename)

    image_file.save(img_path)
    mask_file.save(mask_path)

    image = cv2.imread(img_path)
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    mask = cv2.resize(mask, (W, H))

    image_resized = cv2.resize(image, (256, 256))
    x = image_resized / 255.0
    x = np.expand_dims(x, axis=0)

    y_pred = benign_model.predict(x, verbose=0)[0]
    y_pred = np.squeeze(y_pred, axis=-1) >= 0.5
    y_pred = y_pred.astype(np.int32)

    save_image_path = os.path.join(app.config['Upload_benign'], image_file.filename)
    save_results(image_resized, y_pred, save_image_path, mask)

    return jsonify({
        'combined_image': f"http://localhost:5001/results/{image_file.filename}"
    })

@app.route('/results/<filename>', methods=['GET'])
def get_result_image(filename):
    if os.path.exists(os.path.join(app.config['Upload_malignant'], filename)):
        return send_from_directory(app.config['Upload_malignant'], filename)
    if os.path.exists(os.path.join(app.config['Upload_benign'], filename)):
        return send_from_directory(app.config['Upload_benign'], filename)
    return jsonify({'error': 'File not found'}), 404

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)
