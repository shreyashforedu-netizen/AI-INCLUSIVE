"""
app.py  —  AI for Inclusive Opportunities
Flask backend: routes, REST API, rule-based recommendation engine.
"""
import os, json
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from database.db import db, UserProfile, Recommendation, Contact, Notification
from notifications.notifier import notify_recommendation_ready, notify_contact_received

# ─────────────────────────────────────────────
#  App Setup
# ─────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'ai-inclusive-secret-2024')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///aiinclusive.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():
    db.create_all()
    # Seed a welcome notification on first run
    if Notification.query.count() == 0:
        from notifications.notifier import notify_system
        notify_system(
            '👋 Welcome to AI for Inclusive Opportunities!',
            'Explore our AI-powered platform to discover jobs, scholarships, courses, and government schemes tailored just for you.'
        )


# ─────────────────────────────────────────────
#  Page Routes
# ─────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/finder')
def finder():
    return render_template('finder.html')

@app.route('/recommendations')
def recommendations():
    user_id = session.get('last_user_id')
    return render_template('recommendations.html', user_id=user_id)

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')


# ─────────────────────────────────────────────
#  Rule-Based Recommendation Engine
# ─────────────────────────────────────────────
def generate_recommendations(profile: UserProfile) -> dict:
    skills_raw  = [s.strip().lower() for s in (profile.skills or '').split(',') if s.strip()]
    education   = (profile.education or '').lower()
    income      = profile.annual_income or 0
    career_pref = (profile.preferred_career or '').lower()
    age         = profile.age or 25

    # ── Jobs ──────────────────────────────────
    tech_skills  = {'python', 'java', 'javascript', 'html', 'css', 'sql', 'react', 'node', 'ai', 'ml', 'data'}
    health_skills = {'nursing', 'medical', 'lab', 'pharmacy', 'health', 'doctor'}
    agri_skills  = {'farming', 'agriculture', 'horticulture', 'dairy', 'crop'}
    trade_skills = {'electrical', 'plumbing', 'welding', 'carpentry', 'mechanic', 'tailoring', 'stitching'}
    creative_skills = {'design', 'drawing', 'art', 'music', 'video', 'photo', 'content'}
    finance_skills  = {'accounting', 'finance', 'banking', 'tally', 'gst', 'tax'}

    matched_jobs = []
    if any(s in tech_skills for s in skills_raw) or 'tech' in career_pref or 'software' in career_pref:
        matched_jobs += [
            {'title': 'Software Developer',     'company': 'Tech Mahindra / Wipro',       'type': 'Full Time', 'salary': '₹3–8 LPA'},
            {'title': 'Data Analyst',            'company': 'Infosys / Capgemini',          'type': 'Full Time', 'salary': '₹4–9 LPA'},
            {'title': 'Web Developer',           'company': 'Startup / Freelance',          'type': 'Hybrid',    'salary': '₹2.5–6 LPA'},
        ]
    if any(s in health_skills for s in skills_raw) or 'health' in career_pref or 'medical' in career_pref:
        matched_jobs += [
            {'title': 'Community Health Worker', 'company': 'PHC / NGO',                   'type': 'Government', 'salary': '₹2–3.5 LPA'},
            {'title': 'Lab Technician',          'company': 'Diagnostic Labs',              'type': 'Full Time',  'salary': '₹2.5–4 LPA'},
            {'title': 'Medical Billing Analyst', 'company': 'Hospital Groups',              'type': 'Full Time',  'salary': '₹3–5 LPA'},
        ]
    if any(s in agri_skills for s in skills_raw) or 'agri' in career_pref:
        matched_jobs += [
            {'title': 'Agricultural Officer',   'company': 'State Agriculture Dept.',       'type': 'Government', 'salary': '₹3–5 LPA'},
            {'title': 'Farm Manager',            'company': 'Corporate Farms',              'type': 'Full Time',  'salary': '₹2.5–4 LPA'},
        ]
    if any(s in trade_skills for s in skills_raw) or 'trade' in career_pref or 'skill' in career_pref:
        matched_jobs += [
            {'title': 'Electrician (ITI)',       'company': 'L&T / BHEL / Self',            'type': 'Contractual', 'salary': '₹2–4 LPA'},
            {'title': 'CNC Operator',            'company': 'Manufacturing Units',          'type': 'Full Time',   'salary': '₹2.5–4.5 LPA'},
        ]
    if any(s in creative_skills for s in skills_raw) or 'design' in career_pref or 'media' in career_pref:
        matched_jobs += [
            {'title': 'Graphic Designer',        'company': 'Media Agencies / Freelance',   'type': 'Hybrid',    'salary': '₹2.4–5 LPA'},
            {'title': 'Content Creator',         'company': 'YouTube / Instagram',          'type': 'Freelance', 'salary': '₹1.5–6 LPA'},
        ]
    if any(s in finance_skills for s in skills_raw) or 'finance' in career_pref or 'banking' in career_pref:
        matched_jobs += [
            {'title': 'Bank PO / Clerk',         'company': 'SBI / PNB / BOB',              'type': 'Government', 'salary': '₹3.5–6 LPA'},
            {'title': 'Accountant',              'company': 'SMEs / Firms',                 'type': 'Full Time',  'salary': '₹2.5–5 LPA'},
        ]

    # Default jobs if no match
    if not matched_jobs:
        matched_jobs = [
            {'title': 'Customer Support Executive', 'company': 'BPO / E-commerce',      'type': 'Full Time', 'salary': '₹2–3 LPA'},
            {'title': 'Data Entry Operator',        'company': 'Government / Corporate', 'type': 'Full Time', 'salary': '₹1.8–3 LPA'},
            {'title': 'Delivery & Logistics',       'company': 'Amazon / Flipkart',      'type': 'Gig',       'salary': '₹1.5–2.5 LPA'},
        ]

    # ── Courses ───────────────────────────────
    all_courses = [
        {'name': 'Python for Beginners',        'platform': 'NPTEL / Coursera',       'duration': '8 weeks',  'fee': 'Free'},
        {'name': 'Digital Marketing Mastery',   'platform': 'Google Skillshop',       'duration': '6 weeks',  'fee': 'Free'},
        {'name': 'Data Science Fundamentals',   'platform': 'edX / IBM',              'duration': '12 weeks', 'fee': 'Free'},
        {'name': 'Spoken English & Soft Skills','platform': 'PMKVY / NSDC',           'duration': '4 weeks',  'fee': 'Free'},
        {'name': 'Tally & GST Accounting',      'platform': 'Tally Academy',          'duration': '6 weeks',  'fee': '₹2,000'},
        {'name': 'Web Development Bootcamp',    'platform': 'freeCodeCamp',           'duration': '16 weeks', 'fee': 'Free'},
        {'name': 'AI & Machine Learning Basics','platform': 'Google / Coursera',      'duration': '10 weeks', 'fee': 'Free'},
        {'name': 'Entrepreneurship Essentials', 'platform': 'IIM-B MOOC',             'duration': '6 weeks',  'fee': 'Free'},
    ]
    courses = all_courses[:5]

    # ── Scholarships ──────────────────────────
    scholarships = []
    if income < 100000:
        scholarships += [
            {'name': 'PM Scholarship Scheme',            'amount': '₹25,000/year', 'eligibility': 'Family income < ₹1L'},
            {'name': 'National Scholarship Portal (NSP)', 'amount': '₹10,000–₹50,000', 'eligibility': 'Income < ₹1L, Merit'},
        ]
    if income < 250000:
        scholarships += [
            {'name': 'Post-Matric Scholarship (SC/ST/OBC)', 'amount': '₹5,000–₹30,000', 'eligibility': 'Income < ₹2.5L'},
            {'name': 'State Government Scholarship',        'amount': 'Varies by state',  'eligibility': 'State resident'},
        ]
    if 'graduate' in education or 'bachelor' in education or 'degree' in education:
        scholarships += [
            {'name': 'AICTE Pragati Scholarship',   'amount': '₹50,000/year', 'eligibility': 'Technical degree students'},
        ]
    if not scholarships:
        scholarships = [
            {'name': 'Merit-cum-Means Scholarship', 'amount': '₹20,000/year', 'eligibility': 'Based on merit & income'},
        ]

    # ── Government Schemes ────────────────────
    schemes = [
        {'name': 'PM Kaushal Vikas Yojana (PMKVY)', 'benefit': 'Free skill training + ₹8,000 stipend', 'ministry': 'Skill Development'},
        {'name': 'Startup India Scheme',              'benefit': 'Funding + mentorship for entrepreneurs', 'ministry': 'DPIIT'},
    ]
    if income < 300000:
        schemes += [
            {'name': 'Ayushman Bharat PM-JAY',  'benefit': '₹5 Lakh health cover/year',       'ministry': 'Health'},
            {'name': 'PM Awas Yojana (PMAY)',   'benefit': 'Subsidised housing loan up to ₹2.67L', 'ministry': 'Housing'},
            {'name': 'PM Jan Dhan Yojana',      'benefit': 'Zero-balance bank account + insurance', 'ministry': 'Finance'},
        ]
    if income < 150000:
        schemes += [
            {'name': 'PM Ujjwala Yojana',       'benefit': 'Free LPG connection for BPL families', 'ministry': 'Petroleum'},
            {'name': 'Antyodaya Anna Yojana',   'benefit': '35 kg grain/month at subsidised rate',  'ministry': 'Food & Civil Supplies'},
        ]

    # ── Career Roadmap ────────────────────────
    roadmap_steps = [
        {'step': 1, 'title': 'Skill Assessment',    'desc': 'Identify current skills and gap analysis', 'duration': '1 week'},
        {'step': 2, 'title': 'Enrol in Courses',    'desc': 'Pick 2–3 courses from recommendations',    'duration': '2–4 months'},
        {'step': 3, 'title': 'Build Portfolio',     'desc': 'Work on projects, internships, or gigs',   'duration': '1–3 months'},
        {'step': 4, 'title': 'Apply for Jobs',      'desc': 'Target entry-level roles in chosen career', 'duration': '1–2 months'},
        {'step': 5, 'title': 'Government Schemes',  'desc': 'Apply for scholarships and skill programs', 'duration': 'Ongoing'},
        {'step': 6, 'title': 'Career Growth',       'desc': 'Upskill, mentorship, and promotions',       'duration': '6–12 months'},
    ]

    # ── Salary Range ──────────────────────────
    if 'engineer' in education or 'b.tech' in education or 'mtech' in education:
        salary_range = '₹4 – ₹12 LPA'
    elif 'graduate' in education or 'bachelor' in education or 'degree' in education:
        salary_range = '₹2.5 – ₹7 LPA'
    elif 'diploma' in education or '12th' in education:
        salary_range = '₹1.8 – ₹4 LPA'
    elif '10th' in education:
        salary_range = '₹1.2 – ₹3 LPA'
    else:
        salary_range = '₹1.5 – ₹4 LPA'

    # ── Missing Skills ────────────────────────
    core_skills_needed = ['Communication', 'MS Office / Google Suite', 'Problem Solving', 'Time Management']
    missing = [s for s in core_skills_needed if s.lower() not in ' '.join(skills_raw)]

    # ── Priority Score ────────────────────────
    score = 50
    if skills_raw:     score += min(len(skills_raw) * 5, 20)
    if income < 200000: score += 10   # higher need → higher priority
    if age < 30:       score += 10
    if education in ['graduate', 'post graduate', 'bachelor', 'master']:
        score += 10
    score = min(score, 100)

    return {
        'jobs':           matched_jobs[:6],
        'courses':        courses,
        'scholarships':   scholarships,
        'schemes':        schemes,
        'roadmap':        roadmap_steps,
        'salary_range':   salary_range,
        'missing_skills': missing,
        'priority_score': score,
    }


# ─────────────────────────────────────────────
#  REST API
# ─────────────────────────────────────────────
@app.route('/api/submit', methods=['POST'])
def api_submit():
    """Receive Opportunity Finder form, save profile, generate recommendations."""
    data = request.get_json(force=True)
    if not data or not data.get('name'):
        return jsonify({'error': 'Invalid data'}), 400

    try:
        profile = UserProfile(
            name           = data.get('name', '').strip(),
            age            = int(data.get('age', 0)),
            gender         = data.get('gender', ''),
            state          = data.get('state', ''),
            education      = data.get('education', ''),
            skills         = data.get('skills', ''),
            interests      = data.get('interests', ''),
            employment     = data.get('employment', ''),
            annual_income  = float(data.get('annual_income', 0) or 0),
            preferred_career = data.get('preferred_career', ''),
            language       = data.get('language', ''),
        )
        db.session.add(profile)
        db.session.flush()   # get profile.id before commit

        rec_data = generate_recommendations(profile)
        rec = Recommendation(
            user_id        = profile.id,
            jobs           = json.dumps(rec_data['jobs']),
            courses        = json.dumps(rec_data['courses']),
            scholarships   = json.dumps(rec_data['scholarships']),
            schemes        = json.dumps(rec_data['schemes']),
            roadmap        = json.dumps(rec_data['roadmap']),
            salary_range   = rec_data['salary_range'],
            missing_skills = json.dumps(rec_data['missing_skills']),
            priority_score = rec_data['priority_score'],
        )
        db.session.add(rec)
        db.session.commit()

        session['last_user_id'] = profile.id

        notify_recommendation_ready(profile.name, profile.id)

        return jsonify({
            'success':  True,
            'user_id':  profile.id,
            'redirect': url_for('recommendations'),
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/recommendations/<int:user_id>', methods=['GET'])
def api_recommendations(user_id):
    """Return the latest recommendation for a given user."""
    rec = Recommendation.query.filter_by(user_id=user_id).order_by(Recommendation.id.desc()).first()
    if not rec:
        return jsonify({'error': 'No recommendations found'}), 404
    profile = UserProfile.query.get(user_id)
    result = rec.to_dict()
    result['user'] = profile.to_dict() if profile else {}
    return jsonify(result)


@app.route('/api/recommendations/latest', methods=['GET'])
def api_recommendations_latest():
    """Return the most recent recommendation (for dashboard)."""
    user_id = session.get('last_user_id')
    if not user_id:
        rec = Recommendation.query.order_by(Recommendation.id.desc()).first()
    else:
        rec = Recommendation.query.filter_by(user_id=user_id).order_by(Recommendation.id.desc()).first()
    if not rec:
        return jsonify({'error': 'No recommendations found'}), 404
    return jsonify(rec.to_dict())


@app.route('/api/stats', methods=['GET'])
def api_stats():
    """Dashboard statistics."""
    total_users   = UserProfile.query.count()
    total_recs    = Recommendation.query.count()
    avg_score     = db.session.query(db.func.avg(Recommendation.priority_score)).scalar() or 0
    total_schemes = 7   # static count for demo

    last_user_id = session.get('last_user_id')
    profile_complete = 0
    if last_user_id:
        profile = UserProfile.query.get(last_user_id)
        if profile:
            fields = [profile.name, profile.age, profile.gender, profile.state,
                      profile.education, profile.skills, profile.employment,
                      profile.annual_income, profile.preferred_career, profile.language]
            profile_complete = int(sum(1 for f in fields if f) / len(fields) * 100)

    return jsonify({
        'total_users':      total_users,
        'total_recs':       total_recs,
        'avg_score':        round(avg_score, 1),
        'total_schemes':    total_schemes,
        'profile_complete': profile_complete,
        'learning_progress': 35,   # demo value
        'opportunity_score': min(int(avg_score), 100),
    })


@app.route('/api/contact', methods=['POST'])
def api_contact():
    """Save contact / feedback form."""
    data = request.get_json(force=True)
    if not data:
        return jsonify({'error': 'No data'}), 400
    try:
        contact = Contact(
            name    = data.get('name', '').strip(),
            email   = data.get('email', '').strip(),
            subject = data.get('subject', '').strip(),
            message = data.get('message', '').strip(),
        )
        db.session.add(contact)
        db.session.commit()
        notify_contact_received(contact.name)
        return jsonify({'success': True, 'message': 'Thank you! We will get back to you soon.'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/notifications', methods=['GET'])
def api_notifications():
    """Return all unread notifications."""
    notifs = Notification.query.order_by(Notification.created_at.desc()).limit(20).all()
    unread = sum(1 for n in notifs if not n.is_read)
    return jsonify({
        'notifications': [n.to_dict() for n in notifs],
        'unread_count':  unread,
    })


@app.route('/api/notifications/read', methods=['POST'])
def api_mark_read():
    """Mark all notifications as read."""
    Notification.query.filter_by(is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'success': True})


# ─────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
