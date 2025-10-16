"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./app/config"));
const seeding_1 = require("./app/utils/seeding");
const firebase_config_1 = require("./app/config/firebase.config");
let server;
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    if (server) {
        server.close(() => {
            console.error('Server closed due to unhandled rejection');
            process.exit(1);
        });
    }
    else {
        process.exit(1);
    }
});
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('🛢 Database connected successfully (With PostgreSQL)');
            // Initialize Firebase for push notifications
            firebase_config_1.FirebaseService.initializeFirebase();
            yield (0, seeding_1.seed)();
            server = app_1.default.listen(config_1.default.port, () => {
                console.log(config_1.default.port);
                console.log(`🚀 Application is running on port ${config_1.default.port}`);
            });
        }
        catch (err) {
            console.error('Failed to start server:', err);
            process.exit(1);
        }
    });
}
bootstrap();
process.on('SIGTERM', () => {
    console.log('SIGTERM received');
    if (server) {
        server.close();
    }
});
