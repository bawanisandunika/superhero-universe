🦸 Superhero Universe Network 🌌
Welcome to the Superhero Universe Network, a fun and interactive Flask-based web app that lets you explore a network of superheroes and their friendships! 🕸️🤝 With a sleek, mobile-responsive interface, you can view stats, search for heroes, visualize friendship graphs, and even add new heroes and connections. The backend uses Flask, pandas, and NetworkX, while the frontend shines with D3.js and Matplotlib for awesome visualizations. 🚀
✨ Features

📊 Network Stats: See total heroes, connections, recent additions, and the most connected heroes.
🔍 Hero Search: Find your favorite superhero and check out their details and friends.
🌐 Interactive Graph: Explore the superhero network with a cool D3.js visualization.
🖼️ Static Graph: Generate and download a static network image with Matplotlib.
🆕 Add Heroes/Connections: Create new superheroes and link them with friends through an easy interface.
📱 Mobile-Friendly: Works beautifully on mobile, tablet, and desktop.
🖥️ Console Report: Get a detailed network report on startup.
😎 Emoji Fun: Each hero gets a unique emoji for extra flair!

🛠️ Prerequisites
To get started, you'll need:

🐍 Python 3.8+: Make sure Python is installed. Download Python if needed.
📦 Git: To clone the project. Install Git if you don't have it.
🌐 Web Browser: A modern browser like Chrome or Firefox for the web interface.

🚀 Installation
Let's get this superhero network up and running! Follow these steps:

Clone the Repository 📥
git clone (https://github.com/bawanisandunika/superhero-universe)
cd superhero-universe-network


Set Up a Virtual Environment 🧪
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


Install Python Dependencies 📚Install the required libraries with pip:
pip install flask pandas networkx matplotlib seaborn


Check the Directory Structure 📂Ensure your project looks like this:
superhero-universe-network/
├── data/
│   ├── superheroes.csv  (auto-created if missing)
│   └── links.csv        (auto-created if missing)
├── static/
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── templates/
│   └── index.html
├── app.py
└── README.md


External Libraries 🌍The frontend uses these CDN-hosted libraries (no installation needed):

🎨 Animate.css (v4.1.1) for smooth animations
🖼️ Font Awesome (v6.0.0-beta3) for icons
📈 D3.js (v7) for interactive graphs
🚨 SweetAlert2 for stylish alerts



🎮 Usage

Start the Flask Server 🖥️Run the app:
python app.py

The server will start in debug mode at http://127.0.0.1:5000.

Open the Web Interface 🌐Fire up your browser and go to http://127.0.0.1:5000.

Play with the App 🦸‍♂️

Network Stats 📊: Check out total heroes, connections, and top heroes.
Hero Search 🔍: Type a hero’s name to see their details and friends.
Friendship Network 🌐: Click "Interactive Graph" for a D3.js visualization or "Static Image" for a Matplotlib graph. Download it with the "Download Image" button.
Add a Hero 🆕: Enter a hero name and optional creation date.
Add a Connection 🤝: Link two heroes by entering their names.
Toast Notifications 🚨: See success or error messages pop up as toasts.


Console Report 📜When the app starts, it prints a cool report to the console, including:

Total superheroes 🦸
Total connections 🤝
Heroes added in the last 3 days 🕒
Top 3 most connected heroes 🏆
Details for "dataiskole" (if in the network) 📊
A static graph saved as superhero_network.png 🖼️



📦 Dependencies
Python Libraries 🐍

Flask: Powers the web backend.
pandas: Handles hero and connection data.
NetworkX: Builds and analyzes the network.
Matplotlib: Creates static graph images.
seaborn: Provides nice color palettes.

Install them with:
pip install flask pandas networkx matplotlib seaborn

Frontend Libraries (CDN) 🌐

Animate.css: Adds smooth animations.
Font Awesome: Provides icons.
D3.js: Renders interactive graphs.
SweetAlert2: Shows user-friendly alerts.

📂 Project Structure

app.py: The main Flask app with routes and the SuperheroNetwork class.
templates/index.html: The HTML frontend template.
static/css/styles.css: CSS for styling and mobile responsiveness.
static/js/app.js: JavaScript for frontend interactivity (assumed to exist).
data/: Stores superheroes.csv (heroes) and links.csv (connections).

📝 Notes

The data/ folder is auto-created if missing. 🗂️
superheroes.csv and links.csv are generated if not present. 📄
A static graph is saved as superhero_network.png on startup. 🖼️
Ensure static/ and templates/ folders are set up correctly. ✅
The app is fully mobile-responsive, adapting to mobile, tablet, and desktop screens. 📱💻

🐞 Troubleshooting

Flask Server Won’t Start 🚫: Check that all dependencies are installed and the virtual environment is activated.
Graph Not Showing 📉: Ensure app.js has the D3.js logic for rendering (not included here).
CSV Files Missing 📂: The app auto-creates these, but verify write permissions in the data/ folder.
CDN Issues 🌍: If CDN libraries don’t load, check your internet or host them locally.


