const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const AuditLog = require('../models/AuditLog');
const FormSession = require('../models/FormSession');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get session status for user
router.get('/sessions', authMiddleware, async (req, res) => {
  try {
    const allSessions = await FormSession.findAll({ 
      where: { isActive: true }, 
      include: [{ model: User, as: 'creator', attributes: ['name'] }],
      order: [['createdAt', 'DESC']] 
    });
    
    const userCases = await Case.findAll({ where: { userId: req.user.id } });

    // Filter sessions: if targetStations is empty, it's for everyone. 
    // Otherwise, check if user.id is in targetStations.
    const filteredSessions = allSessions.filter(session => {
      if (!session.targetStations || session.targetStations.length === 0) return true;
      return session.targetStations.includes(req.user.id);
    });

    const sessionDetails = filteredSessions.map(session => {
      const submission = userCases.find(c => c.sessionId === session._id);
      let f = session.fields || [];
      if (typeof f === 'string') try { f = JSON.parse(f); } catch(e) { f = []; }
      
      return {
        _id: session._id,
        sessionNo: session.sessionNo,
        title: session.title,
        description: session.description,
        fields: f,
        createdBy: session.createdBy,
        hostedBy: session.creator ? session.creator.name : 'System',
        isCompleted: !!submission,
        caseId: submission ? submission._id : null,
        status: submission ? submission.status : 'unsubmitted',
        deadline: session.deadline
      };
    });

    res.json(sessionDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new form session
router.post('/sessions', authMiddleware, async (req, res) => {
  try {
    const { sessionNo, title, fields, description, targetStations, priority, deadline } = req.body;
    const newSession = await FormSession.create({
      sessionNo,
      title,
      fields: fields || [],
      description,
      targetStations: targetStations || [],
      priority: priority || 'Medium',
      deadline,
      createdBy: req.user.id
    });
    res.status(201).json(newSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update station profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, stationLogo, jurisdiction, address, contactInfo, officerDetails, staffMembers } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await user.update({
      name, phone, stationLogo, jurisdiction, address, contactInfo, officerDetails, staffMembers
    });

    res.json({ message: 'Profile updated successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user notifications
const Notification = require('../models/Notification');
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
      limit: 20
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get submissions for forms hosted by the user
router.get('/hosted-submissions', authMiddleware, async (req, res) => {
  try {
    const hostedSessions = await FormSession.findAll({ where: { createdBy: req.user.id } });
    const sessionIds = hostedSessions.map(s => s._id);
    const hostedCases = await Case.findAll({
      where: { sessionId: sessionIds },
      include: [
        { model: User, as: 'user', attributes: ['_id', 'name', 'email'] },
        { model: FormSession, as: 'session', attributes: ['_id', 'sessionNo', 'title', 'fields'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const mappedCases = hostedCases.map(c => {
      const data = c.toJSON();
      data.userId = data.user;
      data.sessionId = data.session;
      delete data.user;
      delete data.session;
      return data;
    });

    res.json({ sessions: hostedSessions, cases: mappedCases });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a new case
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { data, sessionId } = req.body;
    
    // Duplicate check removed to allow multiple submissions for the same form session.

    const newCase = await Case.create({
      userId: req.user.id,
      sessionId,
      data
    });
    
    await AuditLog.create({
      action: 'CASE_SUBMITTED',
      userId: req.user.id,
      caseId: newCase._id,
      details: { status: 'pending' }
    });

    res.status(201).json(newCase);
  } catch (err) {
    console.error('Submission Error:', err);
    res.status(500).json({ error: 'Database Error: ' + err.message });
  }
});

// View own cases
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cases = await Case.findAll({
      where: { userId: req.user.id },
      include: [{ 
        model: FormSession, 
        as: 'session', 
        attributes: ['_id', 'sessionNo', 'title'],
        include: [{ model: User, as: 'creator', attributes: ['name'] }]
      }],
      order: [['createdAt', 'DESC']]
    });

    const mappedCases = cases.map(c => {
      const data = c.toJSON();
      data.sessionId = data.session;
      delete data.session;
      return data;
    });

    res.json(mappedCases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single case of the user
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const caseItem = await Case.findOne({ where: { _id: req.params.id, userId: req.user.id } });
    if (!caseItem) return res.status(404).json({ error: 'Case not found' });
    res.json(caseItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
