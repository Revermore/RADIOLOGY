# import base64
# import os
# from io import BytesIO

# import cv2
# import matplotlib.pyplot as plt
# import nibabel as nib
# import numpy as np
# import tensorflow as tf
# from flask import Flask, jsonify, request, send_from_directory
# from flask_cors import CORS
# from tensorflow.keras.utils import CustomObjectScope

# # Define a small smoothing constant
# smooth = 1e-15

# # Custom metrics and loss functions
# def dice_coef(y_true, y_pred):
#     y_true = tf.keras.layers.Flatten()(y_true)
#     y_pred = tf.keras.layers.Flatten()(y_pred)
#     intersection = tf.reduce_sum(y_true * y_pred)
#     return (2. * intersection + smooth) / (tf.reduce_sum(y_true) + tf.reduce_sum(y_pred) + smooth)

# def dice_loss(y_true, y_pred):
#     return 1.0 - dice_coef(y_true, y_pred)
# UPLOAD_FOLDER = 'results/'  # Assuming you have an upload folder
# # Initialize Flask app
# app = Flask(__name__)  # Use 'name' instead of '_name'
# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER



# # Global parameters for image processing
# H = 256
# W = 768

# # Load the pre-trained model
# model_path = os.path.join("", "model.keras")  # Update this path to your model file
# with CustomObjectScope({"dice_coef": dice_coef, "dice_loss": dice_loss}):
#     model = tf.keras.models.load_model(model_path)

# # Create a directory if it does not exist
# def create_dir(path):
#     if not os.path.exists(path):
#         os.makedirs(path)

# # Function to save the result image with predicted mask overlay outline
# def save_results(image, y_pred, save_image_path, mask=None):
#     if mask is not None:
#         mask = np.expand_dims(mask, axis=-1)
#         mask = np.concatenate([mask, mask, mask], axis=-1)
    
#     # Convert prediction to RGB for visualization
#     y_pred_rgb = np.expand_dims(y_pred, axis=-1)
#     y_pred_rgb = np.concatenate([y_pred_rgb, y_pred_rgb, y_pred_rgb], axis=-1) * 255
    
#     # Ensure the image is in the correct range for display/saving (0–255)
#     if image.max() <= 1.0:
#         image = (image * 255).astype(np.uint8)

#     # Create an overlay with the boundary only
#     overlay = image.copy()
#     red_color = (0, 0, 255)  # Red color for the overlay

#     # Find contours in the predicted mask
#     contours, _ = cv2.findContours(y_pred.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
#     # Draw contours as boundary lines on the image without filling
#     boundary_image = np.zeros_like(image)
#     cv2.drawContours(boundary_image, contours, -1, red_color, 2)

#     # Blend the original image and boundary image with transparency
#     blended = cv2.addWeighted(image, 0.7, boundary_image, 0.3, 0)
#     # Resize the blended image back to the original dimensions
#     # blended_resized = cv2.resize(blended, (image.shape[1], image.shape[0]))

#     # Save the final blended image
#     cv2.imwrite(save_image_path, blended)

# # Endpoint for image upload and prediction
# @app.route('/upload', methods=['POST'])
# def upload_images():
#     if 'image' not in request.files:
#         return jsonify({'error': 'No files uploaded'}), 400

#     image_file = request.files['image']
#     img_path = os.path.join(app.config['UPLOAD_FOLDER'], image_file.filename)
#     image_file.save(img_path)

#     # Load the images using OpenCV
#     image = cv2.imread(img_path)

#     """ Load the model """
#     with CustomObjectScope({"dice_coef": dice_coef, "dice_loss": dice_loss}):
#         model = tf.keras.models.load_model("model.keras")

#     """ Prediction and Evaluation """
#     original_height, original_width = image.shape[:2]  # Store original dimensions
#     image_gray = cv2.imread(img_path, cv2.IMREAD_COLOR)
#     image_resized = cv2.resize(image_gray, (256, 256))
#     # image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_GRAY2RGB)  # Convert grayscale to RGB
#     x = image_resized / 255.0
#     x = np.expand_dims(x, axis=0)

#     """ Prediction """
#     y_pred = model.predict(x, verbose=0)[0]
#     y_pred = np.squeeze(y_pred, axis=-1)
#     y_pred = y_pred >= 0.5
#     y_pred = y_pred.astype(np.int32)

#     """ Saving the prediction """
#     save_image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_file.filename)
#     save_results(image_resized, y_pred, save_image_path)

#     # Return the combined image in the response with a full URL that matches the new route
#     return jsonify({
#         'combined_image': f"http://localhost:5001/results/{image_file.filename}"
#     })

# # Endpoint to serve the result images
# @app.route('/results/<filename>', methods=['GET'])
# def get_result_image(filename):
#     return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# # Run the app
# if __name__ == "__main__":  # Use 'name' and 'main' instead of '_name' and 'main'
#     app.run(host='0.0.0.0', port=5001)
import base64
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

UPLOAD_FOLDER = 'results'
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # Allow frontend at localhost:3000
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Global parameters for image processing
H, W = 256, 768

# Load the pre-trained model
model_path = "model.keras"  # Update this path as needed
with CustomObjectScope({"dice_coef": dice_coef, "dice_loss": dice_loss}):
    model = tf.keras.models.load_model(model_path)

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

create_dir(UPLOAD_FOLDER)

# Function to save the result image
def save_results(image, y_pred, save_image_path,mask=None):
    """
    Save results with the original image, predicted mask as an outline, and the prediction overlay.
    
    Args:
    - image (numpy.ndarray): The original input image (H, W, 3).
    - y_pred (numpy.ndarray): The predicted binary mask (H, W), values as 0 and 1.
    - save_image_path (str): The path to save the resulting image.
    """
     # Dimensions of the input image (height, width)
    if mask is not None:
        # print(mask.shape)
        # mask = np.expand_dims(mask, axis=-1)
        # print(mask.shape)
        # mask = np.concatenate([mask, mask, mask], axis=1)
        # print(mask.shape)
        mask = mask.reshape(256,256,3)
        print(mask.shape)


    # Debugging: Print dimensions
    print(f"Image dimensions: {image.shape}")
    print(f"Prediction dimensions: {y_pred.shape}")

    # Convert prediction to RGB format
    y_pred_rgb = np.expand_dims(y_pred, axis=-1)  # Add channel dimension
    y_pred_rgb = np.concatenate([y_pred_rgb, y_pred_rgb, y_pred_rgb], axis=-1) * 255  # Convert to RGB (0-255)

    print(y_pred_rgb.shape)
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
    cat_images = np.concatenate([image, line,mask,line, y_pred_rgb, line, blended], axis=1)

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
def upload_images():
    if 'image' not in request.files or 'mask' not in request.files:
        return jsonify({'error': 'No files uploaded'}), 400

    image_file = request.files['image']
    mask_file = request.files['mask']

    img_path = os.path.join(app.config['UPLOAD_FOLDER'], image_file.filename)
    mask_path = os.path.join(app.config['UPLOAD_FOLDER'], mask_file.filename)

    image_file.save(img_path)
    mask_file.save(mask_path)

    image = cv2.imread(img_path)
    mask = cv2.imread(mask_path, cv2.IMREAD_GRAYSCALE)
    mask = cv2.resize(mask, (W, H))

    image_resized = cv2.resize(image, (256, 256))
    x = image_resized / 255.0
    x = np.expand_dims(x, axis=0)

    y_pred = model.predict(x, verbose=0)[0]
    y_pred = np.squeeze(y_pred, axis=-1) >= 0.5
    y_pred = y_pred.astype(np.int32)

    save_image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_file.filename)
    save_results(image_resized,  y_pred, save_image_path,mask)

    return jsonify({
        'combined_image': f"http://localhost:5001/results/{image_file.filename}"
    })

@app.route('/results/<filename>', methods=['GET'])
def get_result_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001)