from flask import Flask, render_template, request, jsonify, send_file
import pandas as pd
from datetime import datetime, timedelta
import os
import networkx as nx
import matplotlib.pyplot as plt
from io import BytesIO
import base64
import random
import seaborn as sns
import json
from matplotlib.colors import to_hex

app = Flask(__name__)


plt.switch_backend('Agg')


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
HEROES_FILE = os.path.join(DATA_DIR, 'superheroes.csv')
LINKS_FILE = os.path.join(DATA_DIR, 'links.csv')

# Ensure data directory exists
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# Set color palette
COLOR_PALETTE = [to_hex(c) for c in sns.color_palette("husl", 10)]
EMOJI_MAPPING = {
    'Spider-Man': '🕷️',
    'Iron Man': '🤖',
    'Thor': '⚡',
    'Hulk': '💪',
    'Captain America': '🛡️',
    'Black Widow': '♟️',
    'Doctor Strange': '🌀',
    'Black Panther': '🐆',
    'Scarlet Witch': '🔮',
    'Ant-Man': '🐜',
    'dataiskole': '📊'
}

class SuperheroNetwork:
    def __init__(self):
        # Initialize empty DataFrames if files don't exist
        if not os.path.exists(HEROES_FILE):
            self.heroes_df = pd.DataFrame(columns=['id', 'name', 'created_at'])
            self.heroes_df.to_csv(HEROES_FILE, index=False)
        else:
            self.heroes_df = pd.read_csv(HEROES_FILE)
        
        if not os.path.exists(LINKS_FILE):
            self.links_df = pd.DataFrame(columns=['source', 'target'])
            self.links_df.to_csv(LINKS_FILE, index=False)
        else:
            self.links_df = pd.read_csv(LINKS_FILE)
        
        self.network = self._build_network()
        self._print_console_report()
        
    def _build_network(self):
        network = {}
        for _, row in self.heroes_df.iterrows():
            network[row['id']] = {
                'name': row['name'],
                'created_at': row['created_at'],
                'friends': [],
                'emoji': EMOJI_MAPPING.get(row['name'], '🦸')
            }
        
        for _, row in self.links_df.iterrows():
            source = row['source']
            target = row['target']
            if source in network and target in network:
                if target not in network[source]['friends']:
                    network[source]['friends'].append(target)
                if source not in network[target]['friends']:
                    network[target]['friends'].append(source)
        return network
    
    def _print_console_report(self):
        print("\n=== SUPERHERO NETWORK REPORT ===")
        
        # 1. Total number of superheroes
        total_heroes = len(self.heroes_df)
        print(f"\n1. Total Superheroes: {total_heroes}")
        
        # 2. Total number of connections
        total_connections = len(self.links_df)
        print(f"2. Total Connections: {total_connections}")
        
        # 3. Superheroes added in last 3 days
        cutoff_date = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
        recent_heroes = self.heroes_df[self.heroes_df['created_at'] >= cutoff_date]['name'].tolist()
        print(f"3. Recently Added (last 3 days): {', '.join(recent_heroes) if recent_heroes else 'None'}")
        
        # 4. Top 3 most connected superheroes
        connection_counts = []
        for hero_id in self.network:
            hero_name = self.network[hero_id]['name']
            connection_counts.append((hero_name, len(self.network[hero_id]['friends'])))
        
        top_connected = sorted(connection_counts, key=lambda x: x[1], reverse=True)[:3]
        print("\n4. Top 3 Most Connected Superheroes:")
        for hero, count in top_connected:
            print(f"   - {hero}: {count} connections")
        
        # 5. Dataiskole information
        dataiskole_info = self.get_hero_info('dataiskole')
        if dataiskole_info:
            print("\n5. Dataiskole Details:")
            print(f"   - Added on: {dataiskole_info['created_at']}")
            friends_names = [friend['name'] for friend in dataiskole_info['friends']]
            print(f"   - Friends: {', '.join(friends_names) if friends_names else 'None'}")
        else:
            print("\n5. Dataiskole not found in the network")
        
        # Generate and show the graph
        self._generate_console_graph()
    
    def _generate_console_graph(self):
        print("\nGenerating Network Visualization...")
        self.generate_network_image('superhero_network.png')
        print("Image saved as 'superhero_network.png' in your project directory")
    
    def generate_network_image(self, filename=None, format='png'):
        G = nx.Graph()
        
        # Add nodes with attributes
        for hero_id in self.network:
            hero = self.network[hero_id]
            G.add_node(hero['name'], 
                       color=random.choice(COLOR_PALETTE),
                       size=50 + len(hero['friends']) * 10,  # Reduced base size
                       emoji=hero['emoji'])
        
        # Add edges
        for hero_id in self.network:
            hero = self.network[hero_id]
            for friend_id in hero['friends']:
                G.add_edge(hero['name'], self.network[friend_id]['name'])
        
        # Draw the graph
        plt.figure(figsize=(20, 16))  # Increased figure size
        pos = nx.spring_layout(G, seed=42, k=0.3)  # Increased k for better separation
        
        # Got node attributes
        node_colors = [G.nodes[n]['color'] for n in G.nodes()]
        node_sizes = [G.nodes[n]['size'] for n in G.nodes()]
        labels = {n: f"{G.nodes[n]['emoji']} {n}" for n in G.nodes()}
        
        # Draw with style
        nx.draw(G, pos, 
                labels=labels,
                node_size=node_sizes,
                node_color=node_colors,
                font_size=12,  # Increased font size
                font_weight='bold', 
                edge_color='#AAAAAA',
                width=1.5,
                alpha=0.9)
        
        # Add edge labels for clarity
        edge_labels = {(u, v): f"{u} ↔ {v}" for u, v in G.edges()}
        nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels, font_size=8)
        
        plt.title("Superhero Friendship Network", fontsize=20, pad=30)
        
        if filename:
            plt.savefig(filename, dpi=600, bbox_inches='tight')  # Increased DPI
            plt.close()
            return None
        else:
            buf = BytesIO()
            plt.savefig(buf, format=format, dpi=600, bbox_inches='tight')
            plt.close()
            buf.seek(0)
            return buf
    
    def get_stats(self):
        total_heroes = len(self.heroes_df)
        total_connections = len(self.links_df)
        
        cutoff_date = (datetime.now() - timedelta(days=3)).strftime('%Y-%m-%d')
        recent_heroes = self.heroes_df[self.heroes_df['created_at'] >= cutoff_date]['name'].tolist()
        
        connection_counts = []
        for hero_id in self.network:
            hero = self.network[hero_id]
            connection_counts.append({
                'name': hero['name'],
                'connections': len(hero['friends']),
                'emoji': hero['emoji']
            })
        
        top_connected = sorted(connection_counts, key=lambda x: x['connections'], reverse=True)[:3]
        
        return {
            'total_heroes': total_heroes,
            'total_connections': total_connections,
            'recent_heroes': recent_heroes,
            'top_connected': top_connected
        }
    
    def get_hero_info(self, name):
        hero = self.heroes_df[self.heroes_df['name'] == name]
        if hero.empty:
            return None
        
        hero_id = hero['id'].values[0]
        hero_data = self.network[hero_id]
        friends = []
        
        for friend_id in hero_data['friends']:
            friend = self.network[friend_id]
            friends.append({
                'name': friend['name'],
                'emoji': friend['emoji']
            })
        
        return {
            'name': name,
            'emoji': hero_data['emoji'],
            'created_at': hero_data['created_at'],
            'friends': friends
        }
    
    def add_hero(self, name, created_at=None):
        if created_at is None:
            created_at = datetime.now().strftime('%Y-%m-%d')
        
        new_id = 1 if self.heroes_df.empty else self.heroes_df['id'].max() + 1
        new_hero = pd.DataFrame({
            'id': [new_id], 
            'name': [name], 
            'created_at': [created_at]
        })
        self.heroes_df = pd.concat([self.heroes_df, new_hero], ignore_index=True)
        self.network[new_id] = {
            'name': name,
            'created_at': created_at,
            'friends': [],
            'emoji': '🆕'
        }
        self._save_data()
        return new_id
    
    def add_connection(self, source_name, target_name):
        source = self.heroes_df[self.heroes_df['name'] == source_name]
        target = self.heroes_df[self.heroes_df['name'] == target_name]
        if source.empty or target.empty:
            return False
        
        source_id = source['id'].values[0]
        target_id = target['id'].values[0]
        
        if target_id not in self.network[source_id]['friends']:
            self.network[source_id]['friends'].append(target_id)
            self.network[target_id]['friends'].append(source_id)
            new_link = pd.DataFrame({'source': [source_id], 'target': [target_id]})
            self.links_df = pd.concat([self.links_df, new_link], ignore_index=True)
            self._save_data()
            return True
        return False
    
    def get_graph_data(self):
        G = nx.Graph()
        
        # Add nodes with emojis
        for hero_id in self.network:
            hero = self.network[hero_id]
            G.add_node(hero_id, 
                       name=hero['name'],
                       emoji=hero['emoji'],
                       connections=len(hero['friends']))
        
        # Add edges
        for hero_id in self.network:
            hero = self.network[hero_id]
            for friend_id in hero['friends']:
                G.add_edge(hero_id, friend_id)
        
        # Convert to D3.js format
        nodes = []
        for hero_id in self.network:
            hero = self.network[hero_id]
            nodes.append({
                'id': hero_id,
                'name': hero['name'],
                'emoji': hero['emoji'],
                'connections': len(hero['friends'])
            })
        
        links = [{'source': row['source'], 'target': row['target']} 
                 for _, row in self.links_df.iterrows()]
        
        return {'nodes': nodes, 'links': links}
    
    def _save_data(self):
        self.heroes_df.to_csv(HEROES_FILE, index=False)
        self.links_df.to_csv(LINKS_FILE, index=False)

# Initialize network
network = SuperheroNetwork()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    return jsonify(network.get_stats())

@app.route('/api/hero/<name>')
def get_hero(name):
    return jsonify(network.get_hero_info(name))

@app.route('/api/graph')
def get_graph():
    return jsonify(network.get_graph_data())

@app.route('/api/add_hero', methods=['POST'])
def add_hero():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Name is required'}), 400
    
    created_at = data.get('created_at')
    hero_id = network.add_hero(name, created_at)
    return jsonify({
        'success': True, 
        'id': hero_id,
        'message': f"Hero {name} added successfully! 🎉"
    })

@app.route('/api/add_connection', methods=['POST'])
def add_connection():
    data = request.json
    source = data.get('source')
    target = data.get('target')
    if not source or not target:
        return jsonify({'error': 'Both source and target are required'}), 400
    
    if network.add_connection(source, target):
        return jsonify({
            'success': True,
            'message': f"Connection between {source} and {target} created! 🤝"
        })
    return jsonify({
        'success': False, 
        'message': 'Connection already exists or heroes not found ⚠️'
    })

@app.route('/network_image')
def get_network_image():
    img_buffer = network.generate_network_image()
    return send_file(img_buffer, mimetype='image/png')

@app.route('/network_image/svg')
def get_network_image_svg():
    img_buffer = network.generate_network_image(format='svg')
    return send_file(img_buffer, mimetype='image/svg+xml')

if __name__ == '__main__':
    app.run(debug=True)