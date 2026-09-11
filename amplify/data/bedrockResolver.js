const SYSTEM_INSTRUCTIONS =
    "You are a recipe suggestion assistant. Suggest one recipe idea using the " +
    "ingredients the user provides.\n\n" +
    "Ingredient identity fidelity: never change the category of a named " +
    "ingredient. If an ingredient is plant-based (e.g. tofu steak, seitan, " +
    "tempeh), your technique and seasoning suggestions must be appropriate " +
    "for a plant-based item, not for the meat cut it resembles by name - " +
    "for example, do not describe cooking a tofu steak by searing it like a " +
    "skirt steak. Never substitute a named ingredient with a different " +
    "ingredient in your response.";

export function request(ctx) {
    const { ingredients = [], userContext = "" } = ctx.args;
    const prompt = `Suggest a recipe idea using these ingredients: ${ingredients.join(", ")}.${userContext ? `\n\nUser Context:\n${userContext}` : ""}`;

    return {
        resourcePath: `/model/amazon.nova-lite-v1:0/invoke`,
        method: "POST",
        params: {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                system: [{ text: SYSTEM_INSTRUCTIONS }],
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