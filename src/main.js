import { NOT_ANSWERED, CORRECT, WRONG, PASAPALABRA, END, TIMEOUT } from './pasapalabra.js';
import { Player } from './pasapalabra.js';
import { baseQuestions, alterQuestions1, philosophyQuestions } from './questions.js';

const colors = {  
  primary: '#2780E3',
  secondary: '#373a3c',
  success:'#3FB618',
  info:'#9954BB',
  warning:'#FF7518',
  danger:'#FF0039',
  light:'#f8f9fa',
  dark:'#373a3c',
}
const allAlterQuestions = [...alterQuestions1, ...philosophyQuestions];

class PlayerWeb extends Player {
  constructor (name, secondsToComplete, baseQ, alterQ, excludeQ, idHTML, answering, colors) {
    super(name, secondsToComplete, baseQ, alterQ, excludeQ);
    this.idHTML = idHTML;
    this.answering = answering;
    this.colors = colors;
  }

  static convertLetter(letter) {
    return (letter !== 'ñ' ? letter : 'nh').toLowerCase();
  }

  activatePlayer() {
    const id = `letter-${this.idHTML}-${PlayerWeb.convertLetter(this.getLetter())}`;
    document.getElementById(id).style.animationIterationCount = "infinite";
    document.getElementById(`timer-${this.idHTML}`).style = `background-color: ${this.colors.primary}; color: white;`;
    document.getElementById(`name-${this.idHTML}`).style = `background-color: ${this.colors.primary}; color: white;`;
  }

  changeTimer() {
    document.getElementById(`timer-${this.idHTML}`).innerHTML = this.secondsRemaining().toString() + '"';
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

  updateLetterColors() {
    document.getElementById(`timer-${this.idHTML}`).style = "";
    document.getElementById(`name-${this.idHTML}`).style = "";
    this.questions.forEach(item => {
      const circle = document.getElementById(`letter-${this.idHTML}-${PlayerWeb.convertLetter(item.letter.toLowerCase())}`)
      switch (item.status){
        case TIMEOUT:
        case NOT_ANSWERED:
        case PASAPALABRA:
          circle.style = `background-color: ${this.colors.primary}; animation-iteration: 0;`
          break;
        case CORRECT:
          circle.style =  `background-color: ${this.colors.success};`;
          break;
        case WRONG:
        case END:
          circle.style = `background-color: ${this.colors.danger};`;
          break;
      }
    })
  }
}

// HTML Tags
const tagQuestionContainer = document.getElementById("question-container");
const tagQuestionLetterText = document.getElementById("question-letter-text");
const tagQuestionText = document.getElementById("question-text");
const tagAnswerText = document.getElementById("answer-text");
const tagAnswerControlContainer = document.getElementById("answer-control-container");
const tagConfirmTitle = document.getElementById("confirm-title");
const tagConfirmText = document.getElementById("confirm-text");
const tagConfirmWait = document.getElementById("confirm-card");

// auxiliary functions
function confirmWaitDisplay () {
  tagQuestionContainer.hidden = true;
  tagConfirmTitle.innerHTML = `Cambio de turno`
  tagConfirmText.innerHTML = `¿${playerInTurn().name} preparado para continuar?`
  tagConfirmWait.hidden = false;
  document.getElementById("confirm-wait-yes").focus();
}
function answeringDisplay () {
  tagQuestionContainer.hidden = false;
  tagAnswerControlContainer.hidden = false
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
  colors,  // color squema
  );
  const player2 = new PlayerWeb(
  "Jaime",
  60,
  baseQuestions,
  allAlterQuestions,
  player1.questions, // Exclude questions
  'player2', // idHTML
  answering, // answering function
  colors,  // color squema
  );
const players = [player1, player2];

let inTurn = Math.floor(Math.random() * 2);
const otherPlayerIndex = () => (inTurn === 0 ? 1 : 0);
const playerInTurn = () => players[inTurn];
const playerWaiting = () => players[otherPlayerIndex()];
const gameFinished = () => playerInTurn().isConceded()
|| playerWaiting().isConceded()
|| (playerInTurn().isFinished() && playerWaiting().isFinished());

function pasapalabra(infoPlayer1, infoPlayer2 ) {
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
  tagConfirmTitle.innerHTML = `EMPIEZA PASAPALABRA`;

  let text = `<p>Bienvenidos ${players[0].name} y ${players[1].name}</p>`;
  text += `<p>En el sorteo ha salido que empiece ${playerInTurn().name}</p>`;
  text += `<p>¿Estás listo?</p>`;
  tagConfirmText.innerHTML = text;

  document.getElementById('name-player1').innerHTML = player1.name;
  document.getElementById('timer-player1').innerHTML = player1.secondsRemaining() + '"';
  document.getElementById('name-player2').innerHTML = player2.name;
  document.getElementById('timer-player2').innerHTML = player2.secondsRemaining() + '"';

  player1.updateLetterColors();
}

pasapalabra();