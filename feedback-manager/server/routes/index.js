// routes/index.js and users.js
import express from "express";
import EvaluationReport from "evaluation-report";

var router = express.Router();
// ..stuff below

router.post("/", function(req, res) {
    let evalReq = undefined;
    let evalRes = undefined;
    console.log(" my body " + req)
    console.log((evalReq = new EvaluationReport(req.body)));

    evalRes = new EvaluationReport();
    if (evalReq) {
        evalRes = new EvaluationReport(req.body);
        let response = "";

        let e = evalReq.reply.report.compilationErrors;

        if (e) {
            switch (e) {
                case "incorrect exercise format":
                    response =
                        "The learning Object parse as input does not meet the requirements";
                    break;
                case "incorrect xpath expression":
                    response = "The program parse as input is semantically incorrect";
                    break;
                default:
                    if (IsJsonString(e)) {
                        //malformed xpath expression
                        response = "The program parse as input is grammatically incorrect";
                    } else {
                        //non identify error
                        response = "The error is not identified";
                    }
                    break;
            }
        } else {
            response =
                "The XPATH expression is grammatically and semantically correct";
        }
        evalRes.reply.report.feedback_response = response;
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
        evalRes.setReply(reply);
    }
    res.send(evalRes);
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