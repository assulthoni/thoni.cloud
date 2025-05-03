import sys
from dotenv import load_dotenv
sys.path.insert(0, "/var/www/thoni.cloud")

# Load the environment variables from .env
load_dotenv('/var/www/thoni.cloud/.env')
from app import app as application