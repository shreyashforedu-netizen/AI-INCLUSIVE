"""
Notification helper — creates in-app notification records in SQLite.
Extend this module with Flask-Mail or Twilio for email / SMS alerts.
"""
from database.db import db, Notification
from datetime import datetime


def create_notification(title: str, message: str, notif_type: str = 'system', user_id: int = None):
    """Persist a notification to the database."""
    notif = Notification(
        user_id    = user_id,
        title      = title,
        message    = message,
        notif_type = notif_type,
        is_read    = False,
        created_at = datetime.utcnow(),
    )
    db.session.add(notif)
    db.session.commit()
    return notif


def notify_recommendation_ready(user_name: str, user_id: int):
    """Fire when AI recommendations have been generated for a user."""
    return create_notification(
        title      = '🎯 Your Recommendations Are Ready!',
        message    = f'Hi {user_name}! Your personalised AI opportunity recommendations have been generated. Check your dashboard now.',
        notif_type = 'recommendation',
        user_id    = user_id,
    )


def notify_contact_received(sender_name: str):
    """Fire when a contact form submission is received (admin alert)."""
    return create_notification(
        title      = '📩 New Contact Message',
        message    = f'{sender_name} sent a new feedback / contact message. Review it in the admin panel.',
        notif_type = 'contact',
        user_id    = None,   # global / admin notification
    )


def notify_system(title: str, message: str):
    """General system-wide notification."""
    return create_notification(title=title, message=message, notif_type='system')
