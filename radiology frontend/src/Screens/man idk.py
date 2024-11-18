from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from tensorflow.keras.utils import CustomObjectScope
import os
import numpy as np
import tensorflow as tf
import cv2

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

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})
# Global parameters for image processing
H = 256
W = 256

# Load the pre-trained model
model_path = os.path.join("", "model.keras")  # Update this path to your model file
with CustomObjectScope({"dice_coef": dice_coef, "dice_loss": dice_loss}):
    model = tf.keras.models.load_model(model_path)

# Create a directory if it does not exist
def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

# Function to save the result image
def save_results(image, y_pred, save_image_path):
    # Convert prediction to RGB for visualization
    y_pred_rgb = np.expand_dims(y_pred, axis=-1)
    y_pred_rgb = np.concatenate([y_pred_rgb, y_pred_rgb, y_pred_rgb], axis=-1) * 255

    # Create a red overlay where the predicted mask is 1
    overlay = image.copy()  # Start with the original image
    red_color = (0, 0, 255)  # Red color for the overlay

    # Apply the red overlay to the mask region where prediction is 1
    overlay[y_pred == 1] = red_color  # Apply red where prediction is 1

    # Blend the original image and the overlay with some transparency
    blended = cv2.addWeighted(image, 0.7, overlay, 0.3, 0)  # Alpha blending

    # Create a white line for separation
    line = np.ones((H, 10, 3)) * 255

    # Concatenate the original image and prediction overlay
    # cat_images = np.concatenate([image, line, y_pred_rgb, line, blended], axis=1)
    cat_images = np.concatenate([y_pred_rgb, line, blended], axis=1)

 
    # Add labels to the images
    font = cv2.FONT_HERSHEY_SIMPLEX
    font_scale = 0.6
    color = (255, 255, 255)  # White color for text
    thickness = 1

    # Label positions
    # cv2.putText(cat_images, "Original Image", (10, 30), font, font_scale, color, thickness, cv2.LINE_AA)
    cv2.putText(cat_images, "Predicted Mask", (20, 30), font, font_scale, color, thickness, cv2.LINE_AA)
    cv2.putText(cat_images, "Prediction Overlay", ( H + 30, 30), font, font_scale, color, thickness, cv2.LINE_AA)

    # Save the final concatenated image
    cv2.imwrite(save_image_path, cat_images)

# Endpoint for image upload and prediction
@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Create directory for saving results
    results_dir = "results"  # Update this path if needed
    create_dir(results_dir)

    if file:
        # Save the uploaded image temporarily
        file_path = os.path.join(results_dir, file.filename)
        file.save(file_path)

        # Reading the image
        image = cv2.imread(file_path, cv2.IMREAD_COLOR)  # [H, W, 3]
        image = cv2.resize(image, (W, H))  # Resize to [H, W, 3]
        x_input = image / 255.0  # Normalize to [0, 1]
        x_input = np.expand_dims(x_input, axis=0)  # [1, H, W, 3]

        # Make the prediction
        y_pred = model.predict(x_input, verbose=0)[0]
        y_pred = np.squeeze(y_pred, axis=-1)  # Remove extra dimension [H, W]
        y_pred = (y_pred >= 0.5).astype(np.int32)  # Threshold to binary mask

        # Save results
        save_image_path = os.path.join(results_dir, f"result_{file.filename}")
        save_results(image, y_pred, save_image_path)

        # Return path to saved result
        return jsonify({
            'prediction': 'success',
            'mask_path': f"http://localhost:5000/results/result_{file.filename}"  # Update this URL
        })

# Endpoint to serve the result images
@app.route('/results/<filename>', methods=['GET'])
def get_result_image(filename):
    return send_from_directory('results', filename)

# Run the app
if __name__ == "__main__":
    app.run(host='localhost', port=5000)