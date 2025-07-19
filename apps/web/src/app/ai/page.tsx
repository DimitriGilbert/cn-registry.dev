"use client";

import { useChat } from "@ai-sdk/react";
import { Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useFormedible } from "@/hooks/use-formedible";

const chatSchema = z.object({
	prompt: z.string().min(1, "Message cannot be empty"),
});

type ChatFormValues = z.infer<typeof chatSchema>;

export default function AIPage() {
	const { messages, append } = useChat({
		api: `${process.env.NEXT_PUBLIC_SERVER_URL}/ai`,
	});

	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { Form, form } = useFormedible<ChatFormValues>({
		schema: chatSchema,
		formOptions: {
			defaultValues: { prompt: "" },
			onSubmit: async ({ value, formApi }) => {
				await append({ role: "user", content: value.prompt });
				formApi.reset();
			},
		},
	});

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="mx-auto grid w-full grid-rows-[1fr_auto] overflow-hidden p-4">
			<div className="space-y-4 overflow-y-auto pb-4">
				{messages.length === 0 ? (
					<div className="mt-8 text-center text-muted-foreground">
						Ask me anything to get started!
					</div>
				) : (
					messages.map((message) => (
						<div
							key={message.id}
							className={`rounded-lg p-3 ${
								message.role === "user"
									? "ml-8 bg-primary/10"
									: "mr-8 bg-secondary/20"
							}`}
						>
							<p className="mb-1 font-semibold text-sm">
								{message.role === "user" ? "You" : "AI Assistant"}
							</p>
							<div className="whitespace-pre-wrap">{message.content}</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			<Form className="flex w-full items-center space-x-2 border-t pt-2">
				<form.Field name="prompt">
					{(field) => (
						<input
							className="flex-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							type="text"
							placeholder="Type your message..."
							value={field.state.value}
							onChange={(e) => field.handleChange(e.target.value)}
							onBlur={field.handleBlur}
							autoComplete="off"
							autoFocus
						/>
					)}
				</form.Field>
				<Button type="submit" size="icon">
					<Send size={18} />
				</Button>
			</Form>
		</div>
	);
}
