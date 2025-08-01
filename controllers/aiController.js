const { GoogleGenAI } = require("@google/genai");
const { conceptExplainPrompt, questionAnswerPrompt} = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

//@desc Generate interview questions & answers using AI
//@route POST /api/ai/generate-questions
//@access private
const generateInterviewQuestions = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, numberOfQuestions } = req.body;
        if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const prompt= questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);

        const model = ai.getGenerativeModel({ 
            model: "gemini-2.0-flash-lite",
            contents: prompt,
         });

        let rawText = response.response.text();

        //clean it: removes ```json from beginning and end
        const cleanedText = rawText
        .replace(/^```json\s*/, "") // remove starting ```json
        .replace(/```$/, "") // remove ending ```
        .trim(); //remove extra spaces

        //now safe to parse
        const data = JSON.parse(cleanedText);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "failed to generate questions", error: error.message });
    }
};

//@desc generate explains a interview question
//@route POST /api/ai/generate-explanation
//@access private
const generateConceptExplanation = async(req, res)=>{
     try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ message: "missing required fields" });
        }

        const prompt = conceptExplainPrompt(question);

        const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
        const response = await model.generateContent(prompt);

        let rawText = response.response.text();

        //clean it: removes ```json from beginning and end
        const cleanedText = rawText
        .replace(/^```json\s*/, "") // remove starting ```json
        .replace(/```$/, "") // remove ending ```
        .trim(); //remove extra spaces

        //now safe to parse
        const data = JSON.parse(cleanedText);
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: "failed to generate questions", error: error.message });
    }
}
module.exports = {generateInterviewQuestions, generateConceptExplanation};