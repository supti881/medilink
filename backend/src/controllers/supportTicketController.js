import SupportTicket from "../models/SupportTicket.js";

const ALLOWED_TICKET_STATUS = ["open", "in_progress", "resolved", "closed"];

const ALLOWED_CATEGORIES = [
  "account",
  "appointment",
  "payment",
  "prescription",
  "technical",
  "reissue",
  "doctor",
  "other",
];

const ALLOWED_PRIORITIES = ["low", "medium", "high", "urgent"];

function normalizeText(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function getStatusFromAction(actionOrStatus = "") {
  const value = String(actionOrStatus || "").trim().toLowerCase();

  const statusMap = {
    open: "open",
    reopen: "open",
    reopened: "open",

    progress: "in_progress",
    in_progress: "in_progress",
    inprogress: "in_progress",
    mark_in_progress: "in_progress",

    resolve: "resolved",
    resolved: "resolved",

    close: "closed",
    closed: "closed",
  };

  return statusMap[value] || "";
}

function getValidNextStatuses(currentStatus) {
  if (currentStatus === "open") {
    return ["in_progress", "resolved", "closed"];
  }

  if (currentStatus === "in_progress") {
    return ["open", "resolved", "closed"];
  }

  if (currentStatus === "resolved") {
    return ["open", "closed"];
  }

  if (currentStatus === "closed") {
    return ["open"];
  }

  return [];
}

function getDefaultAdminReply(status, currentStatus) {
  if (status === "in_progress") {
    return "Your support ticket is now being reviewed by MediLink admin.";
  }

  if (status === "resolved") {
    return "Your support ticket has been reviewed and resolved by MediLink admin.";
  }

  if (status === "open" && ["resolved", "closed"].includes(currentStatus)) {
    return "Your support ticket has been reopened for further review.";
  }

  if (status === "closed") {
    return "Your support ticket has been closed by MediLink admin.";
  }

  return "Your support ticket status has been updated by MediLink admin.";
}

function populateTicket(query) {
  return query
    .populate("user", "name email phone role status profileImage")
    .populate("repliedBy", "name email role")
    .populate("statusUpdatedBy", "name email role")
    .populate("replies.repliedBy", "name email role");
}

function buildTicketFilter(query = {}) {
  const filter = {};

  if (query.status) {
    const cleanStatus = getStatusFromAction(query.status);

    if (cleanStatus && ALLOWED_TICKET_STATUS.includes(cleanStatus)) {
      filter.status = cleanStatus;
    }
  }

  if (query.priority) {
    const cleanPriority = normalizeText(query.priority).toLowerCase();

    if (ALLOWED_PRIORITIES.includes(cleanPriority)) {
      filter.priority = cleanPriority;
    }
  }

  if (query.category) {
    const cleanCategory = normalizeText(query.category).toLowerCase();

    if (ALLOWED_CATEGORIES.includes(cleanCategory)) {
      filter.category = cleanCategory;
    }
  }

  if (query.search) {
    const cleanSearch = normalizeText(query.search);

    filter.$or = [
      { subject: { $regex: cleanSearch, $options: "i" } },
      { message: { $regex: cleanSearch, $options: "i" } },
      { adminReply: { $regex: cleanSearch, $options: "i" } },
      { category: { $regex: cleanSearch, $options: "i" } },
      { priority: { $regex: cleanSearch, $options: "i" } },
      { status: { $regex: cleanSearch, $options: "i" } },
    ];
  }

  return filter;
}

// Create support ticket
export const createSupportTicket = async (req, res) => {
  try {
    const { subject, message, category, priority } = req.body;

    const cleanSubject = normalizeText(subject);
    const cleanMessage = normalizeText(message);
    const cleanCategory = normalizeText(category || "other").toLowerCase();
    const cleanPriority = normalizeText(priority || "medium").toLowerCase();

    if (!cleanSubject || !cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Subject and message are required",
      });
    }

    if (!ALLOWED_CATEGORIES.includes(cleanCategory)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid support category. Use account, appointment, payment, prescription, technical, reissue, doctor or other.",
      });
    }

    if (!ALLOWED_PRIORITIES.includes(cleanPriority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Use low, medium, high or urgent.",
      });
    }

    const ticket = await SupportTicket.create({
      user: req.user._id,
      subject: cleanSubject,
      message: cleanMessage,
      category: cleanCategory,
      priority: cleanPriority,
      status: "open",
    });

    const populatedTicket = await populateTicket(
      SupportTicket.findById(ticket._id)
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
    const tickets = await populateTicket(
      SupportTicket.find({
        user: req.user._id,
      }).sort({ createdAt: -1 })
    );

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
    const filter = buildTicketFilter(req.query);

    const tickets = await populateTicket(
      SupportTicket.find(filter).sort({
        priority: -1,
        createdAt: -1,
      })
    );

    const summary = tickets.reduce(
      (accumulator, ticket) => {
        accumulator.total += 1;

        if (ticket.status === "open") {
          accumulator.open += 1;
        }

        if (ticket.status === "in_progress") {
          accumulator.inProgress += 1;
        }

        if (ticket.status === "resolved") {
          accumulator.resolved += 1;
        }

        if (ticket.status === "closed") {
          accumulator.closed += 1;
        }

        if (ticket.priority === "urgent") {
          accumulator.urgent += 1;
        }

        if (ticket.priority === "high") {
          accumulator.high += 1;
        }

        return accumulator;
      },
      {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        urgent: 0,
        high: 0,
      }
    );

    return res.status(200).json({
      success: true,
      count: tickets.length,
      tickets,
      summary,
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
    const {
      status,
      action,
      adminReply,
      reply,
      priority,
      category,
    } = req.body;

    const requestedStatus = getStatusFromAction(status || action);
    const cleanAdminReply = normalizeText(adminReply || reply);
    const cleanPriority = normalizeText(priority).toLowerCase();
    const cleanCategory = normalizeText(category).toLowerCase();

    if (
      (status || action) &&
      (!requestedStatus || !ALLOWED_TICKET_STATUS.includes(requestedStatus))
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid ticket action. Use open, in_progress, resolved, closed or reopen.",
      });
    }

    if (priority && !ALLOWED_PRIORITIES.includes(cleanPriority)) {
      return res.status(400).json({
        success: false,
        message: "Invalid priority. Use low, medium, high or urgent.",
      });
    }

    if (category && !ALLOWED_CATEGORIES.includes(cleanCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category.",
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Support ticket not found",
      });
    }

    const previousStatus = ticket.status;

    if (requestedStatus) {
      const validNextStatuses = getValidNextStatuses(previousStatus);

      if (!validNextStatuses.includes(requestedStatus)) {
        return res.status(409).json({
          success: false,
          message: `Cannot change support ticket from ${previousStatus} to ${requestedStatus}`,
        });
      }

      const requiresReply =
        requestedStatus === "resolved" ||
        requestedStatus === "closed" ||
        (requestedStatus === "open" &&
          ["resolved", "closed"].includes(previousStatus));

      if (requiresReply && !cleanAdminReply) {
        return res.status(400).json({
          success: false,
          message:
            requestedStatus === "open"
              ? "Admin reply is required to reopen a ticket"
              : "Admin reply is required to resolve or close a ticket",
        });
      }

      ticket.status = requestedStatus;
      ticket.statusUpdatedBy = req.user._id;
      ticket.statusUpdatedAt = new Date();

      if (requestedStatus === "in_progress") {
        ticket.inProgressAt = new Date();
      }

      if (requestedStatus === "resolved") {
        ticket.resolvedAt = new Date();
      }

      if (
        requestedStatus === "open" &&
        ["resolved", "closed"].includes(previousStatus)
      ) {
        ticket.reopenedAt = new Date();
        ticket.closedAt = null;
      }

      if (requestedStatus === "closed") {
        ticket.closedAt = new Date();
      }
    }

    if (priority) {
      ticket.priority = cleanPriority;
    }

    if (category) {
      ticket.category = cleanCategory;
    }

    if (cleanAdminReply || requestedStatus) {
      const finalReply =
        cleanAdminReply || getDefaultAdminReply(requestedStatus, previousStatus);

      ticket.adminReply = finalReply;
      ticket.repliedBy = req.user._id;
      ticket.repliedAt = new Date();

      ticket.replies.push({
        message: finalReply,
        repliedBy: req.user._id,
        role: req.user.role,
      });
    }

    await ticket.save();

    const updatedTicket = await populateTicket(
      SupportTicket.findById(ticket._id)
    );

    return res.status(200).json({
      success: true,
      message: requestedStatus
        ? `Support ticket marked as ${requestedStatus}`
        : "Support ticket updated successfully",
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