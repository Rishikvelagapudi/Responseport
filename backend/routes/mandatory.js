const express = require('express');
const router = express.Router();
const MandatoryForm = require('../models/MandatoryForm');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

// Get today's mandatory form for a specific session
router.get('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { session } = req.query; // Morning, Afternoon, Evening

    const form = await MandatoryForm.findOne({
      where: {
        userId: req.user.id,
        date: today,
        reportingSession: session || 'Morning'
      }
    });

    res.json(form || {}); 
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update today's mandatory form for a specific session
router.post('/today', authMiddleware, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const { chargeSheet, missingCases, roadAccident, reportingSession } = req.body;

    let form = await MandatoryForm.findOne({
      where: { userId: req.user.id, date: today, reportingSession: reportingSession || 'Morning' }
    });

    if (form) {
      form.chargeSheet = chargeSheet;
      form.missingCases = missingCases;
      form.roadAccident = roadAccident;
      await form.save();
    } else {
      form = await MandatoryForm.create({
        userId: req.user.id,
        date: today,
        reportingSession: reportingSession || 'Morning',
        chargeSheet,
        missingCases,
        roadAccident
      });
    }

    res.status(200).json(form);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all mandatory forms (for Admin)
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const forms = await MandatoryForm.findAll({
      include: [{ model: User, as: 'user', attributes: ['_id', 'name', 'email', 'role'] }],
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    const mappedForms = forms.map(f => {
      const data = f.toJSON();
      data.userId = data.user;
      delete data.user;
      return data;
    });

    res.json(mappedForms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
