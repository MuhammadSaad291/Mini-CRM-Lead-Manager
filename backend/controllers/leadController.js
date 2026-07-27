import Lead from "../models/Lead.js";

const STATUSES = ["new", "contacted", "converted"];

//  Create a new lead (owned by the logged-in user).

export const createLead = async (req, res, next) => {
  try {
    const { name, email, phone, status, assignedTo } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      status,
      assignedTo,
      owner: req.user._id,
    });

    res.status(201).json(lead);
  } catch (err) {
    next(err);
  }
};


export const getLeads = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { owner: req.user._id };

    if (req.query.status && STATUSES.includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const term = req.query.search.trim();
      const rx = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { name: rx },
        { email: rx },
        { phone: rx },
        { assignedTo: rx },
      ];
    }

    const [leads, total] = await Promise.all([
      Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Lead.countDocuments(filter),
    ]);

    res.json({
      leads,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
};


//  Update only the status of a lead (used by the dashboard dropdown).
 
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    next(err);
  }
};


//  Update any editable fields of a lead (bonus — used for full edits).

export const updateLead = async (req, res, next) => {
  try {
    const { name, email, phone, status, assignedTo } = req.body;
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { name, email, phone, status, assignedTo },
      { new: true, runValidators: true, omitUndefined: true }
    );

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  } catch (err) {
    next(err);
  }
};


//  Delete a lead owned by the logged-in user.
 
export const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json({ message: "Lead deleted", id: req.params.id });
  } catch (err) {
    next(err);
  }
};


//  Basic analytics: counts per status + total (for the dashboard cards).
 
export const getAnalytics = async (req, res, next) => {
  try {
    const owner = req.user._id;

    const grouped = await Lead.aggregate([
      { $match: { owner } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byStatus = { new: 0, contacted: 0, converted: 0 };
    grouped.forEach((g) => {
      if (byStatus[g._id] !== undefined) byStatus[g._id] = g.count;
    });

    const total = byStatus.new + byStatus.contacted + byStatus.converted;
    const conversionRate =
      total > 0 ? Math.round((byStatus.converted / total) * 100) : 0;

    res.json({ total, byStatus, conversionRate });
  } catch (err) {
    next(err);
  }
};
