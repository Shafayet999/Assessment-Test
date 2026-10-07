import { Request, Response } from "express";
import { AssessmentService } from "./assessment.service";

const createQuestion = async (req: Request, res: Response) => {
  try {
    const result = await AssessmentService.createQuestion(req.body);
    return res.status(201).json({
      success: true,
      message: "Question added to Problem Bank successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create question",
      errors: [{ path: "createQuestion", message: error.message }],
    });
  }
};

const getAllQuestions = async (req: Request, res: Response) => {
  try {
    const result = await AssessmentService.getAllQuestions();
    return res.status(200).json({
      success: true,
      message: "Questions fetched successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch questions",
      errors: [{ path: "getAllQuestions", message: error.message }],
    });
  }
};

const createAssessment = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user!.id;
    const result = await AssessmentService.createAssessment(recruiterId, req.body);
    return res.status(201).json({
      success: true,
      message: "Assessment created and published successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create assessment",
      errors: [{ path: "createAssessment", message: error.message }],
    });
  }
};

const getAllAssessments = async (req: Request, res: Response) => {
  try {
    const filters = req.query;
    const result = await AssessmentService.getAllAssessments(filters);
    return res.status(200).json({
      success: true,
      message: "Assessments retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch assessments",
      errors: [{ path: "getAllAssessments", message: error.message }],
    });
  }
};

const getSingleAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await AssessmentService.getSingleAssessment(id as string);
    return res.status(200).json({
      success: true,
      message: "Assessment details retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message || "Assessment not found",
      errors: [{ path: "getSingleAssessment", message: error.message }],
    });
  }
};

const deleteAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await AssessmentService.softDeleteAssessment(id as string, req.user!.id, req.user!.role);
    return res.status(200).json({
      success: true,
      message: "Assessment deleted successfully (Soft delete)",
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete assessment",
      errors: [{ path: "deleteAssessment", message: error.message }],
    });
  }
};

export const AssessmentController = {
  createQuestion,
  getAllQuestions,
  createAssessment,
  getAllAssessments,
  getSingleAssessment,
  deleteAssessment,
};