const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const AuditLog = require('../models/AuditLog');
const FormSchema = require('../models/Schema');
const FormSession = require('../models/FormSession');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Form Sessions
router.get('/sessions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const sessions = await FormSession.findAll({ 
      include: [{ model: User, as: 'creator', attributes: ['name'] }],
      order: [['createdAt', 'DESC']] 
    });
    const mappedSessions = sessions.map(s => {
      const data = s.toJSON();
      if (typeof data.fields === 'string') {
        try { data.fields = JSON.parse(data.fields); } catch(e) { data.fields = []; }
      }
      return data;
    });
    res.json(mappedSessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { sessionNo, title, fields } = req.body;
    
    console.log('--- ADMIN SESSION CREATE ---');
    console.log('Payload Received:', JSON.stringify(req.body, null, 2));
    
    const newSession = await FormSession.create({ 
      sessionNo, 
      title, 
      fields: Array.isArray(fields) ? fields : [],
      createdBy: req.user.id
    });
    
    console.log('Session Saved in DB with fields:', newSession.fields.length);
    
    console.log('Session Created with ID:', newSession._id);
    res.json(newSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all cases (Admin only)
router.get('/cases', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const cases = await Case.findAll({
      include: [
        { model: User, as: 'user', attributes: ['_id', 'name', 'email'] },
        { model: FormSession, as: 'session', attributes: ['_id', 'sessionNo', 'title'], include: [{ model: User, as: 'creator', attributes: ['name'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const mappedCases = cases.map(c => {
      const data = c.toJSON();
      data.userId = data.user;
      data.sessionId = data.session;
      delete data.user;
      delete data.session;
      return data;
    });

    res.json(mappedCases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve or Reject case
router.put('/cases/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedCase = await Case.findByPk(req.params.id);
    if (!updatedCase) return res.status(404).json({ error: 'Case not found' });

    updatedCase.status = status;
    updatedCase.remarks = remarks;
    await updatedCase.save();

    await AuditLog.create({
      action: `CASE_${status.toUpperCase()}`,
      userId: req.user.id,
      caseId: updatedCase._id,
      details: { remarks }
    });

    res.json(updatedCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Update Dynamic Schema Field
router.post('/schema', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { fieldName, fieldType, label, options, isRequired } = req.body;
    let schemaField = await FormSchema.findOne({ where: { fieldName } });

    if (schemaField) {
      schemaField.fieldType = fieldType;
      schemaField.label = label;
      schemaField.options = options;
      schemaField.isRequired = isRequired;
      await schemaField.save();
    } else {
      schemaField = await FormSchema.create({ fieldName, fieldType, label, options, isRequired });
    }

    res.json(schemaField);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Dynamic Schema
router.get('/schema', authMiddleware, async (req, res) => {
  try {
    const schema = await FormSchema.findAll();
    res.json(schema);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Schema Field
router.delete('/schema/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const deletedField = await FormSchema.findByPk(req.params.id);
    if (!deletedField) return res.status(404).json({ error: 'Field not found' });
    await deletedField.destroy();
    res.json({ message: 'Field deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Audit Logs
router.get('/audit-logs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }],
      order: [['createdAt', 'DESC']],
      limit: 100
    });

    const mappedLogs = logs.map(log => {
      const data = log.toJSON();
      data.userId = data.user;
      delete data.user;
      return data;
    });

    res.json(mappedLogs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all users (Admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await User.findAll({ attributes: { exclude: ['password'] }, order: [['createdAt', 'DESC']] });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all stations (Accessible to station users to target other stations)
router.get('/stations', authMiddleware, async (req, res) => {
  try {
    const stations = await User.findAll({ 
      where: { role: 'station' },
      attributes: ['_id', 'name', 'jurisdiction', 'stationLogo'] 
    });
    res.json(stations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    user.role = role;
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Session
router.delete('/sessions/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const session = await FormSession.findByPk(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    await session.destroy();
    res.json({ message: 'Session deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
