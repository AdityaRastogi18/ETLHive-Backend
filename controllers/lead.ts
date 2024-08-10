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
  const {
    name,
    email,
    productName,
    productID,
    number,
    sort = "asc",
    page = "1",
    limit = "10",
  } = req.query;

  try {
    const filter: any = {};

    if (name) filter.name = { $regex: name, $options: "i" };
    if (email) filter.email = { $regex: email, $options: "i" };
    if (productName)
      filter["product.productName"] = { $regex: productName, $options: "i" };
    if (productID)
      filter["product.productID"] = { $regex: productID, $options: "i" };
    if (number) filter.number = { $regex: number, $options: "i" };

    const sortOrder = sort === "asc" ? 1 : -1;

    const pageNumber = parseInt(page as string, 10);
    const limitNumber = parseInt(limit as string, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const leads = await Lead.find(filter)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(limitNumber);

    const totalLeads = await Lead.countDocuments(filter);

    res.json({
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

    res.json({
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

    res.json({
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
