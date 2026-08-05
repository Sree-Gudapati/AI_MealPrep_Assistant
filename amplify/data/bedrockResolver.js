export function request(ctx) {
    const { ingredients = [] } = ctx.args;

    // Construct the prompt with the provided ingredients
    const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

    // Return the request configuration
    return {
        resourcePath: `/model/anthropic.claude-3-haiku-20240307-v1:0/invoke`, method: "POST",
        params: {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                anthropic_version: "bedrock-2023-05-31",
                max_tokens: 1000,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `\n\nHuman: ${prompt}\n\nAssistant:`,
                            },
                        ],
                    },
                ],
            }),
        },
    };
}

export function response(ctx) {
    const parsedBody = JSON.parse(ctx.result.body);

    if (!parsedBody.content || !parsedBody.content[0]) {
        return {
            body: null,
            error: parsedBody.message || "Unexpected response from Bedrock",
        };
    }

    return {
        body: parsedBody.content[0].text,
    };
}