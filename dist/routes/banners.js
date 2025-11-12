"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Get all active banners
router.get('/', async (req, res) => {
    try {
        // For now, return empty array since we don't have banners in the database
        // This can be extended later to have a banners collection
        const banners = [];
        res.json({
            success: true,
            data: banners
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Failed to fetch banners'
            }
        });
    }
});
exports.default = router;
//# sourceMappingURL=banners.js.map