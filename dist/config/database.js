"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDatabase = async () => {
    try {
        const conn = await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/greennutri');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn;
    }
    catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        process.exit(1);
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        console.log('✅ MongoDB Disconnected');
    }
    catch (error) {
        console.error('❌ MongoDB Disconnect Error:', error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
// Force redeploy
//# sourceMappingURL=database.js.map