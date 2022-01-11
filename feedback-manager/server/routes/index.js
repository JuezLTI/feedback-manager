// routes/index.js and users.js
import express from "express";
import { EvaluationReport, loadSchemaPEARL } from "evaluation-report-juezlti";
import { db, closeConnection, insert, removeAll, findWithCriteria } from '../DBManager'
var router = express.Router();
// ..stuff below
const match = (array, substring) => {

    let result = false;
    array.find((element) => {


        if (element == ("impossibleToEvaluate")) {
            result = true;
        }
    });
    return result;
}


router.post("/", function(req, res) {
    const numberOfTests = JSON.parse(req.body.additional.numberOfTests);
    let feedback = "";
    store(req).then(
        (data) => {
            if (data) {
                if (data.report) {
                    if (data.report.compilationErrors.length > 0) {
                        {
                            feedback = strategies.apply(data.report);
                            res.send(feedback);
                        }
                    } else {
                        res.send("Correct answer");

                    }
                }
            } else {
                console.log("Compilation error.");
                res.send("Compilation error. You should try to verify if the XPath expression that you submit is correct.");
            }

        }).catch((err) => {
        console.log(err)
    })

});

function store(req) {
    return new Promise((resolve, reject) => {

        let obj = {};
        loadSchemaPEARL().then(() => {
            const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            let evalReq = undefined;

            evalReq = new EvaluationReport(JSON.parse(req.body.PEARL));
            obj.host = ip;
            obj.report = evalReq.reply.report;
            if (evalReq.reply.report.compilationErrors.length > 0) {


                if (match(evalReq.reply.report.compilationErrors, "impossibleToEvaluate")) {

                    resolve(undefined)

                    return;
                }

            }
            console.log("INSERINDO")
            db(() => {
                insert(obj).then(() => {
                    resolve(obj)
                    closeConnection();
                });



            });




        }).catch((err) => {
            console.log(err);
            reject({ res: "undefined" })
        })





    });


}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}


export default router;