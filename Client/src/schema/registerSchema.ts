import { z } from "zod";

const registerValidationSchema = z.object({
  name: z.string().min(1, "Please enter your name!"),
  email: z.string().email("Please enter a valid email address!"),
  mobileNumber: z.string(),
  password: z.string().min(6, "Must be at least 6 characters."),
  image: z.any().optional()
});

export default registerValidationSchema;

/**
 * .refine((file) => {
    return file instanceof File && file.type.startsWith("image/");
  }, "Please upload a valid image file (JPG, PNG, etc.)"),
 */