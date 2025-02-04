require('dotenv').config() // for loading the environment variables from .env file
const { OpenAI } = require('openai'); // don't forget adding "openai": "^4.35.0" on package.json and package-lock.json dependencies
import Anthropic from '@anthropic-ai/sdk';
const AI_KEY = process.env.OPENAI_API_KEY; // get your personal openAI API key from .env file
const AI_MODEL = process.env.OPENAI_API_MODEL;

module.exports = {

    generateByAI: async function generateByIA(isWrongBecauseOfACompilationProblem, isCorrect, full_report) {
        if(AI_KEY === undefined || AI_KEY === "") return "";

        let answer = full_report.request.program; // get the student answer
        let language = full_report.request.language; // get the test code language
        let selectedPrompt = ""; // for getting the best prompt (depends on boolean parameters)
        let obtainedOutput = ""; // get the obtained output for the test
        let expectedOutput = ""; // get the expected output for the test (doesn't exist on isWrongBecauseOfACompilationProblem=true)
        try {
            // change unicode to equivalent plain text
            expectedOutput = full_report.reply.report.tests[0].expectedOutput.replaceAll("&#x2591;", " ").replaceAll("&#x204B;", "\n");
            obtainedOutput = full_report.reply.report.tests[0].obtainedOutput.replaceAll("&#x2591;", " ").replaceAll("&#x204B;", "\n");
        } catch (error) {
            // nothing to do because expectedOutput is not used on "compilation error" prompt creation.            
        }

        selectedPrompt = "Please, it's no necessary to answer immediately, but analyze the following code" + "\n" +
                         "```" + language + "\n" +
                         answer + "\n" +
                         "```" + "\n" +
                         "and take note of any relevant aspects." + "\n" +
                         "Now, in no more than 40 words in markdown format, "; // initialize the selected prompt

        // Prompt when student provides a CORRECT answer
        if (isCorrect)
                    selectedPrompt +=
                        "if we expect the result of that code to be exactly:" + "\n" +
                        "```" + "\n" +
                        expectedOutput + "\n" +
                        "```" + "\n" +
                        ", provide me with an single advice indicating some critical code optimization (only if necessary).";

        // Prompt when student provides a WRONG answer
        else if (!isCorrect && !isWrongBecauseOfACompilationProblem)
                    selectedPrompt +=
                        "provide me with a single suggestion (without indicating any code in ${language}), " +
                        "so that upon executing the updated code with your suggestion, the output obtained was" + "\n" +
                        "```" + "\n" +
                        obtainedOutput + "\n" +
                        "```" + "\n" +
                        "and we expected to obtain exactly as follows:" + "\n" +
                        "```" + "\n" +
                        expectedOutput + "\n" +
                        "```" + "\n" +
                        ".";

        // Prompt when COMPILATION PROBLEM exists
        else if (isWrongBecauseOfACompilationProblem)
                    selectedPrompt +=
                        "provide me with only the first code line that generates an error when compiling and some help to fix it.";

        // OpenAI API access
        try {
            let feedbackText = "";
	  if(AI_MODEL.startsWith('gpt')) {
            const openai = new OpenAI({ AI_KEY }); // new instance of the OpenAI class with the API key provided as an argument
            const aiResponse = await openai.chat.completions.create({
                messages: [{ "role": "user", "content": selectedPrompt }],
                model: AI_MODEL
            });
            aiResponse.choices.forEach(choice => {
                feedbackText += choice.message.content;
            });
          } else if(AI_MODEL.startsWith('claude')) {
            const anthropic = new Anthropic({apiKey: AI_KEY });
            const aiResponse = await anthropic.messages.create({
                messages: [{ "role": "user", "content": selectedPrompt }],
		max_tokens: 256,
                model: AI_MODEL
            });
            aiResponse.content.forEach(message => {
                feedbackText += message.text;
            });
          }
            return "\n### Advice from Artificial Intelligence:\n\n" + feedbackText;

        } catch (error) { // Handle the error according to its status code
            throw new Error(error);
        }
    }
}
