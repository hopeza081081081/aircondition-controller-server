"use strict";
/**
 * Main Entry Point
 * Application entry point - delegates to bootstrap and shutdown modules
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables first
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const bootstrap_1 = require("./bootstrap");
const shutdown_1 = require("./shutdown");
const Logger_1 = __importDefault(require("./utils/Logger"));
/**
 * Main application entry
 */
async function main() {
    try {
        // Bootstrap the application
        const appContext = await (0, bootstrap_1.bootstrap)();
        // Setup graceful shutdown
        (0, shutdown_1.setupGracefulShutdown)({
            raspberrypiService: appContext.raspberrypiService,
            localMqtt: appContext.localMqtt,
            cloudMqtt: appContext.cloudMqtt,
            mongoDBService: appContext.mongoDBService,
        });
    }
    catch (error) {
        Logger_1.default.error("Application failed to start", error);
        process.exit(1);
    }
}
// Start the application
main();
//# sourceMappingURL=index.js.map