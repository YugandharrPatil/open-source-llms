// HONO
import { Hono } from "hono";
import { cors } from "hono/cors";
import { handle } from "hono/vercel";

// DEVELOPMENT
// import { serve } from "@hono/node-server"; //
// import dotenv from "dotenv";
// dotenv.config();

// UTILS
import axios from "axios";
// import pkg from "circular-json";
import { stringify } from "flatted";

export const config = {
	runtime: "edge",
};

// const { stringify } = pkg;

const app = new Hono().basePath("/api");
app.use("/*", cors());

// TYPES
type Conversation = {
	role: "user" | "assistant";
	content: string;
};

type Model = "meta-llama/llama-3-8b-instruct:free" | "meta-llama/llama-3.1-8b-instruct:free";

type ResponseBody = {
	conversation: Conversation[];
	model: Model;
};

async function apiCall(conversation: Conversation[], model: Model) {
	const URL = "https://openrouter.ai/api/v1/chat/completions";
	// const models = {
	// 	llama3: "meta-llama/llama-3-8b-instruct:free",
	// 	llama3p1: "meta-llama/llama-3.1-8b-instruct:free",
	// };

	const res = await axios.post(
		URL,
		{
			model: model,
			messages: conversation,
		},
		{
			headers: {
				Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
				"Content-Type": "application/json",
			},
		}
	);
	// console.log(model);
	return res;
}

// ROUTES

app.get("/", (c) => {
	return c.json({ message: "Hello Hono!" });
});

app.post("/form", async (c) => {
	const body: ResponseBody = await c.req.json();
	console.log(body.conversation);
	console.log(body.model);
	const assistantRes = await apiCall(body.conversation, body.model);
	return c.json(stringify(assistantRes));
});

// PROD
export default handle(app);

// DEV
// const port = 5000;
// console.log(`Server is running on port ${port}`);

// // serve({
// // 	fetch: app.fetch,
// // 	port,
// // });
