import SupportTicket from "../models/SupportTicket.js";

// Create support ticket
export const createSupportTicket = async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;

    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject,
      message,
      category: category || "other",
      priority: priority || "medium",
    });

    const populatedTicket = await SupportTicket.findById(ticket._id).populate(
      "user",
      "name email phone role"
    );

    return res.status(201).json({
      success: true,
      message: "Support ticket submitted successfully",
      ticket: populatedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to submit support ticket",
      error: error.message,
    });
  }
};

// Get logged-in user's tickets
export const getMySupportTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      user: req.user._id,
    })
      .populate("user", "name email phone role")
      .populate("repliedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch support tickets",
      error: error.message,
    });
  }
};

// Admin: get all support tickets
export const getAllSupportTickets = async (req, res) => {
  try {
    const { status, priority, category } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (category) {
      filter.category = category;
    }

    const tickets = await SupportTicket.find(filter)
      .populate("user", "name email phone role")
      .populate("repliedBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all support tickets",
      error: error.message,
    });
  }
};

// Admin: update ticket status/reply
export const updateSupportTicket = async (req, res) => {
  try {
    const { status, adminReply } = req.body;

    const allowedStatus = ["open", "in_progress", "resolved", "closed"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket status",
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    if (status) {
      ticket.status = status;
    }

    if (adminReply !== undefined) {
      ticket.adminReply = adminReply;
      ticket.repliedBy = req.user._id;
      ticket.repliedAt = new Date();
    }

    await ticket.save();

    const updatedTicket = await SupportTicket.findById(ticket._id)
      .populate("user", "name email phone role")
      .populate("repliedBy", "name email role");

    return res.status(200).json({
      success: true,
      message: "Support ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update support ticket",
      error: error.message,
    });
  }
};