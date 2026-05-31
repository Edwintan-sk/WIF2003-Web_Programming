const express = require('express');
const router = express.Router();
const Kpi = require('../models/Kpi.js');

// 1. GET all KPIs from database
router.get('/', async (req, res) => {
  try {
    const kpis = await Kpi.find().sort({ createdAt: -1 });
    res.status(200).json(kpis);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. POST create a new KPI
router.post('/', async (req, res) => {
  try {
    const newKpi = new Kpi(req.body);
    const savedKpi = await newKpi.save();
    res.status(201).json(savedKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// 3. PUT update an existing KPI or progress
router.put('/:id', async (req, res) => {
  try {
    const updatedKpi = await Kpi.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedKpi) return res.status(404).json({ message: "KPI not found" });
    res.status(200).json(updatedKpi);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;