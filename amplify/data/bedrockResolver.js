export function request(ctx) {
    const { ingredients = [] } = ctx.args;
    const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.`;

    return {
        resourcePath: `/model/amazon.titan-text-express-v1/invoke`,
        method: "POST",
        params: {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                inputText: prompt,
                textGenerationConfig: {
                    maxTokenCount: 1000,
                    temperature: 0.7,
                    topP: 0.9,
                },
            }),
        },
    };
}

export function response(ctx) {
    const parsedBody = JSON.parse(ctx.result.body);

    if (!parsedBody.results || !parsedBody.results[0]) {
        return {
            body: null,
            error: parsedBody.message || "Unexpected response from Bedrock",
        };
    }

    return {
        body: parsedBody.results[0].outputText,
    };
}