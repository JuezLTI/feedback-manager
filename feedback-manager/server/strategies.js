//import { loadSchemaYAPEXIL, ProgrammingExercise } from "programming-exercise-juezlti";
const { db, closeConnection, insert, removeAll, findWithCriteria } = require('./DBManagerT');

const { loadSchemaYAPEXIL, ProgrammingExercise } = require('programming-exercise-juezlti');
const email = "info@juezlti.eu";
const password = "Ju3zLT1.";

function tipFeedback(statusOfTheCases, tips) {
    let feedback = "";
    for (let x of tips) {
        if (Object.keys(statusOfTheCases).includes(x)) {
            feedback += x + "\n";
        }

    }
    return feedback;
}

function didAlreadyThisCorrect(report) {
    return new Promise(
        function(resolve, reject) {


            let arr = []
            let cases = [];
            findWithCriteria({ host: report.host, "report.exercise": report.exercise }).then((tries) => {
                try {
                    const number = tries.length; //number of wrong submissions

                    tries.forEach(element => {
                        console.log(element)
                        if (element.report.compilationErrors.length > 0) {
                            arr.join(element.report.compilationErrors);
                        }
                    });


                    for (let x of Object.keys(report.compilationErrors)) {
                        if (arr.includes(x)) {
                            cases.push(x)
                        }
                    }
                    resolve(cases.length > 0, cases);
                } catch (error) {
                    reject(error);
                }

            });




        });

}

function countTimesOfTheWrongSubmission(report) {
    return new Promise(
        function(resolve, reject) {


            let arr = []
            let feedback = "";
            findWithCriteria({ host: report.host, "report.exercise": report.exercise }).then((tries) => {
                try {
                    const number = 0;
                    tries.forEach(element => {
                        console.log(element)
                        if (element.report.compilationErrors.length > 0) {
                            number++;
                        }
                    });


                    resolve(number);
                } catch (error) {
                    reject(error);
                }

            });




        });

}

function apply(request) {


    func = (programmingExercise) => {
            let arr = []
            let i = 0;
            for (let x of programmingExercise.skeletons) {
                arr = arr.concat(JSON.parse(programmingExercise.skeletons_contents[x.id]))
                    /*for (let y of JSON.parse(programmingExercise.skeletons_contents[x.id])) {
                        y.id = `${y.id}-${i}`
                        arr.push(y)
                    }
                    i++
                    */
            }
            tipFeedback(request.report.compilationErrors, arr)
            db(() => {
                (async() => {
                    await didAlreadyThisCorrect(request.report).then((response, arr) => { console.log(response) }).catch((err) => { console.log(err) })
                    await countTimesOfTheWrongSubmission(request.report).then((num) => { console.log(num) }).catch((err) => { console.log(err) })
                    closeConnection();
                })();


            })
        }
        // exercise in cache
        //func()
        //else
    loadSchemaYAPEXIL().then(() => {
        ProgrammingExercise
            .loadRemoteExerciseAuthorkit(request.report.exercise, email, password)
            .then((programmingExercise) => {
                func(programmingExercise)
            })
    })
}
apply({
    "host": "::ffff:127.0.0.1",
    "report": {
        "capability": {
            "id": "XPath-evaluator",
            "features": [{
                "name": "language",
                "value": "XPath"
            }, {
                "name": "version",
                "value": "1.0"
            }, {
                "name": "engine",
                "value": "https://www.npmjs.com/package/xpath"
            }]
        },
        "exercise": "be3bf258-895f-4f5b-bbe9-b716d75f4261",
        "compilationErrors": ["{\"0\":\"incorrect xpath expression\"}", "{\"1\":\"incorrect xpath expression\"}"]
    }
})