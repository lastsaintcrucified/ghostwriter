import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { topic, tone, industry } = await req.json();

		if (!topic) {
			return NextResponse.json({ error: "Topic is required" }, { status: 400 });
		}

		const prompt = `
Role: You're a $10,000/month LinkedIn ghostwriter.

Task: Write a viral post about "${topic}" in ${tone} tone.

Rules:
- First line must shock or intrigue
- Share a personal failure lesson
- End with a philosophical question
- Format: Short paragraphs, no buzzwords
- Hashtag: #${industry}Life

Example structure:
"[CONTROVERSIAL OPINION]. When I [FAILURE STORY], I learned [INSIGHT]. Was I wrong? [QUESTION] #StartupTruths"
`;

		// Call OpenRouter API with deepseek/deepseek-r1:free model
		const response = await fetch(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
					"HTTP-Referer":
						process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Required for OpenRouter
					"X-Title": "LinkedIn Ghostwriter", // Optional, but good practice
				},
				body: JSON.stringify({
					model: "deepseek/deepseek-r1:free",
					messages: [
						{
							role: "system",
							content:
								"You are a professional LinkedIn ghostwriter who creates viral content for startup founders.",
						},
						{ role: "user", content: prompt },
					],
					temperature: 0.7,
					max_tokens: 500,
				}),
			}
		);

		if (!response.ok) {
			const errorData = await response.json();
			console.error("OpenRouter API error:", errorData);
			throw new Error("Failed to generate content");
		}

		const data = await response.json();
		const generatedContent = data.choices[0].message.content.trim();

		return NextResponse.json({ content: generatedContent });
	} catch (error) {
		console.error("Error generating post:", error);
		return NextResponse.json(
			{ error: "Failed to generate post" },
			{ status: 500 }
		);
	}
}
