import { NOT_ANSWERED, CORRECT, WRONG, PASAPALABRA, END, TIMEOUT } from './pasapalabra.js';
import { Player } from './pasapalabra.js';
import { baseQuestions, alterQuestions1, philosophyQuestions } from './questions.js';

const allAlterQuestions = [...alterQuestions1, ...philosophyQuestions];

class PlayerWeb extends Player {
  constructor (name, secondsToComplete, baseQ, alterQ, excludeQ, idHTML) {
    super(name, secondsToComplete, baseQ, alterQ, excludeQ);
    this.idHTML = idHTML;
  }

  static convertLetter(letter) {
    return (letter !== 'ñ' ? letter : 'nh').toLowerCase();
  }

  changeBgLetter(letter, bgColor) {
    const id = `letter-${this.idHTML}-${PlayerWeb.convertLetter(letter)}`;
    document.getElementById(id).style = `background-color: ${bgColor};`
  }

  changeTimer() {
    document.getElementById(`timer-${this.idHTML}`).innerHTML = this.secondsRemaining().toString();   
  }

  startTimer() {
    super.startTimer();
    this.interval = setInterval(() => player1.changeTimer(),200);
  }

  stopTimer() {
    super.stopTimer();
    clearInterval(this.interval);
  }

  roscoHTML() {
    let result = `
      <header>${this.name}</header>
      <span class="timer" id="timer-${this.idHTML}">${this.secondsRemaining()}</span>
      <div class="donut">`;
    for (let i = 0; i < this.questions.length; i++) {
      const letter = PlayerWeb.convertLetter(this.questions[i].letter);
      result += `<div class="letter" id="letter-${this.idHTML}-${letter}">${this.questions[i].letter.toUpperCase()}</div>`
    }
    result += '</div>';
    return result;
  }
}

const player1 = new PlayerWeb(
  "Pablo",
  60,
  baseQuestions,
  allAlterQuestions,
  [], // Exclude questions
  'player1', // idHTML
);
const player2 = new PlayerWeb(
  "Jaime",
  60,
  baseQuestions,
  allAlterQuestions,
  player1.questions, // Exclude questions
  'player2', // idHTML
);
const players = [player1, player2];

let inTurn = Math.floor(Math.random() * 2);
const otherPlayerIndex = () => (inTurn === 0 ? 1 : 0);
const playerInTurn = () => players[inTurn];
const playerWaiting = () => players[otherPlayerIndex()];
const gameFinished = () => playerInTurn().isConceded()
  || playerWaiting().isConceded()
  || (playerInTurn().isFinished() && playerWaiting().isFinished());

document.getElementById('player1').innerHTML = player1.roscoHTML();
document.getElementById('player2').innerHTML = player2.roscoHTML();
player1.changeBgLetter('a', 'green');
player2.changeBgLetter('b', 'red');
player1.startTimer();

