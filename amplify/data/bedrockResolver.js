export function request(ctx) {
    const { ingredients = [] } = ctx.args;
    const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

    return {
        resourcePath: `/model/amazon.nova-micro-v1:0/invoke`,
        method: "POST",
        params: {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: [{ text: prompt }],
                    },
                ],
                inferenceConfig: {
                    maxTokens: 1000,
                    temperature: 0.7,
                },
            }),
        },
    };
}

export function response(ctx) {
    const parsedBody = JSON.parse(ctx.result.body);

    if (!parsedBody.output?.message?.content?.[0]?.text) {
        return {
            body: null,
            error: parsedBody.message || "Unexpected response from Bedrock",
        };
    }

    return {
        body: parsedBody.output.message.content[0].text,
    };
}