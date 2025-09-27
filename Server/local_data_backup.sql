--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.users VALUES ('cmfsk1t9i0000e79gbrp3bhsq', 'Super Admin', 'admin@gmail.com', '$2a$12$7mNenHJglQl36AfOECDhU.SjvRSlSjv0BFdLikaFzWyFa6doq3F0S', '1234567890', NULL, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png', 'SUPER_ADMIN', 'ACTIVE', true, NULL, false, NULL, '2025-09-20 17:41:14.97', '2025-09-20 17:41:14.97');
INSERT INTO public.users VALUES ('cmg0fwdci0000e7pwmbvwy5ey', 'Md Mahidul Islam Mahi', 'mahi@gmail.com', '$2a$12$0N7OFou69iHsWuYss8m/Qe09ifh1pKokPrIS08m4nsd3EgQWGp9I.', NULL, NULL, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png', 'USER', 'ACTIVE', false, NULL, false, NULL, '2025-09-26 06:07:12.007', '2025-09-26 06:07:12.007');
INSERT INTO public.users VALUES ('cmg0h330h0000e7n0hrfdt795', 'Bertha Booth', 'huzyxexuz@mailinator.com', '$2a$12$lZgZDvvlCoOasoZdIr.HeuCNaY73k2hVb1qUc8znml.3pzDSKdnaO', '+1 (763) 494-9234', NULL, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png', 'USER', 'ACTIVE', false, NULL, false, NULL, '2025-09-26 06:40:24.833', '2025-09-26 06:40:24.833');
INSERT INTO public.users VALUES ('cmg16k5gd0002e7dw7x07axmm', 'Cathleen Wynn', 'satacyqezu@mailinator.com', '$2a$12$fayivMGeoGzaRMUokZlYf.OfprABjEcGbQqOu39crKzyMLCAqBIYy', '+1 (361) 188-9798', NULL, 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png', 'USER', 'ACTIVE', false, NULL, false, NULL, '2025-09-26 18:33:31.55', '2025-09-26 18:33:31.55');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.posts VALUES ('cmft0yf0e0001e730amwh5s7r', 'ABCD', 'Here''s a description of the scenario based on the image:

**The image shows a poster with the title "9 Demands" (৯ দফা দাবি) related to a student movement in Bangladesh, likely concerning quota reforms. The poster appears to be a call for action or a declaration of demands following a perceived "genocide" (গণহত্যা) related to the quota reform movement.**

**Key Visual Elements:**

*   **Title:** "৯ দফা দাবি" (9 Demands) is prominently displayed.
*   **Text:** The poster is primarily text-based, listing a series of demands. The language is Bengali.
*   **Color Scheme:** The poster is mainly in red. This color choice could symbolize anger, protest, or a call for attention to the severity of the situation.

**Inference about the Scenario:**

Based on the title, context provided by the initial translated text, and visual cues, it''s highly probable that the poster is related to a student movement in Bangladesh advocating for reforms to the quota system in government jobs and education. The reference to "genocide" suggests that the movement faced significant opposition or violence, leading to the formulation of these demands. The poster is likely used to galvanize support and communicate the goals of the movement to the public.', 'https://res.cloudinary.com/drrhtmzpk/image/upload/v1758418469/1lhnj5ain5v-1758418467865-image-451459024_1138573577220116_3543119543066074073_n.jpg', 'Khulna, Narail', '23', '3', '2025-09-21 01:34:30.01', '2025-09-16 18:00:00', 'PENDING', false, 'cmfsk1t9i0000e79gbrp3bhsq', '2025-09-21 01:34:30.01', '2025-09-21 01:34:30.01');


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: comment_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: follows; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: post_votes; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.post_votes VALUES ('cmg159tu70001e7dwr53ytrkq', 'cmg0h330h0000e7n0hrfdt795', 'cmft0yf0e0001e730amwh5s7r', 'UP', '2025-09-26 17:57:30.306');
INSERT INTO public.post_votes VALUES ('cmg16sxil0006e7dw1nt1hwl3', 'cmg16k5gd0002e7dw7x07axmm', 'cmft0yf0e0001e730amwh5s7r', 'DOWN', '2025-09-26 18:40:21.165');


--
-- PostgreSQL database dump complete
--

