import { z } from 'zod';

const createPostValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }),
    description: z.string({ required_error: 'Description is required' }),
    image: z.string().optional(),
    location: z.string().optional(),
    postDate: z.date().optional(),
    author: z.string({ required_error: 'Author is required' }),
    isDeleted: z.boolean().optional(),
  }),
});

const updatePostValidationSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).optional(),
    description: z
      .string({ required_error: 'Description is required' })
      .optional(),
    image: z.string().optional(),
    isDeleted: z.boolean().optional(),
    location: z.string().optional(),
    division: z.string().optional(),
    district: z.string().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
    crimeDate: z
      .string()
      .transform((str) => new Date(str))
      .optional(),
  }),
});

export const PostValidation = {
  createPostValidationSchema,
  updatePostValidationSchema,
};
