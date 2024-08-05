import axios from "axios";
import pkg from "circular-json";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
const { stringify } = pkg;
// import { stringify } from "flatted";
const app = express();
app.use(
	cors({
		origin: "*",
	})
);
app.use(express.json());
config();

app.use(express.urlencoded({ extended: true }));

const PORT = 5000;

async function askAxios(conversation, model) {
	const URL = "https://openrouter.ai/api/v1/chat/completions";
	const models = {
		llama3: "meta-llama/llama-3-8b-instruct:free",
		llama3p1: "meta-llama/llama-3.1-8b-instruct:free",
	};

	const res = await axios.post(
		URL,
		{
			model: model,
			messages: conversation,
		},
		{
			headers: {
				Authorization: `Bearer ${process.env.API_KEY}`,
				"Content-Type": "application/json",
			},
		}
	);
	console.log(model);
	return res;
}

app.post("/api/form", async (req, res) => {
	// console.log(req.body.prompt);
	const convo = req.body.conversation;
	const model = req.body.model;
	const assistantRes = await askAxios(convo, model);
	res.json(stringify(assistantRes));
	console.log(assistantRes);
});

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`);
});
