"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const PORT = process.env.PORT || 3001;
async function startServer() {
    try {
        // Connect to database
        await (0, database_1.connectDatabase)();
        // Start Express server
        app_1.default.listen(PORT, () => {
            console.log('🚀 ════════════════════════════════════════');
            console.log(`🚀 Green Nutri Backend API`);
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🚀 Health check: http://localhost:${PORT}/health`);
            console.log('🚀 ════════════════════════════════════════');
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}
// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map