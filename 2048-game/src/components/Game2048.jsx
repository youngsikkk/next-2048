"use client"
import React, { useState, useEffect, useRef } from 'react';
import isEqual from 'lodash/isEqual';
import styles from './Game2048.module.css';

const Game2048 = () => {
  const [boardSize, setBoardSize] = useState(4); // 추가된 상태 변수
  const [board, setBoard] = useState([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [scoreDelta, setScoreDelta] = useState(0);
  const [showScoreDelta, setShowScoreDelta] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameSuccess, setGameSuccess] = useState(false);
  const successAcknowledged = useRef(false);

  useEffect(() => {
    const savedHighScore = localStorage.getItem('highScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    initializeGame(boardSize);
  }, [boardSize]);

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

  const initializeGame = (size) => {
    let newBoard = Array(size).fill().map(() => Array(size).fill(0));
    const initialNumbers = Math.floor(Math.random() * 3) + 1; // 1에서 3 사이의 숫자
    for (let i = 0; i < initialNumbers; i++) {
      newBoard = addRandomNumber(newBoard);
    }
    setBoard(newBoard);
    setScore(0);
    setScoreDelta(0); // 초기화
    setShowScoreDelta(false); // 초기화
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
    let delta = 0; // 새로운 변수로 점수 차이를 추적합니다.
    const newBoard = board.map((row) => {
      const newRow = row.filter(cell => cell !== 0);
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          delta += newRow[i]; // 점수 차이에 더합니다.
          newScore += newRow[i];
          newRow[i + 1] = 0;
        }
      }
      const filteredRow = newRow.filter(cell => cell !== 0);
      return [...filteredRow, ...Array(boardSize - filteredRow.length).fill(0)];
    });
    setScore(newScore);
    setScoreDelta(delta); // 상태 업데이트
    if (delta !== 0) {
      setShowScoreDelta(true); // 점수 변화 애니메이션 상태 업데이트
    }
    saveHighScore(newScore);
    checkFor2048(newBoard);
    return newBoard;
  };

  const transpose = (board) => {
    return board[0].map((_, colIndex) => board.map(row => row[colIndex]));
  };

  const moveRight = (board) => {
    let newScore = score;
    let delta = 0; // 새로운 변수로 점수 차이를 추적합니다.
    const newBoard = board.map((row) => {
      const newRow = row.filter(cell => cell !== 0);
      for (let i = newRow.length - 1; i > 0; i--) {
        if (newRow[i] === newRow[i - 1]) {
          newRow[i] *= 2;
          delta += newRow[i]; // 점수 차이에 더합니다.
          newScore += newRow[i];
          newRow[i - 1] = 0;
        }
      }
      const filteredRow = newRow.filter(cell => cell !== 0);
      return [...Array(boardSize - filteredRow.length).fill(0), ...filteredRow];
    });
    setScore(newScore);
    setScoreDelta(delta); // 상태 업데이트
    if (delta !== 0) {
      setShowScoreDelta(true); // 점수 변화 애니메이션 상태 업데이트
    }
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
      for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
          if (board[row][col] === 0) return true;
          if (col < boardSize - 1 && board[row][col] === board[row][col + 1]) return true;
          if (row < boardSize - 1 && board[row][col] === board[row + 1][col]) return true;
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
        event.preventDefault();
        newBoard = moveLeft(board);
        break;
      case 'ArrowRight':
        event.preventDefault();
        newBoard = moveRight(board);
        break;
      case 'ArrowUp':
        event.preventDefault();
        newBoard = moveUp(board);
        break;
      case 'ArrowDown':
        event.preventDefault();
        newBoard = moveDown(board);
        break;
      default:
        return;
    }
    if (!isEqual(newBoard, board)) {
      const updatedBoard = addRandomNumber(newBoard);
      setBoard(updatedBoard);
      isGameOver(updatedBoard);
    }
  };

  useEffect(() => {
    if (showScoreDelta) {
      const timer = setTimeout(() => {
        setShowScoreDelta(false);
      }, 1000); // 2초 후에 애니메이션을 숨깁니다.
      return () => clearTimeout(timer);
    }
  }, [showScoreDelta]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board, gameOver, gameSuccess]);

  return (
    <div>
      <div className={styles.header}>
        <div style={{display:"flex", position: "relative"}}>
          <div className={styles.title}>2048</div>
          <div className={styles.scores}>
            <div className={styles.scoreBox}>
              <div className="label">Score</div>
              <div>
                {scoreDelta !== 0 && showScoreDelta && (
                  <span className={styles.scoreDelta}>+{scoreDelta}</span>
                )}
              </div>
              <div>
                {score}
              </div>
            </div>
            <div className={styles.scoreBox}>
              <div className="label">Best</div>
              <div>{highScore}</div>
            </div>
          </div>
        </div>
        <button onClick={() => initializeGame(boardSize)} className={styles.newGameButton}>New Game</button>
        <select onChange={(e) => setBoardSize(parseInt(e.target.value))} value={boardSize} className={styles.sizeSelector}>
          <option value={4}>4x4</option>
          <option value={5}>5x5</option>
          <option value={6}>6x6</option>
          <option value={7}>7x7</option>
          <option value={8}>8x8</option>
        </select>
      </div>
      <div className={styles.gameContainer} style={{ 
        gridTemplateColumns: `repeat(${boardSize}, 80px)`,
        gridTemplateRows: `repeat(${boardSize}, 80px)`
      }}>
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
            <button onClick={() => initializeGame(boardSize)} className={styles.retryButton}>Retry</button>
          </div>
        )}
        {gameSuccess && (
          <div className={styles.gameSuccess}>
            <div>Congratulations! You made 2048!</div>
            <button onClick={() => initializeGame(boardSize)} className={styles.newGameSuccessButton}>New Game</button>
            <button onClick={() => setGameSuccess(false)} className={styles.continueButton}>Continue</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game2048;
