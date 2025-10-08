
import { GoogleGenAI, Type } from "@google/genai";
import { DeviceManufacturer } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("Gemini API key is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const getMockDeviceInfo = async (
    manufacturer: DeviceManufacturer
): Promise<{ model: string; version: string }> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is missing.");
    }

    const systemInstruction = `You are a network device database. Your task is to provide a realistic, common device model and OS version for a given manufacturer.
- Respond ONLY with a JSON object.
- The JSON object must match this schema: { "model": "string", "version": "string" }
- Do not add any explanations or markdown formatting.`;

    const prompt = `Manufacturer: ${manufacturer}`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        model: { type: Type.STRING },
                        version: { type: Type.STRING },
                    },
                    required: ["model", "version"],
                },
                temperature: 0.7,
            },
        });

        const jsonStr = response.text.trim();
        const data = JSON.parse(jsonStr);
        if (data.model && data.version) {
            return data;
        } else {
            throw new Error("AI returned invalid JSON structure.");
        }
    } catch (error) {
        console.error("Error fetching mock device info from Gemini:", error);
        throw new Error("Failed to fetch mock device info from AI.");
    }
};

export const generateCommand = async (
    userRequest: string,
    manufacturer: DeviceManufacturer,
    terminalContext: string,
    deviceModel?: string,
    osVersion?: string
): Promise<string> => {
    if (!API_KEY) {
        throw new Error("Gemini API key is missing. Ensure the API_KEY environment variable is set.");
    }
    
    let deviceInfo = `${manufacturer}`;
    if (deviceModel && osVersion) {
        deviceInfo += ` (Model: ${deviceModel}, OS: ${osVersion})`;
    }

    const systemInstruction = `You are NetIntelli X, an AI assistant for expert network engineers. Your task is to generate precise CLI commands for network devices.
- The user will provide a request and the device context (manufacturer).
- Analyze the request and provide only the necessary command(s).
- Do NOT add any explanations, markdown formatting (like \`\`\`), or introductory text.
- If multiple commands are needed, place each on a new line.
- For example, if the user asks "show me the routes", for a Cisco device, you should ONLY return "show ip route".
- The target device is a ${deviceInfo} device.`;
    
    const prompt = `
User Request: "${userRequest}"

Recent Terminal Activity (for context):
---
${terminalContext}
---

Generate the command for a ${manufacturer} device.
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.2,
                topP: 0.95,
                topK: 64,
            },
        });
        
        const text = response.text.trim();
        if (!text) {
            throw new Error("AI returned an empty response.");
        }
        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate command from AI. Check API key and network connection.");
    }
};
