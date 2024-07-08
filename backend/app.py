from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///discussion_platform.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    mobile_no = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Discussion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    text = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255))
    hashtags = db.Column(db.ARRAY(db.String), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=db.func.current_timestamp())
    view_count = db.Column(db.Integer, default=0)

db.create_all()

@app.route('/users/signup', methods=['POST'])
def signup():
    data = request.get_json()
    new_user = User(name=data['name'], mobile_no=data['mobile_no'], email=data['email'], password=data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/users/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email'], password=data['password']).first()
    if user:
        return jsonify({"message": "Login successful", "user_id": user.id}), 200
    else:
        return jsonify({"message": "Invalid email or password"}), 401

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    output = []
    for user in users:
        user_data = {'id': user.id, 'name': user.name, 'email': user.email}
        output.append(user_data)
    return jsonify(output), 200

@app.route('/discussions', methods=['POST'])
def create_discussion():
    data = request.get_json()
    new_discussion = Discussion(user_id=data['user_id'], text=data['text'], image_url=data['image_url'], hashtags=data['hashtags'])
    db.session.add(new_discussion)
    db.session.commit()
    return jsonify({"message": "Discussion created successfully"}), 201

@app.route('/discussions/<int:id>', methods=['PUT'])
def update_discussion(id):
    data = request.get_json()
    discussion = Discussion.query.get_or_404(id)
    discussion.text = data['text']
    discussion.image_url = data['image_url']
    discussion.hashtags = data['hashtags']
    db.session.commit()
    return jsonify({"message": "Discussion updated successfully"}), 200

@app.route('/discussions/<int:id>', methods=['DELETE'])
def delete_discussion(id):
    discussion = Discussion.query.get_or_404(id)
    db.session.delete(discussion)
    db.session.commit()
    return jsonify({"message": "Discussion deleted successfully"}), 200

@app.route('/discussions', methods=['GET'])
def get_discussions():
    tags = request.args.get('tags')
    text = request.args.get('text')
    if tags:
        tags = tags.split(',')
        discussions = Discussion.query.filter(Discussion.hashtags.overlap(tags)).all()
    elif text:
        discussions = Discussion.query.filter(Discussion.text.ilike(f'%{text}%')).all()
    else:
        discussions = Discussion.query.all()
    output = []
    for discussion in discussions:
        discussion_data = {
            'id': discussion.id,
            'user_id': discussion.user_id,
            'text': discussion.text,
            'image_url': discussion.image_url,
            'hashtags': discussion.hashtags,
            'created_at': discussion.created_at,
            'updated_at': discussion.updated_at,
            'view_count': discussion.view_count
        }
        output.append(discussion_data)
    return jsonify(output), 200

if __name__ == '__main__':
    app.run(debug=True)
