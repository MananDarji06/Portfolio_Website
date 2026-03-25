from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
import re

# SendGrid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Enable CORS (allow your frontend)
CORS(app, resources={r"/*": {"origins": "https://manan-darji-portfolio.vercel.app"}})


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "status": "Backend running",
        "message": "Welcome to the Portfolio API"
    }), 200


@app.route("/contact", methods=["POST"])
def contact():
    try:
        data = request.get_json()

        # 🔍 1. Validate input
        if not data:
            return jsonify({
                "success": False,
                "message": "No input data provided"
            }), 400

        name = data.get("name")
        email = data.get("email")
        message_text = data.get("message")

        if not name or not email or not message_text:
            return jsonify({
                "success": False,
                "message": "Missing required fields"
            }), 400

        # 📧 2. Email format validation
        email_regex = r"[^@]+@[^@]+\.[^@]+"
        if not re.match(email_regex, email):
            return jsonify({
                "success": False,
                "message": "Invalid email format"
            }), 400

        # 🔐 3. Load SendGrid config
        sendgrid_api_key = os.getenv("SENDGRID_API_KEY")
        sender_email = os.getenv("SENDER_EMAIL")

        if not sendgrid_api_key or not sender_email:
            return jsonify({
                "success": False,
                "message": "Server configuration error"
            }), 500

        # ✉️ 4. Create email
        email_body = f"""
New message from your portfolio website:

Name: {name}
Email: {email}

Message:
------------------------
{message_text}
------------------------
"""

        message = Mail(
            from_email=sender_email,
            to_emails=sender_email,  # you receive it
            subject=f"Portfolio Contact: {name}",
            plain_text_content=email_body
        )

        # 🚀 5. Send email using SendGrid
        sg = SendGridAPIClient(sendgrid_api_key)
        response = sg.send(message)

        print("SendGrid Status Code:", response.status_code)

        return jsonify({
            "success": True,
            "message": "Message sent successfully!"
        }), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "False").lower() == "true"

    app.run(host="0.0.0.0", port=port, debug=debug)