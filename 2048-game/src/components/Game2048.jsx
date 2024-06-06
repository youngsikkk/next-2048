"use client"
import React, { useState, useEffect } from 'react';
import styles from './Game2048.module.css';

const Game2048 = () => {
  const [board, setBoard] = useState([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

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

  const handleKeyDown = (event) => {
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
      setBoard(addRandomNumber(newBoard));
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board]);

  return (
    <>
      <div>
        <div className={styles.highScore}>High Score: {highScore}</div>
        <div className={styles.score}>Score: {score}</div>
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
      </div>
    </>
  );
};

export default Game2048;

