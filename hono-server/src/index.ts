// HONO
import { serve } from "@hono/node-server";
import { Hono } from "hono";

// UTILS
import axios from "axios";
// import cors from "cors";

const app = new Hono();

// TYPES
type Conversation = {
	user: string;
	assistant: string;
};

enum Models {
	llama3 = "meta-llama/llama-3-8b-instruct:free",
	llama3p1 = "meta-llama/llama-3.1-8b-instruct:free",
}

// ROUTES

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

async function apiCall(conversation: Conversation[], model: Models) {
	const URL = "https://openrouter.ai/api/v1/chat/completions";

	const res = await axios.post(
		URL,
		{
			model: model,
			messages: conversation,
		},
		{
			headers: {
				Authorization: `Bearer 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`,
			},
		}
	);
	console.log(model);
	return res;
}

app.post("/form", async (c) => {
	const reqBody = await c.req.json();
	console.log(reqBody);
});

// LISTEN

const port = 5000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
