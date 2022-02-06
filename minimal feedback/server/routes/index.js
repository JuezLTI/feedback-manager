// routes/index.js and users.js
import express from "express";
import { EvaluationReport, loadSchemaPEARL } from "evaluation-report-juezlti";

var router = express.Router();
// ..stuff below

router.post("/", function(req, res) {
    let evalReq = undefined;
    let feedback_response = "";
    console.log(req.body)
    loadSchemaPEARL().then(() => {

        console.log((evalReq = new EvaluationReport(JSON.parse(req.body.PEARL))));

        if (evalReq) {
          
            let response = "";
    
            let e = evalReq.reply.report.compilationErrors;
      
            if (e) {
                switch (e.length) {
                    case 0:
                        response =
                            "Correct Answer";
                        break;
                 
                    default:
                        response =
                            "Incorrect Answer";
                        break;
                }
            } else {
                response =
                    "The XPATH expression is grammatically and semantically correct";
            }
            feedback_response = response;
        } else {
            let reply = {
                report: {
                    capability: {
                        id: "XPath-evaluator",
                        features: [
                            { name: "language", value: "" },
                            { name: "version", value: "" },
                            { name: "engine", value: "" },
                        ],
                    },
                    exercise: "00000000-0000-0000-0000-000000000000",
                    "feedback_response ": "It's not possible to parse the incoming PEARL JSON",
                },
            };
            feedback_response = (reply);
        }
        res.send(feedback_response);


    });

  
});

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}
export default router;