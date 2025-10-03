"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostValidation = void 0;
const zod_1 = require("zod");
const createPostValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }),
        description: zod_1.z.string({ required_error: 'Description is required' }),
        image: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        postDate: zod_1.z.date().optional(),
        author: zod_1.z.string({ required_error: 'Author is required' }),
        isDeleted: zod_1.z.boolean().optional(),
    }),
});
const updatePostValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({ required_error: 'Title is required' }).optional(),
        description: zod_1.z
            .string({ required_error: 'Description is required' })
            .optional(),
        image: zod_1.z.string().optional(),
        isDeleted: zod_1.z.boolean().optional(),
        location: zod_1.z.string().optional(),
        division: zod_1.z.string().optional(),
        district: zod_1.z.string().optional(),
        status: zod_1.z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
        crimeDate: zod_1.z
            .string()
            .transform((str) => new Date(str))
            .optional(),
    }),
});
const reportPostValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        reason: zod_1.z.string({ required_error: 'Reason is required' }).min(5, {
            message: 'Reason must be at least 5 characters long',
        }),
        description: zod_1.z.string().optional(),
    }),
});
const reviewReportValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        action: zod_1.z.enum(['APPROVE', 'REJECT'], {
            required_error: 'Action is required',
        }),
    }),
});
exports.PostValidation = {
    createPostValidationSchema,
    updatePostValidationSchema,
    reportPostValidationSchema,
    reviewReportValidationSchema,
};
