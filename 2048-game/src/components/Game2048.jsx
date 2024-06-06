"use client"
import React, { useState, useEffect, useRef } from 'react';
import styles from './Game2048.module.css';

const Game2048 = () => {
  const [board, setBoard] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const successAcknowledged = useRef(false);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    initializeGame();
  }, []);

  const saveHighScore = (score) => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('highScore', score);
    }
  };

  const addRandomNumber = (board) => {
    const emptyCells = [];
    board.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (cell === 0) {
          emptyCells.push({ row: rowIndex, col: cellIndex });
        }
      });
    });

    if (emptyCells.length === 0) return board;

    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];
    const newNumber = Math.random() < 0.9 ? 2 : 4;

    const newBoard = board.map((boardRow, rowIndex) =>
      boardRow.map((cell, cellIndex) =>
        rowIndex === row && cellIndex === col ? newNumber : cell
      )
    );

    return newBoard;
  };

  const initializeGame = () => {
    let newBoard = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const initialNumbers = Math.floor(Math.random() * 3) + 1; // 1에서 3 사이의 숫자
    for (let i = 0; i < initialNumbers; i++) {
      newBoard = addRandomNumber(newBoard);
    }
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setGameSuccess(false);
    successAcknowledged.current = false;
  };

  const checkFor2048 = (board) => {
    for (let row of board) {
      if (row.includes(2048) && !successAcknowledged.current) {
        setGameSuccess(true);
        successAcknowledged.current = true;
        return true;
      }
    }
    return false;
  };

  const moveLeft = (board) => {
    let newScore = score;
    const newBoard = board.map((row) => {
      const newRow = row.filter(cell => cell !== 0);
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          newScore += newRow[i];
          newRow[i + 1] = 0;
        }
      }
      const filteredRow = newRow.filter(cell => cell !== 0);
      return [...filteredRow, ...Array(4 - filteredRow.length).fill(0)];
    });
    setScore(newScore);
    saveHighScore(newScore);
    checkFor2048(newBoard);
    return newBoard;
  };

  const transpose = (board) => {
    return board[0].map((_, colIndex) => board.map(row => row[colIndex]));
  };

  const moveRight = (board) => {
    let newScore = score;
    const newBoard = board.map((row) => {
      const newRow = row.filter(cell => cell !== 0);
      for (let i = newRow.length - 1; i > 0; i--) {
        if (newRow[i] === newRow[i - 1]) {
          newRow[i] *= 2;
          newScore += newRow[i];
          newRow[i - 1] = 0;
        }
      }
      const filteredRow = newRow.filter(cell => cell !== 0);
      return [...Array(4 - filteredRow.length).fill(0), ...filteredRow];
    });
    setScore(newScore);
    saveHighScore(newScore);
    checkFor2048(newBoard);
    return newBoard;
  };

  const moveUp = (board) => {
    const transposedBoard = transpose(board);
    const movedBoard = moveLeft(transposedBoard);
    return transpose(movedBoard);
  };

  const moveDown = (board) => {
    const transposedBoard = transpose(board);
    const movedBoard = moveRight(transposedBoard);
    return transpose(movedBoard);
  };

  const isGameOver = (board) => {
    const canMove = (board) => {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (board[row][col] === 0) return true;
          if (col < 3 && board[row][col] === board[row][col + 1]) return true;
          if (row < 3 && board[row][col] === board[row + 1][col]) return true;
        }
      }
      return false;
    };
    if (!canMove(board)) {
      setGameOver(true);
    }
  };

  const handleKeyDown = (event) => {
    if (gameOver || gameSuccess) return;

    let newBoard;
    switch (event.key) {
      case 'ArrowLeft':
        newBoard = moveLeft(board);
        break;
      case 'ArrowRight':
        newBoard = moveRight(board);
        break;
      case 'ArrowUp':
        newBoard = moveUp(board);
        break;
      case 'ArrowDown':
        newBoard = moveDown(board);
        break;
      default:
        return;
    }
    if (JSON.stringify(newBoard) !== JSON.stringify(board)) {
      const updatedBoard = addRandomNumber(newBoard);
      setBoard(updatedBoard);
      isGameOver(updatedBoard);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board, gameOver, gameSuccess]);

  return (
    <div>
      <div className={styles.header}>
        <div style={{display:"flex"}}>
          <div className={styles.title}>2048</div>
          <div className={styles.scores}>
            <div className={styles.scoreBox}>
              <div className="label">Score</div>
              <div>{score}</div>
            </div>
            <div className={styles.scoreBox}>
              <div className="label">Best</div>
              <div>{highScore}</div>
            </div>
          </div>
        </div>
        <button onClick={initializeGame} className={styles.newGameButton}>New Game</button>
      </div>
      <div className={styles.gameContainer}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className={`${styles.cell} ${cell !== 0 ? styles[`cell-${cell}`] : ''}`}>
                {cell !== 0 && cell}
              </div>
            ))}
          </div>
        ))}
        {gameOver && (
          <div className={styles.gameOver}>
            <div>Game Over</div>
            <button onClick={initializeGame} className={styles.retryButton}>Retry</button>
          </div>
        )}
        {gameSuccess && (
          <div className={styles.gameSuccess}>
            <div>Congratulations! You made 2048!</div>
            <button onClick={initializeGame} className={styles.newGameSuccessButton}>New Game</button>
            <button onClick={() => setGameSuccess(false)} className={styles.continueButton}>Continue</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game2048;
