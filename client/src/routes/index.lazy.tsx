import { createLazyFileRoute } from "@tanstack/react-router";

// FORM
import { zodResolver } from "@hookform/resolvers/zod";
import { parse } from "circular-json";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
const formSchema = z.object({
	prompt: z.string().min(1, { message: "Please enter a prompt..." }),
});

// function Index() {
// 	return (
// 		<div className="p-2">
// 			<h3>Welcome Home!</h3>
// 		</div>
// 	);
// }
import axios from "axios";
import { useState } from "react";

type Message = {
	role: "user" | "assistant";
	content: string;
};

const models = {
	llama3: "meta-llama/llama-3-8b-instruct:free",
	llama3p1: "meta-llama/llama-3.1-8b-instruct:free",
	mistral: "mistralai/mistral-7b-instruct:free",
};

export default function Index() {
	const methods = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			prompt: "",
		},
	});
	const {
		formState: { isSubmitting },
		reset,
	} = methods;
	// const [input, setInput] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [model, setModel] = useState(models.llama3);
	// const [response, setResponse] = useState<Message[]>();

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		try {
			// add user input to array
			// doesn't work: setMessages((prevMessages: Message[]) => [...prevMessages, { role: "user", content: input }]); // doesn't immediately add to array because of some issue
			messages.push({ role: "user", content: values.prompt });
			console.log(messages);
			const { data } = await axios.post("http://localhost:5000/api/form", {
				conversation: messages,
				model: model,
			});
			const res = parse(data);
			// add assistant response to array
			setMessages((prevMessages: Message[]) => [...prevMessages, { role: "assistant", content: res.data.choices[0].message.content }]);
		} catch (err) {
			console.error(err);
		} finally {
			reset();
		}
	};

	return (
		<main className="container mt-8">
			<h1 className="text-3xl text-center font-bold">Chat with OS LLMs</h1>
			<div className="flex gap-3">
				<Button onClick={() => setModel(models.llama3)}>Llama3</Button>
				<Button onClick={() => setModel(models.llama3p1)}>Llama3.1</Button>
				<Button onClick={() => setModel(models.mistral)}>Mistral</Button>
			</div>
			<h3 className="text-xl text-center">
				Current Model: <span className="font-bold">{model === models.llama3 ? "Llama3" : model === models.llama3p1 ? "Llama3.1" : model === models.mistral ? "Mistral" : ""}</span>
			</h3>
			<Form {...methods}>
				<form onSubmit={methods.handleSubmit(onSubmit)}>
					<FormField
						control={methods.control}
						name="prompt"
						render={({ field }) => (
							<FormItem>
								<FormLabel htmlFor="prompt"></FormLabel>
								<FormControl>
									<Input {...field} type="text" placeholder="Please enter a message..." name="prompt" id="prompt" />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full mt-8" disabled={isSubmitting}>
						{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{isSubmitting ? "Submitting" : "Submit"}
					</Button>
				</form>
			</Form>
			{messages &&
				messages.map((message, index) => (
					<p key={index} className="mt-4">
						{message.role === "user" ? `User: ${message.content}` : `Assistant: ${message.content}`}
					</p>
				))}
			{/* {JSON.stringify(response)} */}
		</main>
	);
}

export const Route = createLazyFileRoute("/")({
	component: Index,
});
