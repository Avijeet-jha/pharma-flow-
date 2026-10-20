    import { Response } from "express";

    import {
    generateRecommendations,
    } from "../services/recommendation.service";

    import { AuthRequest } from "../middlewares/auth.middleware";

    export const getRecommendationsController =
    async (
        req: AuthRequest,
        res: Response
    ) => {
        try {
        const companyId =
            req.user?.companyId;

        if (!companyId) {
            return res.status(403).json({
            success: false,
            message: "Company account required",
            });
        }

        const days =
            Number(req.query.days) || 30;

        if (days <= 0) {
            return res.status(400).json({
            success: false,
            message:
                "Days must be greater than zero",
            });
        }

        const recommendations =
            await generateRecommendations(
            companyId,
            days
            );

        return res.status(200).json({
            success: true,
            data: recommendations,
        });
        } catch (error) {
        console.error(
            "Recommendation error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
            "Failed to generate purchase recommendations",
            error:
            error instanceof Error
                ? error.message
                : String(error),
        });
        }
    };