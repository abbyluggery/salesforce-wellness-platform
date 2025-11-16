import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('jobsearch.db');

    // Create tables
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS job_postings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT,
        salary_min REAL,
        salary_max REAL,
        description TEXT,
        url TEXT,
        provider TEXT,
        status TEXT DEFAULT 'saved',
        ai_analysis TEXT,
        fit_score INTEGER,
        recruiter_name TEXT,
        recruiter_email TEXT,
        recruiter_phone TEXT,
        recruiter_linkedin TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_posting_id INTEGER,
        status TEXT DEFAULT 'interested',
        applied_date DATE,
        callback_date DATE,
        interview_date DATE,
        notes TEXT,
        resume_id INTEGER,
        cover_letter TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_posting_id) REFERENCES job_postings (id)
      );

      CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        skills TEXT,
        experience TEXT,
        education TEXT,
        certifications TEXT,
        is_master BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS resume_packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_posting_id INTEGER,
        resume_id INTEGER,
        cover_letter TEXT,
        tailored_content TEXT,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_posting_id) REFERENCES job_postings (id),
        FOREIGN KEY (resume_id) REFERENCES resumes (id)
      );

      CREATE TABLE IF NOT EXISTS user_profile (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        email TEXT,
        phone TEXT,
        linkedin TEXT,
        github TEXT,
        portfolio TEXT,
        claude_api_key TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS search_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT NOT NULL,
        location TEXT,
        filters TEXT,
        results_count INTEGER,
        searched_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

// Job Postings queries
export const saveJobPosting = async (jobData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO job_postings (title, company, location, salary_min, salary_max, description, url, provider, recruiter_name, recruiter_email, recruiter_phone, recruiter_linkedin)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      jobData.title,
      jobData.company,
      jobData.location,
      jobData.salaryMin,
      jobData.salaryMax,
      jobData.description,
      jobData.url,
      jobData.provider,
      jobData.recruiterName,
      jobData.recruiterEmail,
      jobData.recruiterPhone,
      jobData.recruiterLinkedIn
    ]
  );
  return result.lastInsertRowId;
};

export const getJobPostings = async (status = null) => {
  const db = getDatabase();
  const query = status
    ? 'SELECT * FROM job_postings WHERE status = ? ORDER BY created_at DESC'
    : 'SELECT * FROM job_postings ORDER BY created_at DESC';

  const params = status ? [status] : [];
  const result = await db.getAllAsync(query, params);
  return result;
};

export const updateJobPosting = async (id, updates) => {
  const db = getDatabase();
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  await db.runAsync(
    `UPDATE job_postings SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
};

export const deleteJobPosting = async (id) => {
  const db = getDatabase();
  await db.runAsync('DELETE FROM job_postings WHERE id = ?', [id]);
};

// Applications queries
export const createApplication = async (applicationData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO applications (job_posting_id, status, applied_date, notes, resume_id, cover_letter)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      applicationData.jobPostingId,
      applicationData.status || 'interested',
      applicationData.appliedDate,
      applicationData.notes,
      applicationData.resumeId,
      applicationData.coverLetter
    ]
  );
  return result.lastInsertRowId;
};

export const getApplications = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync(`
    SELECT a.*, j.title, j.company, j.location
    FROM applications a
    JOIN job_postings j ON a.job_posting_id = j.id
    ORDER BY a.created_at DESC
  `);
  return result;
};

export const updateApplication = async (id, updates) => {
  const db = getDatabase();
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  await db.runAsync(
    `UPDATE applications SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
};

// Resumes queries
export const saveResume = async (resumeData) => {
  const db = getDatabase();
  const result = await db.runAsync(
    `INSERT INTO resumes (name, content, skills, experience, education, certifications, is_master)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      resumeData.name,
      resumeData.content,
      resumeData.skills,
      resumeData.experience,
      resumeData.education,
      resumeData.certifications,
      resumeData.isMaster ? 1 : 0
    ]
  );
  return result.lastInsertRowId;
};

export const getResumes = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync('SELECT * FROM resumes ORDER BY created_at DESC');
  return result;
};

export const getMasterResume = async () => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT * FROM resumes WHERE is_master = 1');
  return result;
};

export const updateResume = async (id, updates) => {
  const db = getDatabase();
  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), id];

  await db.runAsync(
    `UPDATE resumes SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    values
  );
};

// User profile queries
export const getUserProfile = async () => {
  const db = getDatabase();
  const result = await db.getFirstAsync('SELECT * FROM user_profile LIMIT 1');
  return result;
};

export const saveUserProfile = async (profileData) => {
  const db = getDatabase();
  const existing = await getUserProfile();

  if (existing) {
    const fields = Object.keys(profileData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(profileData), existing.id];
    await db.runAsync(
      `UPDATE user_profile SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  } else {
    const fields = Object.keys(profileData).join(', ');
    const placeholders = Object.keys(profileData).map(() => '?').join(', ');
    await db.runAsync(
      `INSERT INTO user_profile (${fields}) VALUES (${placeholders})`,
      Object.values(profileData)
    );
  }
};

// Analytics queries
export const getApplicationStats = async () => {
  const db = getDatabase();

  const totalApplications = await db.getFirstAsync(
    'SELECT COUNT(*) as count FROM applications'
  );

  const byStatus = await db.getAllAsync(`
    SELECT status, COUNT(*) as count
    FROM applications
    GROUP BY status
  `);

  const thisWeek = await db.getFirstAsync(`
    SELECT COUNT(*) as count
    FROM applications
    WHERE applied_date >= date('now', '-7 days')
  `);

  const avgFitScore = await db.getFirstAsync(`
    SELECT AVG(fit_score) as avg_score
    FROM job_postings
    WHERE fit_score IS NOT NULL
  `);

  return {
    total: totalApplications?.count || 0,
    byStatus: byStatus || [],
    thisWeek: thisWeek?.count || 0,
    avgFitScore: avgFitScore?.avg_score || 0
  };
};
