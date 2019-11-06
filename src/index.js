import _ from 'lodash';
import ship from './lib/ship';
import gameBoard from './lib/gameBoard';
import player from './lib/player';
import userInterface from './display';

const mainInterface = (() => {
  const human = player('Human');
  const ai = player('Computer');
  let turn;
  let myBoard;
  let opponentBoard;

  const opponentShips = {
    carrier: ship(5),
    battleship: ship(4),
    cruiser: ship(3),
    submarine: ship(3),
    destroyer: ship(2),
  };

  const myShips = {
    carrier: ship(5),
    battleship: ship(4),
    cruiser: ship(3),
    submarine: ship(3),
    destroyer: ship(2),
  };

  const locateShips = (ships, board) => {
    Object.values(ships).forEach((ship) => {
      ship.revokeStatus();
      board.placeShip(ship);
    });
  };

  const reset = (initial) => {
    turn = human;
    opponentBoard = gameBoard(Object.values(opponentShips));
    myBoard = gameBoard(Object.values(myShips));
    locateShips(opponentShips, opponentBoard);
    locateShips(myShips, myBoard);

    if (initial) {
      userInterface.createBoard(opponentBoard.board, 'human');
      userInterface.createBoard(myBoard.board, 'computer');
      userInterface.createClickBoard(humanPlay);
    }
    userInterface.hideWinner();
    userInterface.clearBoard();
  };

  const afterPlay = ({ row, col, computer }) => {
    let button;
    let hit;
    if (computer) {
      button = userInterface.getComputerBlock(row, col);
      hit = myBoard.receiveAttack(row, col);
    } else {
      button = userInterface.getHumanBlock(row, col);
      hit = opponentBoard.receiveAttack(row, col);
    }
    userInterface.changeButton(button, hit);
    if (hit && hit.sunk) {
      hit.sunk.forEach((coord) => {
        userInterface.changeButtonSunk(coord, computer);
      });
    }
    gamePlay(hit);
  };

  const computerPlay = () => {
    const spots = myBoard.getAvailableSpots();
    const index = _.random(0, spots.length - 1);
    const [row, col] = spots[index];
    afterPlay({ row, col, computer: true });
  };

  const humanPlay = ({ row, col }) => {
    afterPlay({ row, col });
  };

  const gamePlay = (hit) => {
    if (opponentBoard.isAllSunk() || myBoard.isAllSunk()) {
      userInterface.revealWinner(turn);
      userInterface.blockCellClicks();
    } else if (turn === human && !hit) {
      turn = ai;
      computerPlay();
    } else if (turn === ai && hit) {
      computerPlay();
    } else if (turn === ai && !hit) {
      turn = human;
    }
  };

  const setInit = () => {
    reset(1);
    userInterface.eventResetBoard(reset);
  };

  return { setInit };
})();

mainInterface.setInit();

export default mainInterface;
