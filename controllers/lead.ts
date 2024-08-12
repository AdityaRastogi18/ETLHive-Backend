import { Request, Response } from "express";
import Lead from "../models/Leads";

export const handleCreateNewLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { name, email, number, product } = req.body;

  try {
    const lead = new Lead({ name, email, number, product });
    await lead.save();

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      lead,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};

export const handleGetLeads = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { page = "1", limit = "10", sort = "asc", search } = req.query;
  const sortOrder = sort === "desc" ? -1 : 1;

  const searchString = typeof search === "string" ? search : "";
  const searchRegExp = searchString ? new RegExp(searchString, "i") : null;
  const filter: any = {};

  if (searchString) {
    if (searchRegExp) {
      filter.$or = [
        { name: searchRegExp },
        { email: searchRegExp },
        { "product.productName": searchRegExp },
        { "product.productID": searchRegExp },
        { number: searchRegExp },
      ];
    }
  }

  try {
    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const leads = await Lead.aggregate([
      { $match: filter },
      { $sort: { createdAt: sortOrder } },
      { $skip: skip },
      { $limit: limitNumber },
      { $project: { numberOfSubjects: 0 } },
    ]);

    const totalLeads = await Lead.countDocuments(filter);

    res.status(200).json({
      success: true,
      leads,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(totalLeads / limitNumber),
        totalLeads,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};

export const handleDeleteLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  try {
    const lead = await Lead.findByIdAndDelete(id);

    if (!lead) {
      res.status(404).json({
        message: "Lead not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};

export const handleUpdateLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const existingLead = await Lead.findById(id);

    if (!existingLead) {
      res.status(404).json({
        message: "Lead not found",
      });
      return;
    }

    const updatedLeadData = {
      ...existingLead.toObject(),
      ...updates,
    };

    const lead = await Lead.findByIdAndUpdate(id, updatedLeadData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (err) {
    res.status(500).json({
      message: err instanceof Error ? err.message : "An error occurred",
    });
  }
};
