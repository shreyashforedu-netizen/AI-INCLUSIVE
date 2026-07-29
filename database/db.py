from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import json

db = SQLAlchemy()


class UserProfile(db.Model):
    __tablename__ = 'user_profiles'
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100), nullable=False)
    age           = db.Column(db.Integer)
    gender        = db.Column(db.String(20))
    state         = db.Column(db.String(60))
    education     = db.Column(db.String(100))
    skills        = db.Column(db.Text)          # comma-separated
    interests     = db.Column(db.Text)
    employment    = db.Column(db.String(100))
    annual_income = db.Column(db.Float, default=0)
    preferred_career = db.Column(db.String(100))
    language      = db.Column(db.String(50))
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':              self.id,
            'name':            self.name,
            'age':             self.age,
            'gender':          self.gender,
            'state':           self.state,
            'education':       self.education,
            'skills':          [s.strip() for s in self.skills.split(',') if s.strip()] if self.skills else [],
            'interests':       self.interests,
            'employment':      self.employment,
            'annual_income':   self.annual_income,
            'preferred_career': self.preferred_career,
            'language':        self.language,
            'created_at':      self.created_at.isoformat(),
        }


class Recommendation(db.Model):
    __tablename__ = 'recommendations'
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey('user_profiles.id'), nullable=False)
    jobs           = db.Column(db.Text)   # JSON
    courses        = db.Column(db.Text)   # JSON
    scholarships   = db.Column(db.Text)   # JSON
    schemes        = db.Column(db.Text)   # JSON
    roadmap        = db.Column(db.Text)   # JSON
    salary_range   = db.Column(db.String(100))
    missing_skills = db.Column(db.Text)   # JSON
    priority_score = db.Column(db.Float, default=0)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        def safe_json(val):
            try:
                return json.loads(val) if val else []
            except Exception:
                return []
        return {
            'id':             self.id,
            'user_id':        self.user_id,
            'jobs':           safe_json(self.jobs),
            'courses':        safe_json(self.courses),
            'scholarships':   safe_json(self.scholarships),
            'schemes':        safe_json(self.schemes),
            'roadmap':        safe_json(self.roadmap),
            'salary_range':   self.salary_range,
            'missing_skills': safe_json(self.missing_skills),
            'priority_score': self.priority_score,
            'created_at':     self.created_at.isoformat(),
        }


class Contact(db.Model):
    __tablename__ = 'contacts'
    id         = db.Column(db.Integer, primary_key=True)
    name       = db.Column(db.String(100))
    email      = db.Column(db.String(150))
    subject    = db.Column(db.String(200))
    message    = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'name':       self.name,
            'email':      self.email,
            'subject':    self.subject,
            'message':    self.message,
            'created_at': self.created_at.isoformat(),
        }


class Notification(db.Model):
    __tablename__ = 'notifications'
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, nullable=True)   # None = global
    title      = db.Column(db.String(200))
    message    = db.Column(db.Text)
    notif_type = db.Column(db.String(50), default='system')   # recommendation | contact | system
    is_read    = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id':         self.id,
            'user_id':    self.user_id,
            'title':      self.title,
            'message':    self.message,
            'type':       self.notif_type,
            'is_read':    self.is_read,
            'created_at': self.created_at.isoformat(),
        }
