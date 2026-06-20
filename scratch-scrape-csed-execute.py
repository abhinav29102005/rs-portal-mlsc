import requests
from bs4 import BeautifulSoup
import urllib3
import sqlite3
import os
from dotenv import load_dotenv

urllib3.disable_warnings()

# Load env
load_dotenv(".env.local")
db_url = os.environ.get("TURSO_URL")
auth_token = os.environ.get("TURSO_AUTH_TOKEN")

# Since Turso handles HTTP, using standard sqlite3 on a local db file is not directly possible if it's purely a remote libSQL URL.
# Wait, I should just generate a SQL file or run it via a Node.js script using @libsql/client.
# Let's create a node script instead! It's much easier to hook into Turso.
