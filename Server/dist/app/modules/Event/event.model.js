"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRegistration = exports.Event = void 0;
const mongoose_1 = require("mongoose");
const playerInfoSchema = new mongoose_1.Schema({
    preferred_positions: { type: [String], default: [] },
    play_styles: { type: [String], default: [] },
    height: { type: String, default: '' },
    footedness: { type: String, default: '' },
    self_rating: { type: String, default: '' },
    weak_foot_rating: { type: String, default: '' },
    achievements: { type: String, default: '' },
});
const auctionInfoSchema = new mongoose_1.Schema({
    intro_line: { type: String, default: '' },
    base_price: { type: String, default: '' },
    onFieldPersonality: { type: String, default: '' },
    playing_style: { type: String, default: '' },
    pressure_role_preferences: { type: [String], default: [] },
    is_icon_player: { type: String, default: '' },
    favorite_footballer: { type: String, default: '' },
});
const eventSpecificDataSchema = new mongoose_1.Schema({
    semester: { type: String, default: '' },
    interests: { type: String, default: '' },
    university: { type: String, default: 'UIU' },
    expectedGraduation: { type: String, default: '' },
    personalEmail: { type: String, default: '' },
    additional_info: { type: String, default: '' },
    player_info: { type: playerInfoSchema, default: {} },
    auction_info: { type: auctionInfoSchema, default: {} },
});
const eventRegistrationSchema = new mongoose_1.Schema({
    event_id: { type: String, required: true },
    user_id: { type: String, required: true },
    member_id: { type: String, default: '' },
    security_code: { type: String, default: '' },
    full_name: { type: String, required: true },
    email: { type: String, required: true },
    phone_number: { type: String, required: true },
    department: { type: String, required: true },
    user_type: { type: String, required: true, default: 'student' },
    payment_method: { type: String, default: '' },
    payment_phone_number: { type: String, default: '' },
    payment_transaction_id: { type: String, default: '' },
    event_specific_data: { type: eventSpecificDataSchema, required: true },
    images: [String],
    trackingNumber: {
        type: String,
        unique: true,
        default: function () {
            return ('TRK' +
                Date.now().toString(36).toUpperCase() +
                Math.random().toString(36).substr(2, 4).toUpperCase());
        },
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    registrationDate: { type: Date, default: Date.now },
}, {
    timestamps: true,
    versionKey: false,
});
const eventSchema = new mongoose_1.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    event_date: { type: Date, required: true },
    registration_deadline: { type: Date, required: true },
    location: { type: String, required: true },
    max_participants: { type: Number },
    current_participants: { type: Number, default: 0 },
    is_free: { type: Boolean, default: false },
    registration_fee: { type: Number },
    organizer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming',
    },
    requirements: [{ type: String }],
    images: [{ type: String }],
    registrations: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'EventRegistration' }],
}, {
    timestamps: true,
    versionKey: false,
});
exports.Event = (0, mongoose_1.model)('Event', eventSchema);
exports.EventRegistration = (0, mongoose_1.model)('EventRegistration', eventRegistrationSchema);
