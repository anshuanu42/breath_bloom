from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Hardcoded AQI values for Indian cities
AQI_DATA = {
    "Delhi": 180,
    "Mumbai": 90,
    "Bangalore": 45,
    "Chennai": 120,
    "Kolkata": 150,
    "Hyderabad": 60,
    "Pune": 70,
    "Ahmedabad": 110,
    "Jaipur": 130,
    "Lucknow": 140
}

# Mock AQI history data (past 5 days)
AQI_HISTORY = {
    "Delhi": [180, 175, 190, 200, 170],
    "Mumbai": [90, 85, 95, 100, 80],
    "Bangalore": [45, 40, 50, 55, 35],
    "Chennai": [120, 115, 125, 130, 110],
    "Kolkata": [150, 145, 155, 160, 140],
    "Hyderabad": [60, 55, 65, 70, 50],
    "Pune": [70, 65, 75, 80, 60],
    "Ahmedabad": [110, 105, 115, 120, 100],
    "Jaipur": [130, 125, 135, 140, 120],
    "Lucknow": [140, 135, 145, 150, 130]
}

# Diverse tasks based on age groups and AQI ranges with Bloom Points
TASKS = {
    "children": {  # Ages 5-12
        "0-50": [
            {"task": "Create urban wind corridors", "points": 15},
            {"task": "Launch community air monitoring networks", "points": 20},
            {"task": "Plant native trees in parks", "points": 10}
        ],
        "51-100": [
            {"task": "Design eco-friendly toys", "points": 10},
            {"task": "Start a school recycling program", "points": 15},
            {"task": "Paint with natural dyes", "points": 10}
        ],
        "101-150": [
            {"task": "Organize a clean-up walk", "points": 15},
            {"task": "Build a birdhouse", "points": 10},
            {"task": "Learn about air filters", "points": 10}
        ],
        "151-200": [
            {"task": "Create car-free play zones", "points": 20},
            {"task": "Make a compost bin", "points": 15},
            {"task": "Join a tree-planting event", "points": 15}
        ],
        "201-300": [
            {"task": "Promote walking to school", "points": 15},
            {"task": "Create anti-pollution posters", "points": 10},
            {"task": "Participate in a green challenge", "points": 20}
        ],
        "301+": [
            {"task": "Assist in drone air quality surveys", "points": 25},
            {"task": "Design a pollution mask", "points": 15},
            {"task": "Help monitor local air", "points": 20}
        ]
    },
    "teenagers": {  # Ages 13-19
        "0-50": [
            {"task": "Develop air cleaning bicycle paths", "points": 20},
            {"task": "Install solar-powered lights", "points": 15},
            {"task": "Organize a bike rally", "points": 15}
        ],
        "51-100": [
            {"task": "Apply eco-friendly paints", "points": 10},
            {"task": "Set up green roofs", "points": 20},
            {"task": "Conduct air quality workshops", "points": 15}
        ],
        "101-150": [
            {"task": "Implement remote work days", "points": 20},
            {"task": "Introduce traffic calming zones", "points": 15},
            {"task": "Launch a carpool initiative", "points": 15}
        ],
        "151-200": [
            {"task": "Deploy mobile air purifiers", "points": 25},
            {"task": "Enforce no-idling zones", "points": 15},
            {"task": "Monitor pollution hotspots", "points": 20}
        ],
        "201-300": [
            {"task": "Use drones for tree planting", "points": 25},
            {"task": "Promote public transit use", "points": 15},
            {"task": "Create air quality apps", "points": 20}
        ],
        "301+": [
            {"task": "Establish emergency bike lanes", "points": 25},
            {"task": "Lead pollution awareness campaigns", "points": 20},
            {"task": "Coordinate air filter drives", "points": 20}
        ]
    },
    "adults": {  # Ages 20+
        "0-50": [
            {"task": "Implement photocatalytic coatings", "points": 20},
            {"task": "Install air purifying billboards", "points": 25},
            {"task": "Design green building plans", "points": 20}
        ],
        "51-100": [
            {"task": "Enforce flexible work hours", "points": 15},
            {"task": "Deploy smog-eating cement", "points": 20},
            {"task": "Initiate urban forest projects", "points": 20}
        ],
        "101-150": [
            {"task": "Restrict high-emission vehicles", "points": 20},
            {"task": "Introduce congestion pricing", "points": 15},
            {"task": "Promote telecommuting", "points": 15}
        ],
        "151-200": [
            {"task": "Activate air purification towers", "points": 25},
            {"task": "Expand green wall installations", "points": 20},
            {"task": "Implement traffic rerouting", "points": 15}
        ],
        "201-300": [
            {"task": "Mandate remote work policies", "points": 20},
            {"task": "Apply maximum road tolls", "points": 15},
            {"task": "Deploy emergency air filters", "points": 25}
        ],
        "301+": [
            {"task": "Launch widespread drone spraying", "points": 30},
            {"task": "Create city-wide no-car zones", "points": 25},
            {"task": "Maximize all purification tech", "points": 30}
        ]
    }
}

# Enhanced Rewards based on age groups
REWARDS = {
    "children": [
        {"title": "Eco-Friendly Coloring Book", "points": 30, "description": "A coloring book with nature themes."},
        {"title": "Plantable Seed Paper", "points": 50, "description": "Paper that grows into plants."},
        {"title": "Mini Gardening Kit", "points": 75, "description": "A kit to start your own garden."},
        {"title": "Eco-Friendly Backpack", "points": 100, "description": "Sustainable backpack for school."},
        {"title": "Nature Explorer Kit", "points": 150, "description": "Binoculars and a nature journal."},
        {"title": "Reusable Straw Set", "points": 200, "description": "Set of eco-friendly straws."}
    ],
    "teenagers": [
        {"title": "Reusable Face Mask", "points": 50, "description": "Sustainable face mask."},
        {"title": "Bamboo Water Bottle", "points": 75, "description": "Eco-friendly water bottle."},
        {"title": "Eco-Friendly Notebook", "points": 100, "description": "Notebook from recycled paper."},
        {"title": "Solar-Powered Phone Charger", "points": 150, "description": "Portable solar charger."},
        {"title": "Sustainable Sneakers", "points": 200, "description": "Sneakers from recycled materials."},
        {"title": "Eco-Friendly T-Shirt", "points": 250, "description": "Organic cotton t-shirt."}
    ],
    "adults": [
        {"title": "Air Purifying Plant", "points": 50, "description": "Plant that cleans indoor air."},
        {"title": "Smart Air Quality Monitor", "points": 100, "description": "Personal air quality device."},
        {"title": "Eco-Friendly Coffee Maker", "points": 150, "description": "Sustainable coffee maker."},
        {"title": "Solar Charger", "points": 200, "description": "Portable solar charging device."},
        {"title": "Eco-Friendly Home Kit", "points": 300, "description": "Kit with sustainable products."},
        {"title": "Reusable Laptop Sleeve", "points": 350, "description": "Eco-friendly laptop sleeve."}
    ]
}

# Badges for achievements
BADGES = [
    {"name": "Green Sprout", "points": 50, "description": "Earned 50 Bloom Points!"},
    {"name": "Eco Hero", "points": 100, "description": "Earned 100 Bloom Points!"},
    {"name": "Nature Champion", "points": 200, "description": "Earned 200 Bloom Points!"},
    {"name": "Air Guardian", "points": 300, "description": "Earned 300 Bloom Points!"},
    {"name": "Planet Protector", "points": 500, "description": "Earned 500 Bloom Points!"}
]

# Load and save user data
def load_users():
    if os.path.exists('users.json'):
        with open('users.json', 'r') as f:
            return json.load(f)
    return []

def save_users(users):
    with open('users.json', 'w') as f:
        json.dump(users, f, indent=4)

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    age = data.get('age')
    username = data.get('username')

    print(f"Received login attempt: {email}, {password}, {age}, {username}")

    if not email or not password or not age or not username:
        print("Validation failed: Missing email, password, age, or username")
        return jsonify({'error': 'Email, password, age, and username are required'}), 400

    users = load_users()
    user = next((u for u in users if u['email'] == email and u['password'] == password), None)

    if user:
        print(f"Login successful for {email}")
        return jsonify({'message': 'Login successful', 'user': user}), 200
    else:
        return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    age = data.get('age')
    username = data.get('username')

    print(f"Received signup attempt: {email}, {password}, {age}, {username}")

    if not email or not password or not age or not username:
        print("Validation failed: Missing email, password, age, or username")
        return jsonify({'error': 'Email, password, age, and username are required'}), 400

    users = load_users()
    if any(u['email'] == email for u in users):
        print("Signup failed: Email already exists")
        return jsonify({'error': 'Email already registered'}), 409

    new_user = {
        'email': email,
        'password': password,
        'age': int(age),
        'username': username,
        'city': '',
        'bloom_points': 0,
        'tasks_completed': 0,
        'badges': [],
        'rewards': [],
        'community': 'Team Green',
        'profile_image': ''
    }
    users.append(new_user)
    save_users(users)
    print(f"New user signed up: {email}")
    return jsonify({'message': 'Signup successful', 'user': new_user}), 201

@app.route('/api/cities', methods=['GET'])
def get_cities():
    cities = list(AQI_DATA.keys())
    print("Returning cities:", cities)
    return jsonify(cities), 200

@app.route('/api/select-city', methods=['POST'])
def select_city():
    data = request.get_json()
    email = data.get('email')
    city = data.get('city')

    print(f"Received city selection: {email}, {city}")

    if not email or not city:
        print("Validation failed: Missing email or city")
        return jsonify({'error': 'Email and city are required'}), 400

    users = load_users()
    user = next((u for u in users if u['email'] == email), None)
    if not user:
        print("User not found")
        return jsonify({'error': 'User not found'}), 404

    user['city'] = city
    save_users(users)
    print(f"City selected for {email}: {city}")
    return jsonify({'message': 'City selected', 'user': user}), 200

@app.route('/api/user', methods=['GET'])
def get_user():
    email = request.args.get('email')
    print(f"Fetching user data for: {email}")

    if not email:
        print("Validation failed: Missing email")
        return jsonify({'error': 'Email is required'}), 400

    users = load_users()
    user = next((u for u in users if u['email'] == email), None)
    if not user:
        print("User not found")
        return jsonify({'error': 'User not found'}), 404

    print(f"User data retrieved: {user}")
    return jsonify(user), 200

@app.route('/api/aqi', methods=['GET'])
def get_aqi():
    city = request.args.get('city')
    print(f"Fetching AQI for city: {city}")

    if not city:
        print("Validation failed: Missing city")
        return jsonify({'error': 'City is required'}), 400

    aqi = AQI_DATA.get(city, 40)  # Default to 40 if city not found
    print(f"AQI for {city}: {aqi}")
    return jsonify({
        'status': 'ok',
        'data': {
            'aqi': aqi,
            'idx': 1451,
            'attributions': []
        }
    }), 200

@app.route('/api/aqi-history', methods=['GET'])
def get_aqi_history():
    city = request.args.get('city')
    print(f"Fetching AQI history for city: {city}")

    if not city:
        print("Validation failed: Missing city")
        return jsonify({'error': 'City is required'}), 400

    history = AQI_HISTORY.get(city, [40, 40, 40, 40, 40])  # Default history if city not found
    print(f"AQI history for {city}: {history}")
    return jsonify({
        'status': 'ok',
        'data': {
            'history': history,
            'labels': ["Day 5", "Day 4", "Day 3", "Day 2", "Day 1"]
        }
    }), 200

@app.route('/api/complete-task', methods=['POST'])
def complete_task():
    data = request.get_json()
    email = data.get('email')
    task = data.get('task')
    points = data.get('points')  # Receive the points for the task

    print(f"Received task completion: {email}, {task}, {points}")

    if not email or not task or points is None:
        print("Validation failed: Missing email, task, or points")
        return jsonify({'error': 'Email, task, and points are required'}), 400

    users = load_users()
    user = next((u for u in users if u['email'] == email), None)
    if not user:
        print("User not found")
        return jsonify({'error': 'User not found'}), 404

    user['bloom_points'] += int(points)  # Add the task-specific points
    user['tasks_completed'] += 1

    for badge in BADGES:
        if user['bloom_points'] >= badge['points'] and badge['name'] not in user['badges']:
            user['badges'].append(badge['name'])

    save_users(users)
    print(f"Task completed for {email}: {task}, awarded {points} Bloom Points")
    return jsonify({'message': 'Task completed', 'user': user}), 200

@app.route('/api/redeem-reward', methods=['POST'])
def redeem_reward():
    data = request.get_json()
    email = data.get('email')
    reward = data.get('reward')

    print(f"Received reward redemption: {email}, {reward}")

    if not email or not reward:
        print("Validation failed: Missing email or reward")
        return jsonify({'error': 'Email and reward are required'}), 400

    users = load_users()
    user = next((u for u in users if u['email'] == email), None)
    if not user:
        print("User not found")
        return jsonify({'error': 'User not found'}), 404

    age = user['age']
    age_group = 'children' if age <= 12 else 'teenagers' if age <= 19 else 'adults'
    available_rewards = REWARDS[age_group]
    selected_reward = next((r for r in available_rewards if r['title'] == reward), None)

    if not selected_reward:
        print("Reward not found")
        return jsonify({'error': 'Reward not found'}), 404

    if user['bloom_points'] < selected_reward['points']:
        print("Not enough Bloom Points")
        return jsonify({'error': 'Not enough Bloom Points'}), 400

    user['bloom_points'] -= selected_reward['points']
    user['rewards'].append(reward)
    save_users(users)
    print(f"Reward redeemed for {email}: {reward}")
    return jsonify({'message': 'Reward redeemed', 'user': user}), 200

@app.route('/api/leaderboard', methods=['GET'])
def get_leaderboard():
    users = load_users()
    community_points = {}
    for user in users:
        community = user['community']
        points = user['bloom_points']
        if community in community_points:
            community_points[community] += points
        else:
            community_points[community] = points

    leaderboard = [{'community': community, 'points': points} for community, points in community_points.items()]
    leaderboard.sort(key=lambda x: x['points'], reverse=True)
    print("Leaderboard data:", leaderboard)
    return jsonify(leaderboard), 200

@app.route('/api/update-user', methods=['POST'])
def update_user():
    data = request.get_json()
    email = data.get('email')
    new_username = data.get('username')
    new_email = data.get('new_email')
    new_age = data.get('age')
    new_city = data.get('city')
    profile_image = data.get('profile_image')

    print(f"Received user update: {email}, {new_username}, {new_email}, {new_age}, {new_city}, {profile_image}")

    if not email or not new_username or not new_email or not new_age:
        print("Validation failed: Missing required fields")
        return jsonify({'error': 'Email, username, new email, and age are required'}), 400

    users = load_users()
    user = next((u for u in users if u['email'] == email), None)
    if not user:
        print("User not found")
        return jsonify({'error': 'User not found'}), 404

    # Check if the new email is already taken by another user
    if new_email != email and any(u['email'] == new_email for u in users):
        print("Update failed: New email already exists")
        return jsonify({'error': 'New email already registered'}), 409

    # Update user details
    user['username'] = new_username
    user['email'] = new_email
    user['age'] = int(new_age)
    if new_city:
        user['city'] = new_city
    if profile_image:
        user['profile_image'] = profile_image

    save_users(users)
    print(f"User updated: {new_email}")
    return jsonify({'message': 'User updated successfully', 'user': user}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)