from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import smtplib
import re
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Enable CORS for all routes to allow frontend requests
CORS(app, resources={r"/*": {"origins": "https://manan-darji-portfolio.vercel.app"}})

@app.route("/", methods=["GET"])
def home():
    """
    Root endpoint to check if backend is running.
    """
    return jsonify({
        "status": "Backend running",
        "message": "Welcome to the Portfolio API"
    }), 200

@app.route("/contact", methods=["POST"])
def contact():
    """
    Endpoint to handle contact form submissions.
    """
    try:
        data = request.get_json()
        
        # 1. Input Validation
        if not data:
             return jsonify({
                 "success": False, 
                 "message": "No input data provided"
             }), 400

        name = data.get("name")
        email = data.get("email")
        message = data.get("message")

        if not name or not email or not message:
            return jsonify({
                "success": False, 
                "message": "Missing required fields (name, email, message)"
            }), 400

        # 2. Email Format Validation
        email_regex = r"[^@]+@[^@]+\.[^@]+"
        if not re.match(email_regex, email):
            return jsonify({
                "success": False, 
                "message": "Invalid email format"
            }), 400

        # 3. Server Configuration Check
        sender_email = os.getenv("EMAIL_ADDRESS")
        sender_password = os.getenv("EMAIL_PASSWORD")

        print("Sender email:", sender_email)
        print("Password present:", bool(sender_password))

        if not sender_email or not sender_password:
            # Log this error on the server side
            print("Configuration Error: EMAIL_ADDRESS or EMAIL_PASSWORD not set.")
            return jsonify({
                "success": False, 
                "message": "Server configuration error. Please contact the administrator."
            }), 500

        # 4. Email Sending Logic
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = sender_email  # Send to self (admin)
        msg["Subject"] = f"Portfolio Contact: {name}"
        
        body = f"""
        New message from your portfolio website:
        
        Name: {name}
        Email: {email}
        
        Message:
        ------------------------
        {message}
        ------------------------
        """
        msg.attach(MIMEText(body, "plain"))

        # Connect to Gmail SMTP server
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(sender_email, sender_password)
            server.send_message(msg)

            
        return jsonify({
            "success": True, 
            "message": "Your message has been sent successfully!"
        }), 200

    except smtplib.SMTPAuthenticationError:
        return jsonify({
            "success": False, 
            "message": "Failed to authenticate with email server."
        }), 500
        
    except smtplib.SMTPException as e:
        return jsonify({
            "success": False, 
            "message": f"Email sending failed: {str(e)}"
        }), 500
        
    except Exception as e:
        # Catch-all for other errors (e.g., JSON parsing)
        return jsonify({
            "success": False, 
            "message": f"An unexpected error occurred: {str(e)}"
        }), 500

if __name__ == "__main__":
    # Get configuration from environment variables
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    
    # Run the Flask application
    app.run(host="0.0.0.0", port=port, debug=debug)
