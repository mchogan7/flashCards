var fs = require("fs");
var questions = require("./questions.json");
var inquirer = require("inquirer");

var iterate = 0
var score = 0

userInput()

//User input for initial flow.
function userInput() {
    inquirer.prompt([{
        type: "list",
        message: "Welcome! Please pick one.",
        choices: ["Take Dino Quiz", "Take User Created Quiz", "Create Quiz"],
        name: "userChoice"
    }]).then(function(response) {
        if (response.userChoice === 'Take Dino Quiz') {
            displayQuestions(questions.default)
        } else if (response.userChoice === 'Take User Created Quiz') {
        	//Checks to see if there are any user generated questions.
            if (questions.user.length > 0) {
                displayQuestions(questions.user)
            } else {
                console.log('----------------')
                console.log('Sorry, no questions have been made. Make some yourself')
                console.log('----------------')
                userInput();
            }
        } else {
            createQuiz()
        }
    })
}

function createQuiz() {
    inquirer.prompt([{
        name: "question",
        message: "Enter your question (use '...' for a cloze question)"
    }, {
        name: "answer",
        message: "What is the answer?"
    }, {
        type: "list",
        message: "----------------",
        choices: ["Create Another Question", "Take User Created Quiz"],
        name: "userQuizChoice"
    }]).then(function(response) {
    	//check if it is a cloze question and writes to appropriate spot.
        if (response.question.indexOf('...') === -1) {
            writeBasic(response.question, response.answer)
        } else {
            writeCloze(response.question, response.answer)
        }
        //Sends the user to make more questions or to take user quiz.
        if (response.userQuizChoice === "Create Another Question") {
            createQuiz();
        } else {
            displayQuestions(questions.user)
        }
    })

}

//Function that creates a new Basic flash card and writes it to the JSON file.
function writeBasic(userQuestion, userAnswer) {
    questions.user[questions.user.length] = new basicCard(userQuestion, userAnswer);
    fs.writeFile('questions.json', JSON.stringify(questions), function(err) {
        if (err) {
            console.log(err);
        }
    });
}

//Function that creates a new Cloze flash card and writes it to the JSON file.
function writeCloze(userQuestion, userAnswer) {
    questions.user[questions.user.length] = new clozeCard(userQuestion, userAnswer);
    fs.writeFile('questions.json', JSON.stringify(questions), function(err) {
        if (err) {
            console.log(err);
        }
    });
}

//Cloze Card Constructor
function clozeCard(clozeText, clozeAnswer) {
    this.question = clozeText,
        this.answer = clozeAnswer
    this.fullText = this.question.replace("...", this.answer)
}

//Basic Card Constructor
function basicCard(question, answer) {
    this.question = question,
        this.answer = answer
}

//Main question and Answer Logic
function displayQuestions(typeOfCard) {
    if (iterate < typeOfCard.length) {

        console.log(typeOfCard.length - iterate + ' questions left')
        console.log('----------------')

        inquirer.prompt([{
            name: "answer",
            message: typeOfCard[iterate].question
        }]).then(function(response) {
            if (response.answer === typeOfCard[iterate].answer) {
                console.log('Correct!')
                console.log('----------------')
                score++
            } else {
                console.log('Wrong! The correct answer is ' + typeOfCard[iterate].answer)
                console.log('----------------')
            }
            iterate++;
            displayQuestions(typeOfCard);
        });
    } else {
        console.log('You got ' + score + ' out of ' + typeOfCard.length + ' questions correct!');
        console.log('----------------')

        inquirer.prompt([{
            type: "list",
            message: "Play Again?",
            choices: ["Yes", "No"],
            name: "userChoice"
        }]).then(function(response) {
            if (response.userChoice === 'Yes') {
                score = 0
                iterate = 0
                userInput()
            } else {
                console.log('Thanks for playing!')
            }
        })
    }
};
