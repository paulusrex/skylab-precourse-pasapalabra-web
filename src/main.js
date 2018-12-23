import { NOT_ANSWERED, CORRECT, WRONG, PASAPALABRA, END, TIMEOUT } from './pasapalabra.js';
import { Player } from './pasapalabra.js';
import { baseQuestions, alterQuestions1, philosophyQuestions } from './questions.js';

const allAlterQuestions = [...alterQuestions1, ...philosophyQuestions];

class PlayerWeb extends Player {
  constructor (name, secondsToComplete, baseQ, alterQ, excludeQ, idHTML, answering) {
    super(name, secondsToComplete, baseQ, alterQ, excludeQ);
    this.idHTML = idHTML;
    this.answering = answering;
  }

  static convertLetter(letter) {
    return (letter !== 'ñ' ? letter : 'nh').toLowerCase();
  }

  changeBgLetter(letter, bgColor) {
    const id = `letter-${this.idHTML}-${PlayerWeb.convertLetter(letter)}`;
    document.getElementById(id).style = `background-color: ${bgColor};`
  }

  activatePlayer() {
    const id = `letter-${this.idHTML}-${PlayerWeb.convertLetter(this.getLetter())}`;
    document.getElementById(id).style.animationIterationCount = "infinite";
    document.getElementById(`timer-${this.idHTML}`).style = "background-color: blue; color: white;";
    document.getElementById(`name-${this.idHTML}`).style = "background-color: blue; color: white;";
  }

  changeTimer() {
    document.getElementById(`timer-${this.idHTML}`).innerHTML = this.secondsRemaining().toString();
    if (this.timeRemaining() < 0) {
      clearInterval(this.interval);
      this.answering(
        true // timeout
         );
    }
  }

  startTimer() {
    super.startTimer();
    this.interval = setInterval(() => this.changeTimer(),200);
  }

  stopTimer() {
    super.stopTimer();
    clearInterval(this.interval);
  }

  roscoHTML() {
    let result = `
      <header id="name-${this.idHTML}">${this.name}</header>
      <span class="timer" id="timer-${this.idHTML}">${this.secondsRemaining()}</span>
      <div class="donut">`;
    for (let i = 0; i < this.questions.length; i++) {
      const letter = PlayerWeb.convertLetter(this.questions[i].letter);
      result += `<div class="letter" id="letter-${this.idHTML}-${letter}">${this.questions[i].letter.toUpperCase()}</div>`
    }
    result += '</div>';
    return result;
  }

  updateLetterColors() {
    document.getElementById(`timer-${this.idHTML}`).style = "";
    document.getElementById(`name-${this.idHTML}`).style = "";
    this.questions.forEach(item => {
      const circle = document.getElementById(`letter-${this.idHTML}-${PlayerWeb.convertLetter(item.letter.toLowerCase())}`)
      switch (item.status){
        case TIMEOUT:
        case NOT_ANSWERED:
        case PASAPALABRA:
          circle.style = "background-color: blue; animation-iteration: 0;"
          break;
        case CORRECT:
          circle.style = "background-color: green;"
          break;
        case WRONG:
        case END:
          circle.style = "background-color: red;"
          break;
      }
    })
  }
}

// HTML Tags
const tagQuestionLetterCircle = document.getElementById("question-letter-circle");
const tagQuestionLetterText = document.getElementById("question-letter-text");
const tagQuestionText = document.getElementById("question-text");
const tagAnswerText = document.getElementById("answer-text");
const tagAnswerControlContainer = document.getElementById("answer-control-container");
const tagConfirmWait = document.getElementById("confirm-wait");

// auxiliary functions
function confirmWaitDisplay () {
  tagQuestionText.innerHTML = `¿${playerInTurn().name} preparado para continuar?`
  tagQuestionLetterCircle.hidden = true;
  tagAnswerText.hidden = true;
  tagAnswerControlContainer.hidden = true;
  tagConfirmWait.hidden = false;
  document.getElementById("confirm-wait-yes").focus();
}
function answeringDisplay () {
  tagQuestionLetterCircle.hidden = false;
  tagAnswerText.hidden = false;
  tagAnswerControlContainer.hidden = false;
  tagConfirmWait.hidden = true;
}

function confirmContinue () {
  answeringDisplay();
  playerInTurn().startTimer();
  displayNextQuestion();
}

function displayNextQuestion () {
  tagQuestionLetterText.innerHTML = playerInTurn().getLetter().toUpperCase();
  tagQuestionText.innerHTML = playerInTurn().getQuestion();  
  tagAnswerText.value = "";
  playerInTurn().activatePlayer();
  tagAnswerText.focus();
}

function answering (timeout) {
  const answer = timeout ? 'timeout' : document.getElementById("answer-text").value;
  let changePlayer = false;
  playerInTurn().checkAnswer(answer);
  switch (playerInTurn().getStatus()) {
    case WRONG:
      tagQuestionText.innerHTML = `No! la respuesta correcta es ${playerInTurn().getAnswer()}`;
      playerInTurn().nextQuestion();
      playerInTurn().updateLetterColors();
      if (!playerWaiting().isFinished()) {
        changePlayer = true;
      } else {
        displayNextQuestion();
      }
      break;
    case CORRECT:
      if (playerInTurn().isCompleted()) {
        changePlayer = true;
      }
      playerInTurn().nextQuestion();
      playerInTurn().updateLetterColors();
      displayNextQuestion();    
      break;
    case PASAPALABRA:
      tagQuestionText.innerHTML = `${playerInTurn().name} pasapalabra`;
      playerInTurn().nextQuestion();
      playerInTurn().updateLetterColors();
      if (!playerWaiting().isFinished()) {
        changePlayer = true;
      } else {
        displayNextQuestion();
      }

      break;
    case TIMEOUT:
    case END:
      console.log('timeout');
      changePlayer = true;
      playerInTurn().updateLetterColors();
      break;
    default:
      break;
  }  
  if (changePlayer) {    
    playerInTurn().stopTimer();    
    tagAnswerControlContainer.hidden = true;
    if (gameFinished()) {

    } else {
      setTimeout (confirmWaitDisplay, 3000);
      inTurn = otherPlayerIndex();
    }
  }
}


const player1 = new PlayerWeb(
  "Pablo",
  15,
  baseQuestions,
  allAlterQuestions,
  [], // Exclude questions
  'player1', // idHTML
  answering, // answering function
);
const player2 = new PlayerWeb(
  "Jaime",
  60,
  baseQuestions,
  allAlterQuestions,
  player1.questions, // Exclude questions
  'player2', // idHTML
  answering, // answering function
);
const players = [player1, player2];

let inTurn = Math.floor(Math.random() * 2);
const otherPlayerIndex = () => (inTurn === 0 ? 1 : 0);
const playerInTurn = () => players[inTurn];
const playerWaiting = () => players[otherPlayerIndex()];
const gameFinished = () => playerInTurn().isConceded()
  || playerWaiting().isConceded()
  || (playerInTurn().isFinished() && playerWaiting().isFinished());

// onclick assign
document.getElementById("confirm-wait-yes").onclick = confirmContinue;
document.getElementById("answer-send").onclick = answering;
document.getElementById("answer-text").onkeypress = (event) => {
  if (event.charCode === 13 && !tagAnswerControlContainer.hidden) {
    answering();
  }
}
document.getElementById("answer-pasapalabra").onclick = () => {
  document.getElementById("answer-text").value = "pasapalabra";
  answering();
}
document.getElementById('answer-end').onclick = () => {
  document.getElementById("answer-text").value = "end";
  answering();
}

confirmWaitDisplay();

let text = `<p>Bienvenidos ${players[0].name} y ${players[1].name}</p>`;
text += `<p>En el sorteo ha salido que empiece ${playerInTurn().name}</p>`;
text += '<p>Comienza pasapalabra!</p>';
tagQuestionText.innerHTML = text;

document.getElementById('name-player1').innerHTML = player1.name;
document.getElementById('timer-player1').innerHTML = player1.secondsRemaining();
document.getElementById('name-player2').innerHTML = player2.name;
document.getElementById('timer-player2').innerHTML = player2.secondsRemaining();

player1.updateLetterColors();
