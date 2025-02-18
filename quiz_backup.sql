--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2 (Debian 17.2-1.pgdg120+1)
-- Dumped by pg_dump version 17.2 (Debian 17.2-1.pgdg120+1)

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
-- Name: enum_Users_role; Type: TYPE; Schema: public; Owner: test
--

CREATE TYPE public."enum_Users_role" AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public."enum_Users_role" OWNER TO test;

--
-- Name: enum_questions_type; Type: TYPE; Schema: public; Owner: test
--

CREATE TYPE public.enum_questions_type AS ENUM (
    'single_choice',
    'multiple_choice',
    'text',
    'ordering',
    'matching'
);


ALTER TYPE public.enum_questions_type OWNER TO test;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Users; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public."Users" (
    id uuid NOT NULL,
    role public."enum_Users_role" DEFAULT 'user'::public."enum_Users_role" NOT NULL,
    email character varying(255) NOT NULL,
    username character varying(255),
    hash character varying(255),
    "hashRt" character varying(255),
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL
);


ALTER TABLE public."Users" OWNER TO test;

--
-- Name: options; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.options (
    id uuid NOT NULL,
    text text NOT NULL,
    "isCorrect" boolean DEFAULT false NOT NULL,
    "questionId" uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.options OWNER TO test;

--
-- Name: questions; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.questions (
    id uuid NOT NULL,
    text text NOT NULL,
    type public.enum_questions_type DEFAULT 'single_choice'::public.enum_questions_type NOT NULL,
    score double precision DEFAULT '1'::double precision NOT NULL,
    "quizId" uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.questions OWNER TO test;

--
-- Name: COLUMN questions.score; Type: COMMENT; Schema: public; Owner: test
--

COMMENT ON COLUMN public.questions.score IS 'Количество баллов за вопрос';


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.quizzes (
    id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    "isPublic" boolean DEFAULT true NOT NULL,
    "authorId" uuid NOT NULL,
    "timeLimit" integer,
    "shuffleQuestions" boolean DEFAULT false NOT NULL,
    "shuffleOptions" boolean DEFAULT false NOT NULL,
    "showCorrectAnswers" boolean DEFAULT false NOT NULL,
    "attemptsAllowed" integer,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.quizzes OWNER TO test;

--
-- Name: COLUMN quizzes."timeLimit"; Type: COMMENT; Schema: public; Owner: test
--

COMMENT ON COLUMN public.quizzes."timeLimit" IS 'Time limit in seconds; if null => no limit';


--
-- Name: COLUMN quizzes."attemptsAllowed"; Type: COMMENT; Schema: public; Owner: test
--

COMMENT ON COLUMN public.quizzes."attemptsAllowed" IS 'Если не null => кол-во попыток';


--
-- Name: user_question_answers; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.user_question_answers (
    id uuid NOT NULL,
    "userQuizResultId" uuid NOT NULL,
    "questionId" uuid NOT NULL,
    "chosenOptionIds" jsonb,
    "textAnswer" text,
    score double precision DEFAULT '0'::double precision NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.user_question_answers OWNER TO test;

--
-- Name: COLUMN user_question_answers."chosenOptionIds"; Type: COMMENT; Schema: public; Owner: test
--

COMMENT ON COLUMN public.user_question_answers."chosenOptionIds" IS 'Массив выбранных вариантов (если multiple choice) или другое';


--
-- Name: COLUMN user_question_answers."textAnswer"; Type: COMMENT; Schema: public; Owner: test
--

COMMENT ON COLUMN public.user_question_answers."textAnswer" IS 'Ответ, если вопрос текстовый';


--
-- Name: user_quiz_results; Type: TABLE; Schema: public; Owner: test
--

CREATE TABLE public.user_quiz_results (
    id uuid NOT NULL,
    "userId" uuid NOT NULL,
    "quizId" uuid NOT NULL,
    score double precision DEFAULT '0'::double precision NOT NULL,
    "maxScore" double precision DEFAULT '0'::double precision NOT NULL,
    "serializedQuestions" jsonb,
    "startedAt" timestamp with time zone,
    "finishedAt" timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE public.user_quiz_results OWNER TO test;

--
-- Name: COLUMN user_quiz_results."serializedQuestions"; Type: COMMENT; Schema: public; Owner: test
--

COMMENT ON COLUMN public.user_quiz_results."serializedQuestions" IS 'Сериализованные вопросы (order, shuffled options), если нужно';


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: test
--

COPY public."Users" (id, role, email, username, hash, "hashRt", "createdAt", "updatedAt") FROM stdin;
0034cd0d-1f59-455a-aee4-36f62e5636fe	user	test2@test.ru	Maxmud	$2b$10$YN.OCj0YoGccRMk.zK1tLuQq02gOHcwTnuIXKiTRaQW9gQIqWiBny	$2b$10$780crUVHKbrGaConzcRpw.iFVT06bUvBbCvcgfaIjvmFRwEVvYLK.	2025-01-20 04:33:01.852+00	2025-01-20 04:36:12.617+00
66c02a0b-8a23-48f0-90dd-4716492debcd	admin	test123@mail.ru	asdsd	$2b$10$ln1qqSq6xGxkrddX2Hi2buaofsGFyvZ7IWw6ScPAvAdFs0uO.geIC	$2b$10$EOSWpF7Ei/rvf9KLHmKuNu0Nk/pmCjatEKXDKCMuIBClAVOro6I8a	2025-01-19 19:49:03.578+00	2025-01-19 19:49:03.685+00
8a8fd846-e04a-4953-9d28-cf6135a325f4	admin	test@test.uz	string	$2b$10$V30UHvgg71x.0jDMsXS1Se0uXI7H/5P33qyHXQCrmqFzJcxy1hn6y	$2b$10$1ygdqcuAMtygVn7W5SZnBuWn2V9mNTCzq7tNrZBeB9UdjBCKTQOlK	2025-01-18 18:08:57.785+00	2025-01-18 18:53:35.985+00
56a707ae-3867-4f2f-bb0e-7f1033f8d225	user	m.xudoyberdiev88@gmail.com	Maxmudjon	\N	$2b$10$l95W4oya7b8pnmxm94il7ObIhEksg/TKv025quyMYz/OSm47DqFZO	2025-01-19 20:24:09.378+00	2025-01-19 20:27:08.436+00
59e2f7e2-eee7-499f-ac64-cbb06e03960b	admin	test@mail.ru	Maxmud	$2b$10$WZC8yZ9lDpz4Uo1ZDtap9OIGXazmqzCwME/a4CUn6IJzBi7HYdAky	$2b$10$7YahhahRs4bbdiQhczT3DeTTEwbwDQKn2JHmDX3v/2wO.ZRIXdeH2	2025-01-18 20:03:43.978+00	2025-01-18 20:06:09.973+00
3cfabfed-7949-4209-a335-c427c05320a5	admin	test12@test.com	maxmud	$2b$10$Pwuacpr5N8Bd/vgsjb67j.pOzytKkZIkG7t7BtkCSiBXzqUx5afPC	$2b$10$wVm8yRQdhZleUtHuKy0TCe/P4X7wSIeEeJ2BhXAcD99535kn.fEs2	2025-01-19 17:02:34.118+00	2025-01-19 17:02:34.232+00
e0af07ce-a847-42c6-806e-a036d94ee077	admin	test10@mail.ru	asdfdsaf	$2b$10$ABViJOkVuSdQ.y9xHSuXBe.BSDQeG7/.PS3u4.GKTHts2DICRxbWq	$2b$10$o3DQMV4I2GUWsf9dW8DRRezbPHJoCi6Np5LZdgJtS9WsQ3wT5B1KS	2025-01-19 18:16:24.563+00	2025-01-19 18:16:24.677+00
ea0163e4-0297-4adc-801a-4b3588498dee	admin	test1@test.uz	sg	$2b$10$ew61bI1A.TMaE1rzCDAAUOYv1Sv.FOj.x56XTU5jysjHwamkM5Wpe	$2b$10$/dHe5rtzyL4bRW2HsrlSPudmbQEOtHl1icpt/TvwJdDImDLinyX6m	2025-01-19 18:17:41.957+00	2025-01-19 18:17:42.056+00
6db9fbb4-8b05-4426-81e4-62309e33e6f1	admin	M.Xudoyberdiev88@yandex.ru	Maxmud	$2b$10$4zUdMxmn4q1CQmRA4XU7bOJFswSS2IYoMxSEnewphEMwT0zsK7mSu	$2b$10$9HzzDB5WHGZ1Zur1.sOzKO4Iu2t2JvFv5eOHMfExmKvU2B1XnbV.q	2025-01-18 19:52:06.108+00	2025-01-19 18:46:13.221+00
beb2bc3f-9c49-4616-870f-04280c51fc9e	admin	test1@mail.ru	maxmud99	$2b$10$GGSgHfHPfST0ehDoD2xE8euh5oebMDFf3RZkoG/OPovgu4HFRPlUC	$2b$10$SI/sHuzw1MvN8FXjcb16H.475CBBO7obnjavTQVjjIGqnSD6c4ic6	2025-01-19 17:17:43.575+00	2025-01-20 05:48:47.909+00
\.


--
-- Data for Name: options; Type: TABLE DATA; Schema: public; Owner: test
--

COPY public.options (id, text, "isCorrect", "questionId", created_at, updated_at) FROM stdin;
5e03d210-e227-4e5b-b752-54cffbb21fba	object	t	1c0c5eea-a2bb-40c1-8794-8d0d90f2de1c	2025-01-18 18:19:57.373+00	2025-01-18 18:19:57.373+00
68385c4e-8dd4-4f11-8fc9-a735f9d8df69	null	f	1c0c5eea-a2bb-40c1-8794-8d0d90f2de1c	2025-01-18 18:20:05.04+00	2025-01-18 18:20:05.04+00
efeb0154-c51c-480d-ab00-34900ffda8fc	undefined	f	1c0c5eea-a2bb-40c1-8794-8d0d90f2de1c	2025-01-18 18:20:11.228+00	2025-01-18 18:20:11.228+00
236e082c-8808-4824-9a47-238fdb5a3a7a	undefined	f	1c0c5eea-a2bb-40c1-8794-8d0d90f2de1c	2025-01-18 18:20:20.838+00	2025-01-18 18:20:20.838+00
2f6f844d-8a23-47c1-848c-289e3b40c74b	Блок кода, который выполняется только один раз	f	688fa10e-46ad-4c3d-9333-c3e722147474	2025-01-18 18:21:14.957+00	2025-01-18 18:21:14.957+00
5cf72b1d-4069-402a-93a9-ec634153cb45	Переменная, которая может хранить любое значение	f	688fa10e-46ad-4c3d-9333-c3e722147474	2025-01-18 18:21:25.124+00	2025-01-18 18:21:25.124+00
b8cbade4-4b98-4e55-b229-ff6c2a367d4f	Функция - это блок кода, который можно вызывать многократно, что позволяет структурировать код и повторно использовать его.	t	688fa10e-46ad-4c3d-9333-c3e722147474	2025-01-18 18:21:43.742+00	2025-01-18 18:21:43.742+00
f1901a16-cb85-46a3-8e2c-6fea2c587130	 let obj = {}	f	f22a7e78-1cc1-45a8-a07e-a549fd994e66	2025-01-18 18:22:17.242+00	2025-01-18 18:22:17.242+00
0197cd36-7ed7-4632-a6b4-4e6b2310a7de	new Object()	f	f22a7e78-1cc1-45a8-a07e-a549fd994e66	2025-01-18 18:22:27.342+00	2025-01-18 18:22:27.342+00
85a26467-d5a8-49d8-a0af-f3043d22f64f	Оба варианта являются корректными способами создания объектов в JavaScript.	t	f22a7e78-1cc1-45a8-a07e-a549fd994e66	2025-01-18 18:22:46.25+00	2025-01-18 18:22:46.25+00
53c1b273-905a-43ce-a132-0bb18cb898f3	Шаблон для создания объектов	f	fb38c4da-3f71-405b-b562-f7111096b67c	2025-01-18 18:23:19.909+00	2025-01-18 18:23:19.909+00
737beeb3-2c8d-4e41-91ea-3427cb137ef1	Способ наследования свойств и методов.	f	fb38c4da-3f71-405b-b562-f7111096b67c	2025-01-18 18:23:27.85+00	2025-01-18 18:23:27.85+00
70683bf1-61f3-4fdf-929d-9c97a96240e8	Прототип - это шаблон для создания объектов, а также способ наследования свойств и методов.	t	fb38c4da-3f71-405b-b562-f7111096b67c	2025-01-18 18:23:39.37+00	2025-01-18 18:23:39.37+00
b624f742-4c0b-4abe-8405-29feb6b7cdf1	Асинхронный JavaScript позволяет выполнять код в фоновом режиме, не блокируя выполнение других операций, что важно для таких задач, как загрузка данных с сервера.	t	558d0b3c-64ef-4b13-bec2-0211effdc549	2025-01-18 18:24:11.421+00	2025-01-18 18:24:11.421+00
08f3c0fa-3435-4269-bb7f-ef2a86f0c01a	Код, который выполняется в фоновом режиме, не блокируя выполнение других операций.	f	558d0b3c-64ef-4b13-bec2-0211effdc549	2025-01-18 18:25:21.55+00	2025-01-18 18:25:21.55+00
26e81798-e1cd-4ba4-a80b-ee2bb2e684fd	Код, который выполняется последовательно.	f	558d0b3c-64ef-4b13-bec2-0211effdc549	2025-01-18 18:25:35.495+00	2025-01-18 18:25:35.495+00
3f7fd8ee-6b47-4a76-a85f-09a985b1a300	 element.style.color = green	f	14a8a4fa-50e0-4853-86ac-fa67d81ddc44	2025-01-18 18:26:26.982+00	2025-01-18 18:26:26.982+00
3eaf0ad2-2de2-4e5c-832a-2763b0cfc186	 element.setColor(green)	f	14a8a4fa-50e0-4853-86ac-fa67d81ddc44	2025-01-18 18:26:44.324+00	2025-01-18 18:26:44.324+00
30ca6a62-3786-4573-bc24-24d2300f38eb	Метод element.style.color = green позволяет установить цвет текста элемента.	t	14a8a4fa-50e0-4853-86ac-fa67d81ddc44	2025-01-18 18:27:05.323+00	2025-01-18 18:27:05.323+00
\.


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: test
--

COPY public.questions (id, text, type, score, "quizId", created_at, updated_at) FROM stdin;
1c0c5eea-a2bb-40c1-8794-8d0d90f2de1c	Что выведет console.log(typeof null)?	single_choice	1	b6e27a9a-4e54-4d4d-a581-47ad0c33ccf3	2025-01-18 18:11:53.929+00	2025-01-18 18:11:53.929+00
688fa10e-46ad-4c3d-9333-c3e722147474	Что такое функция в JavaScript?	single_choice	1	b6e27a9a-4e54-4d4d-a581-47ad0c33ccf3	2025-01-18 18:16:44.47+00	2025-01-18 18:16:44.47+00
f22a7e78-1cc1-45a8-a07e-a549fd994e66	Как создать объект в JavaScript?	single_choice	1	b6e27a9a-4e54-4d4d-a581-47ad0c33ccf3	2025-01-18 18:17:08.622+00	2025-01-18 18:17:08.622+00
fb38c4da-3f71-405b-b562-f7111096b67c	Что такое прототип в JavaScript?	single_choice	1	b6e27a9a-4e54-4d4d-a581-47ad0c33ccf3	2025-01-18 18:17:33.317+00	2025-01-18 18:17:33.317+00
558d0b3c-64ef-4b13-bec2-0211effdc549	Что такое асинхронный JavaScript?	single_choice	1	b6e27a9a-4e54-4d4d-a581-47ad0c33ccf3	2025-01-18 18:17:59.418+00	2025-01-18 18:17:59.418+00
14a8a4fa-50e0-4853-86ac-fa67d81ddc44	Какой метод используется для изменения цвета текста элемента с помощью JavaScript?	single_choice	1	b6e27a9a-4e54-4d4d-a581-47ad0c33ccf3	2025-01-18 18:18:31.976+00	2025-01-18 18:18:31.976+00
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: test
--

COPY public.quizzes (id, title, description, "isPublic", "authorId", "timeLimit", "shuffleQuestions", "shuffleOptions", "showCorrectAnswers", "attemptsAllowed", created_at, updated_at) FROM stdin;
b6e27a9a-4e54-4d4d-a581-47ad0c33ccf3	JavaScript 101	Тест на знание основ JS (10 вопросов)	t	8a8fd846-e04a-4953-9d28-cf6135a325f4	600	f	f	f	2	2025-01-18 18:10:15.334+00	2025-01-18 18:10:15.334+00
\.


--
-- Data for Name: user_question_answers; Type: TABLE DATA; Schema: public; Owner: test
--

COPY public.user_question_answers (id, "userQuizResultId", "questionId", "chosenOptionIds", "textAnswer", score, created_at, updated_at) FROM stdin;
b7aa2557-ca6f-4313-8ef9-d357b5cd0204	a7d35eac-ef31-4aa1-9656-ffb067fa44d1	1c0c5eea-a2bb-40c1-8794-8d0d90f2de1c	["5e03d210-e227-4e5b-b752-54cffbb21fba"]	\N	1	2025-01-18 18:42:12.187+00	2025-01-18 18:42:12.187+00
46f3dcc9-ca31-41d1-abb2-2755e00108f6	a7d35eac-ef31-4aa1-9656-ffb067fa44d1	688fa10e-46ad-4c3d-9333-c3e722147474	["2f6f844d-8a23-47c1-848c-289e3b40c74b"]	\N	0	2025-01-18 18:43:23.367+00	2025-01-18 18:43:23.367+00
a1502d2b-4edb-4f8e-8d00-1b2d4377d5b5	a7d35eac-ef31-4aa1-9656-ffb067fa44d1	f22a7e78-1cc1-45a8-a07e-a549fd994e66	["85a26467-d5a8-49d8-a0af-f3043d22f64f"]	\N	1	2025-01-18 18:45:13.858+00	2025-01-18 18:45:13.858+00
9035318e-cc4e-4d3c-a93a-3252ea4566e2	a7d35eac-ef31-4aa1-9656-ffb067fa44d1	fb38c4da-3f71-405b-b562-f7111096b67c	["70683bf1-61f3-4fdf-929d-9c97a96240e8"]	\N	1	2025-01-18 18:45:46.042+00	2025-01-18 18:45:46.042+00
1184dad6-0ea3-4f6b-87e6-47a4800e8f28	a7d35eac-ef31-4aa1-9656-ffb067fa44d1	558d0b3c-64ef-4b13-bec2-0211effdc549	["08f3c0fa-3435-4269-bb7f-ef2a86f0c01a"]	\N	0	2025-01-18 18:46:40.436+00	2025-01-18 18:46:40.436+00
31779ced-41d8-41d4-bcc3-3aed76fe7b5c	a7d35eac-ef31-4aa1-9656-ffb067fa44d1	14a8a4fa-50e0-4853-86ac-fa67d81ddc44	["30ca6a62-3786-4573-bc24-24d2300f38eb"]	\N	1	2025-01-18 18:47:34.57+00	2025-01-18 18:47:34.57+00
84020546-9eeb-4bd5-9709-1148475e2eb2	72984832-ffaa-49ca-b56a-3b3ecca917bd	1c0c5eea-a2bb-40c1-8794-8d0d90f2de1c	["5e03d210-e227-4e5b-b752-54cffbb21fba"]	\N	1	2025-01-18 18:54:52.081+00	2025-01-18 18:54:52.081+00
37e2cde4-4a4a-472b-939e-398b773b8124	72984832-ffaa-49ca-b56a-3b3ecca917bd	688fa10e-46ad-4c3d-9333-c3e722147474	["5cf72b1d-4069-402a-93a9-ec634153cb45"]	\N	0	2025-01-18 18:55:39.785+00	2025-01-18 18:55:39.785+00
2a9623e4-ba37-4228-85a2-ff4746432564	72984832-ffaa-49ca-b56a-3b3ecca917bd	f22a7e78-1cc1-45a8-a07e-a549fd994e66	["85a26467-d5a8-49d8-a0af-f3043d22f64f"]	\N	1	2025-01-18 18:56:27.16+00	2025-01-18 18:56:27.16+00
24707ef2-1158-4f71-ac4f-61473acd5e61	72984832-ffaa-49ca-b56a-3b3ecca917bd	fb38c4da-3f71-405b-b562-f7111096b67c	["70683bf1-61f3-4fdf-929d-9c97a96240e8"]	\N	1	2025-01-18 18:56:58.687+00	2025-01-18 18:56:58.687+00
9b1dba88-0340-4435-a241-fa6ef875b270	72984832-ffaa-49ca-b56a-3b3ecca917bd	558d0b3c-64ef-4b13-bec2-0211effdc549	["b624f742-4c0b-4abe-8405-29feb6b7cdf1"]	\N	1	2025-01-18 18:57:36.492+00	2025-01-18 18:57:36.492+00
6ca96e70-725e-4097-ab0e-5fdcfaf08357	72984832-ffaa-49ca-b56a-3b3ecca917bd	14a8a4fa-50e0-4853-86ac-fa67d81ddc44	["3eaf0ad2-2de2-4e5c-832a-2763b0cfc186"]	\N	0	2025-01-18 18:58:06.067+00	2025-01-18 18:58:06.067+00
\.


--
-- Data for Name: user_quiz_results; Type: TABLE DATA; Schema: public; Owner: test
--

COPY public.user_quiz_results (id, "userId", "quizId", score, "maxScore", "serializedQuestions", "startedAt", "finishedAt", created_at, updated_at) FROM stdin;
a7d35eac-ef31-4aa1-9656-ffb067fa44d1	8a8fd846-e04a-4953-9d28-cf6135a325f4	b6e27a9a-4e54-4d4d-a581-47ad0c33ccf3	0	0	"[{\\"questionId\\":\\"1c0c5eea-a2bb-40c1-8794-8d0d90f2de1c\\",\\"text\\":\\"Что выведет console.log(typeof null)?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"5e03d210-e227-4e5b-b752-54cffbb21fba\\",\\"text\\":\\"object\\",\\"isCorrect\\":true},{\\"id\\":\\"68385c4e-8dd4-4f11-8fc9-a735f9d8df69\\",\\"text\\":\\"null\\",\\"isCorrect\\":false},{\\"id\\":\\"efeb0154-c51c-480d-ab00-34900ffda8fc\\",\\"text\\":\\"undefined\\",\\"isCorrect\\":false},{\\"id\\":\\"236e082c-8808-4824-9a47-238fdb5a3a7a\\",\\"text\\":\\"undefined\\",\\"isCorrect\\":false}]},{\\"questionId\\":\\"688fa10e-46ad-4c3d-9333-c3e722147474\\",\\"text\\":\\"Что такое функция в JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"2f6f844d-8a23-47c1-848c-289e3b40c74b\\",\\"text\\":\\"Блок кода, который выполняется только один раз\\",\\"isCorrect\\":false},{\\"id\\":\\"5cf72b1d-4069-402a-93a9-ec634153cb45\\",\\"text\\":\\"Переменная, которая может хранить любое значение\\",\\"isCorrect\\":false},{\\"id\\":\\"b8cbade4-4b98-4e55-b229-ff6c2a367d4f\\",\\"text\\":\\"Функция - это блок кода, который можно вызывать многократно, что позволяет структурировать код и повторно использовать его.\\",\\"isCorrect\\":true}]},{\\"questionId\\":\\"f22a7e78-1cc1-45a8-a07e-a549fd994e66\\",\\"text\\":\\"Как создать объект в JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"f1901a16-cb85-46a3-8e2c-6fea2c587130\\",\\"text\\":\\" let obj = {}\\",\\"isCorrect\\":false},{\\"id\\":\\"0197cd36-7ed7-4632-a6b4-4e6b2310a7de\\",\\"text\\":\\"new Object()\\",\\"isCorrect\\":false},{\\"id\\":\\"85a26467-d5a8-49d8-a0af-f3043d22f64f\\",\\"text\\":\\"Оба варианта являются корректными способами создания объектов в JavaScript.\\",\\"isCorrect\\":true}]},{\\"questionId\\":\\"fb38c4da-3f71-405b-b562-f7111096b67c\\",\\"text\\":\\"Что такое прототип в JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"53c1b273-905a-43ce-a132-0bb18cb898f3\\",\\"text\\":\\"Шаблон для создания объектов\\",\\"isCorrect\\":false},{\\"id\\":\\"737beeb3-2c8d-4e41-91ea-3427cb137ef1\\",\\"text\\":\\"Способ наследования свойств и методов.\\",\\"isCorrect\\":false},{\\"id\\":\\"70683bf1-61f3-4fdf-929d-9c97a96240e8\\",\\"text\\":\\"Прототип - это шаблон для создания объектов, а также способ наследования свойств и методов.\\",\\"isCorrect\\":true}]},{\\"questionId\\":\\"558d0b3c-64ef-4b13-bec2-0211effdc549\\",\\"text\\":\\"Что такое асинхронный JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"b624f742-4c0b-4abe-8405-29feb6b7cdf1\\",\\"text\\":\\"Асинхронный JavaScript позволяет выполнять код в фоновом режиме, не блокируя выполнение других операций, что важно для таких задач, как загрузка данных с сервера.\\",\\"isCorrect\\":true},{\\"id\\":\\"08f3c0fa-3435-4269-bb7f-ef2a86f0c01a\\",\\"text\\":\\"Код, который выполняется в фоновом режиме, не блокируя выполнение других операций.\\",\\"isCorrect\\":false},{\\"id\\":\\"26e81798-e1cd-4ba4-a80b-ee2bb2e684fd\\",\\"text\\":\\"Код, который выполняется последовательно.\\",\\"isCorrect\\":false}]},{\\"questionId\\":\\"14a8a4fa-50e0-4853-86ac-fa67d81ddc44\\",\\"text\\":\\"Какой метод используется для изменения цвета текста элемента с помощью JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"3f7fd8ee-6b47-4a76-a85f-09a985b1a300\\",\\"text\\":\\" element.style.color = green\\",\\"isCorrect\\":false},{\\"id\\":\\"3eaf0ad2-2de2-4e5c-832a-2763b0cfc186\\",\\"text\\":\\" element.setColor(green)\\",\\"isCorrect\\":false},{\\"id\\":\\"30ca6a62-3786-4573-bc24-24d2300f38eb\\",\\"text\\":\\"Метод element.style.color = green позволяет установить цвет текста элемента.\\",\\"isCorrect\\":true}]}]"	2025-01-18 18:33:25.547+00	2025-01-18 18:50:36.903+00	2025-01-18 18:33:25.548+00	2025-01-18 18:50:36.903+00
72984832-ffaa-49ca-b56a-3b3ecca917bd	8a8fd846-e04a-4953-9d28-cf6135a325f4	b6e27a9a-4e54-4d4d-a581-47ad0c33ccf3	4	6	"[{\\"questionId\\":\\"1c0c5eea-a2bb-40c1-8794-8d0d90f2de1c\\",\\"text\\":\\"Что выведет console.log(typeof null)?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"5e03d210-e227-4e5b-b752-54cffbb21fba\\",\\"text\\":\\"object\\",\\"isCorrect\\":true},{\\"id\\":\\"68385c4e-8dd4-4f11-8fc9-a735f9d8df69\\",\\"text\\":\\"null\\",\\"isCorrect\\":false},{\\"id\\":\\"efeb0154-c51c-480d-ab00-34900ffda8fc\\",\\"text\\":\\"undefined\\",\\"isCorrect\\":false},{\\"id\\":\\"236e082c-8808-4824-9a47-238fdb5a3a7a\\",\\"text\\":\\"undefined\\",\\"isCorrect\\":false}]},{\\"questionId\\":\\"688fa10e-46ad-4c3d-9333-c3e722147474\\",\\"text\\":\\"Что такое функция в JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"2f6f844d-8a23-47c1-848c-289e3b40c74b\\",\\"text\\":\\"Блок кода, который выполняется только один раз\\",\\"isCorrect\\":false},{\\"id\\":\\"5cf72b1d-4069-402a-93a9-ec634153cb45\\",\\"text\\":\\"Переменная, которая может хранить любое значение\\",\\"isCorrect\\":false},{\\"id\\":\\"b8cbade4-4b98-4e55-b229-ff6c2a367d4f\\",\\"text\\":\\"Функция - это блок кода, который можно вызывать многократно, что позволяет структурировать код и повторно использовать его.\\",\\"isCorrect\\":true}]},{\\"questionId\\":\\"f22a7e78-1cc1-45a8-a07e-a549fd994e66\\",\\"text\\":\\"Как создать объект в JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"f1901a16-cb85-46a3-8e2c-6fea2c587130\\",\\"text\\":\\" let obj = {}\\",\\"isCorrect\\":false},{\\"id\\":\\"0197cd36-7ed7-4632-a6b4-4e6b2310a7de\\",\\"text\\":\\"new Object()\\",\\"isCorrect\\":false},{\\"id\\":\\"85a26467-d5a8-49d8-a0af-f3043d22f64f\\",\\"text\\":\\"Оба варианта являются корректными способами создания объектов в JavaScript.\\",\\"isCorrect\\":true}]},{\\"questionId\\":\\"fb38c4da-3f71-405b-b562-f7111096b67c\\",\\"text\\":\\"Что такое прототип в JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"53c1b273-905a-43ce-a132-0bb18cb898f3\\",\\"text\\":\\"Шаблон для создания объектов\\",\\"isCorrect\\":false},{\\"id\\":\\"737beeb3-2c8d-4e41-91ea-3427cb137ef1\\",\\"text\\":\\"Способ наследования свойств и методов.\\",\\"isCorrect\\":false},{\\"id\\":\\"70683bf1-61f3-4fdf-929d-9c97a96240e8\\",\\"text\\":\\"Прототип - это шаблон для создания объектов, а также способ наследования свойств и методов.\\",\\"isCorrect\\":true}]},{\\"questionId\\":\\"558d0b3c-64ef-4b13-bec2-0211effdc549\\",\\"text\\":\\"Что такое асинхронный JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"b624f742-4c0b-4abe-8405-29feb6b7cdf1\\",\\"text\\":\\"Асинхронный JavaScript позволяет выполнять код в фоновом режиме, не блокируя выполнение других операций, что важно для таких задач, как загрузка данных с сервера.\\",\\"isCorrect\\":true},{\\"id\\":\\"08f3c0fa-3435-4269-bb7f-ef2a86f0c01a\\",\\"text\\":\\"Код, который выполняется в фоновом режиме, не блокируя выполнение других операций.\\",\\"isCorrect\\":false},{\\"id\\":\\"26e81798-e1cd-4ba4-a80b-ee2bb2e684fd\\",\\"text\\":\\"Код, который выполняется последовательно.\\",\\"isCorrect\\":false}]},{\\"questionId\\":\\"14a8a4fa-50e0-4853-86ac-fa67d81ddc44\\",\\"text\\":\\"Какой метод используется для изменения цвета текста элемента с помощью JavaScript?\\",\\"type\\":\\"single_choice\\",\\"score\\":1,\\"options\\":[{\\"id\\":\\"3f7fd8ee-6b47-4a76-a85f-09a985b1a300\\",\\"text\\":\\" element.style.color = green\\",\\"isCorrect\\":false},{\\"id\\":\\"3eaf0ad2-2de2-4e5c-832a-2763b0cfc186\\",\\"text\\":\\" element.setColor(green)\\",\\"isCorrect\\":false},{\\"id\\":\\"30ca6a62-3786-4573-bc24-24d2300f38eb\\",\\"text\\":\\"Метод element.style.color = green позволяет установить цвет текста элемента.\\",\\"isCorrect\\":true}]}]"	2025-01-18 18:54:05.927+00	2025-01-18 18:58:35.842+00	2025-01-18 18:54:05.927+00	2025-01-18 18:58:35.842+00
\.


--
-- Name: Users Users_email_key; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_email_key" UNIQUE (email);


--
-- Name: Users Users_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (id);


--
-- Name: options options_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT options_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: user_question_answers user_question_answers_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.user_question_answers
    ADD CONSTRAINT user_question_answers_pkey PRIMARY KEY (id);


--
-- Name: user_quiz_results user_quiz_results_pkey; Type: CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.user_quiz_results
    ADD CONSTRAINT user_quiz_results_pkey PRIMARY KEY (id);


--
-- Name: options options_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.options
    ADD CONSTRAINT "options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.questions(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: questions questions_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT "questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public.quizzes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: quizzes quizzes_authorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT "quizzes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES public."Users"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_question_answers user_question_answers_questionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.user_question_answers
    ADD CONSTRAINT "user_question_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES public.questions(id) ON UPDATE CASCADE;


--
-- Name: user_question_answers user_question_answers_userQuizResultId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.user_question_answers
    ADD CONSTRAINT "user_question_answers_userQuizResultId_fkey" FOREIGN KEY ("userQuizResultId") REFERENCES public.user_quiz_results(id) ON UPDATE CASCADE;


--
-- Name: user_quiz_results user_quiz_results_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.user_quiz_results
    ADD CONSTRAINT "user_quiz_results_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public.quizzes(id) ON UPDATE CASCADE;


--
-- Name: user_quiz_results user_quiz_results_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: test
--

ALTER TABLE ONLY public.user_quiz_results
    ADD CONSTRAINT "user_quiz_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."Users"(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

