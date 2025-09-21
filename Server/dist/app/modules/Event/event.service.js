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
exports.EventServices = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const event_model_1 = require("./event.model");
const QueryBuilder_1 = require("../../builder/QueryBuilder");
const createEventIntoDB = (payload, images) => __awaiter(void 0, void 0, void 0, function* () {
    if (images && Object.keys(images).length > 0) {
        const imageMetadata = [];
        for (const fileArray of Object.values(images)) {
            for (const file of fileArray) {
                imageMetadata.push({
                    url: file.path,
                    filename: file.filename || file.originalname,
                    size: file.size,
                    mimetype: file.mimetype
                });
            }
        }
        payload.images = imageMetadata;
    }
    const result = yield event_model_1.Event.create(payload);
    return result;
});
const getAllEventsFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const eventQuery = new QueryBuilder_1.QueryBuilder(event_model_1.Event.find().populate('organizer', 'name email'), query)
        .search(['title', 'description', 'location'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield eventQuery.modelQuery;
    const meta = yield eventQuery.countTotal();
    return { result, meta };
});
const getSingleEventFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield event_model_1.Event.findById(id)
        .populate('organizer', 'name email profilePhoto')
        .populate({
        path: 'registrations',
        populate: {
            path: 'user_id',
            select: 'name email',
        },
    });
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    return result;
});
const updateEventIntoDB = (id, payload, images) => __awaiter(void 0, void 0, void 0, function* () {
    const event = yield event_model_1.Event.findById(id);
    if (!event) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    if (images && Object.keys(images).length > 0) {
        const imageUrls = [];
        for (const fileArray of Object.values(images)) {
            for (const file of fileArray) {
                imageUrls.push(file.path);
            }
        }
        payload.images = imageUrls;
    }
    const result = yield event_model_1.Event.findByIdAndUpdate(id, payload, {
        new: true,
        runValidators: true,
    });
    return result;
});
const deleteEventFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield event_model_1.Event.findByIdAndDelete(id);
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Event not found');
    }
    return result;
});
const registerForEventIntoDB = (payload, images) => __awaiter(void 0, void 0, void 0, function* () {
    if (images && Object.keys(images).length > 0) {
        const imageUrls = [];
        for (const fileArray of Object.values(images)) {
            for (const file of fileArray) {
                imageUrls.push(file.path);
            }
        }
        payload.images = imageUrls;
    }
    //   const event = await Event.findById(payload.event_id);
    //   if (!event) {
    //     throw new AppError(httpStatus.NOT_FOUND, 'Event not found');
    //   }
    //   if (event.status !== 'upcoming') {
    //     throw new AppError(
    //       httpStatus.BAD_REQUEST,
    //       'Event registration is not available'
    //     );
    //   }
    //   if (new Date() > event.registration_deadline) {
    //     throw new AppError(
    //       httpStatus.BAD_REQUEST,
    //       'Registration deadline has passed'
    //     );
    //   }
    //   if (
    //     event.max_participants &&
    //     event.current_participants >= event.max_participants
    //   ) {
    //     throw new AppError(httpStatus.BAD_REQUEST, 'Event is full');
    //   }
    // Check if user already registered
    //   const existingRegistration = await EventRegistration.findOne({
    //     event_id: payload.event_id,
    //     user_id: payload.user_id,
    //   });
    //   if (existingRegistration) {
    //     throw new AppError(
    //       httpStatus.BAD_REQUEST,
    //       'User already registered for this event'
    //     );
    //   }
    const registration = yield event_model_1.EventRegistration.create(payload);
    //   const session = await mongoose.startSession();
    //   try {
    //     session.startTransaction();
    //     const registration = await EventRegistration.create([payload], { session });
    //     await Event.findByIdAndUpdate(
    //       payload.event_id,
    //       {
    //         $inc: { current_participants: 1 },
    //         $push: { registrations: registration[0]._id },
    //       },
    //       { session }
    //     );
    //     await session.commitTransaction();
    return registration;
    //   } catch (error) {
    //     await session.abortTransaction();
    //     throw error;
    //   } finally {
    //     session.endSession();
    //   }
});
const getEventRegistrationsFromDB = (eventId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const registrationQuery = new QueryBuilder_1.QueryBuilder(event_model_1.EventRegistration.find({ event_id: eventId }), query)
        .search(['full_name', 'email', 'phone_number', 'department'])
        .filter()
        .sort()
        .paginate()
        .fields();
    const result = yield registrationQuery.modelQuery;
    const meta = yield registrationQuery.countTotal();
    return { result, meta };
});
const updateRegistrationStatusIntoDB = (registrationId, status) => __awaiter(void 0, void 0, void 0, function* () {
    const registration = yield event_model_1.EventRegistration.findById(registrationId);
    if (!registration) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Registration not found');
    }
    const result = yield event_model_1.EventRegistration.findByIdAndUpdate(registrationId, { status }, { new: true, runValidators: true });
    return result;
});
const getRegistrationByTrackingNumberFromDB = (trackingNumber) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield event_model_1.EventRegistration.findOne({ trackingNumber }).populate('event_id', 'title event_date location');
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Registration not found with this tracking number');
    }
    return result;
});
exports.EventServices = {
    createEventIntoDB,
    getAllEventsFromDB,
    getSingleEventFromDB,
    updateEventIntoDB,
    deleteEventFromDB,
    registerForEventIntoDB,
    getEventRegistrationsFromDB,
    updateRegistrationStatusIntoDB,
    getRegistrationByTrackingNumberFromDB,
};
