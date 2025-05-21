import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameLogic } from './hooks/useGameLogic';
import PlayerUI from './components/PlayerUI';
import ControlsGuide from './components/ControlsGuide';
import GameOverModal from './components/GameOverModal';
import { PLAYER_1_CONTROLS, PLAYER_2_CONTROLS } from './constants';
import { AppStage, PlayerState } from './types';
import socketService from './utils/socketService';
import OpponentGameView from './components/OpponentGameView';

function generateUniqueLobbyId(): string {
  return Math.random().toString(36).substring(2, 8);
}

const App: React.FC = () => {
  const [appStage, setAppStage] = useState<AppStage>('INIT_PLAYER1_NAME'); 
  const [player1Name, setPlayer1Name] = useState<string>('');
  const [player2Name, setPlayer2Name] = useState<string>('');
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [currentStageKey, setCurrentStageKey] = useState(Date.now()); 

  const [p1PropIncomingGarbage, setP1PropIncomingGarbage] = useState(0);
  const [p2PropIncomingGarbage, setP2PropIncomingGarbage] = useState(0);

  const [isHost, setIsHost] = useState<boolean>(true);
  const [opponentGameState, setOpponentGameState] = useState<PlayerState | null>(null);
  const [opponentConnected, setOpponentConnected] = useState<boolean>(false);

  useEffect(() => {
    const parseHash = () => {
      if (window.location.hash.startsWith('#game=')) {
        const params = new URLSearchParams(window.location.hash.substring(1)); 
        const gameIdFromHash = params.get('game');
        const p1NameFromHash = params.get('p1');

        if (gameIdFromHash && p1NameFromHash && appStage !== 'PLAYING' && appStage !== 'GAME_OVER_STATE') {
          setLobbyId(gameIdFromHash);
          setPlayer1Name(decodeURIComponent(p1NameFromHash));
          setAppStage('INIT_PLAYER2_NAME_JOIN'); 
          setCurrentStageKey(Date.now());
          setIsHost(false);
        }
      }
    };
    
    parseHash(); 

    window.addEventListener('hashchange', parseHash, false);
    return () => {
      window.removeEventListener('hashchange', parseHash, false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  useEffect(() => {
    if ((appStage === 'INIT_PLAYER1_NAME' || appStage === 'INIT_PLAYER2_NAME_JOIN') && nameInputRef.current) {
        nameInputRef.current.focus();
    }
    setCurrentStageKey(Date.now()); 
  }, [appStage]);

  const player1Logic = useGameLogic({
    onSendGarbage: (lines) => setP2PropIncomingGarbage(prev => prev + lines),
    initialIncomingGarbage: p1PropIncomingGarbage,
    clearInitialIncomingGarbage: () => setP1PropIncomingGarbage(0),
    isGameActive: appStage === 'PLAYING',
  });

  const player2Logic = useGameLogic({
    onSendGarbage: (lines) => setP1PropIncomingGarbage(prev => prev + lines),
    initialIncomingGarbage: p2PropIncomingGarbage,
    clearInitialIncomingGarbage: () => setP2PropIncomingGarbage(0),
    isGameActive: appStage === 'PLAYING',
  });

  useEffect(() => {
    const p1GameOver = player1Logic.playerState.isGameOver;
    const p2GameOver = player2Logic.playerState.isGameOver;

    if ((p1GameOver || p2GameOver) && appStage === 'PLAYING') {
      setAppStage('GAME_OVER_STATE'); 
      setCurrentStageKey(Date.now());

      const p1Score = player1Logic.playerState.score;
      const p2Score = player2Logic.playerState.score;

      if (p1GameOver && !p2GameOver) {
        setWinnerName(player2Name || "Player 2");
      } else if (p2GameOver && !p1GameOver) {
        setWinnerName(player1Name || "Player 1");
      } else { 
        if (p1Score > p2Score) {
          setWinnerName(player1Name || "Player 1");
        } else if (p2Score > p1Score) {
          setWinnerName(player2Name || "Player 2");
        } else {
          setWinnerName("It's a Draw!");
        }
      }
    }
  }, [
    player1Logic.playerState.isGameOver, 
    player2Logic.playerState.isGameOver,
    player1Logic.playerState.score, 
    player2Logic.playerState.score,
    appStage, 
    player1Name, 
    player2Name
  ]);
  

  useEffect(() => {}, [p1PropIncomingGarbage]);
  useEffect(() => {}, [p2PropIncomingGarbage]);


  const handleP1NameSubmit = (name: string) => {
    if (name.trim()) {
      const newP1Name = name.trim();
      setPlayer1Name(newP1Name);
      const newLobbyId = generateUniqueLobbyId();
      setLobbyId(newLobbyId);
      
      window.location.hash = `game=${newLobbyId}&p1=${encodeURIComponent(newP1Name)}`;
      
      setAppStage('LOBBY_AWAITING_PLAYER2');
      
      if (newLobbyId) {
        setIsHost(true);
        socketService.connect(newLobbyId, newP1Name, true);
      }
    }
  };

  const handleP2NameSubmit = (name: string) => {
    if (name.trim() && player1Name && lobbyId) { 
      const newP2Name = name.trim();
      setPlayer2Name(newP2Name);
      setAppStage('READY_TO_START'); 
      
      socketService.connect(lobbyId, newP2Name, false);
      socketService.sendPlayerReady();
    }
  };
  
  const triggerActualGameStart = () => {
    setWinnerName(null);
    setP1PropIncomingGarbage(0); 
    setP2PropIncomingGarbage(0);
    
    player1Logic.resetPlayerState(); 
    player2Logic.resetPlayerState(); 
    
    setAppStage('PLAYING');
    
    if (isHost) {
      socketService.sendPlayerReady();
    }
  };
  
  const restartGame = () => {
    setPlayer1Name('');
    setPlayer2Name('');
    setLobbyId(null);
    setWinnerName(null);
    
    setP1PropIncomingGarbage(0);
    setP2PropIncomingGarbage(0);
    
    socketService.disconnect();
    setOpponentGameState(null);
    setOpponentConnected(false);

    player1Logic.resetPlayerState(); 
    player2Logic.resetPlayerState();

    window.location.hash = ''; 
    setAppStage('INIT_PLAYER1_NAME'); 
  };

  const copyCurrentUrl = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl)
      .then(() => alert('Lobby URL copied! Share it with Player 2.'))
      .catch(err => console.error('Failed to copy URL: ', err));
  };

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (appStage !== 'PLAYING') return;

      // Player 1 Controls
      if (!player1Logic.playerState.isGameOver) {
        const p1Key = event.key.toLowerCase();

        // Horizontal Movement
        if (p1Key === PLAYER_1_CONTROLS.left) {
            player1Logic.controls.moveLeft();
        } else if (p1Key === PLAYER_1_CONTROLS.right) {
            player1Logic.controls.moveRight();
        }

        // Vertical Movement & Actions
        if (p1Key === PLAYER_1_CONTROLS.rotate) {
            if (!event.repeat) player1Logic.controls.rotate();
        } else if (p1Key === PLAYER_1_CONTROLS.softDrop) {
            player1Logic.controls.softDrop();
        } else if (event.key === PLAYER_1_CONTROLS.hardDrop) { // Space needs exact match
            if (!event.repeat) {
                event.preventDefault(); 
                player1Logic.controls.hardDrop();
            }
        }
      }

      // Player 2 Controls
      if (!player2Logic.playerState.isGameOver) {
        const p2Key = event.key; // Player 2 controls use event.key directly

        // Horizontal Movement
        if (p2Key === PLAYER_2_CONTROLS.left) {
            player2Logic.controls.moveLeft();
        } else if (p2Key === PLAYER_2_CONTROLS.right) {
            player2Logic.controls.moveRight();
        }
        
        // Vertical Movement & Actions
        if (p2Key === PLAYER_2_CONTROLS.rotate) {
             if (!event.repeat) player2Logic.controls.rotate();
        } else if (p2Key === PLAYER_2_CONTROLS.softDrop) {
            player2Logic.controls.softDrop();
        } else if (p2Key === PLAYER_2_CONTROLS.hardDrop) {
             if (!event.repeat) {
                event.preventDefault();
                player2Logic.controls.hardDrop();
            }
        }
      }
    }, 
    [appStage, player1Logic, player2Logic] 
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const commonButtonClass = "px-6 py-2.5 text-sm font-semibold rounded-md shadow-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const primaryButtonClass = `${commonButtonClass} bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`;
  const secondaryButtonClass = `${commonButtonClass} bg-green-600 hover:bg-green-700 text-white focus:ring-green-500`;
  const tertiaryButtonClass = `${commonButtonClass} bg-slate-500 hover:bg-slate-600 text-white focus:ring-slate-400`;
  const inputClass = "w-full p-2.5 rounded-md border placeholder-slate-400 text-sm minimal-input";

  useEffect(() => {
    socketService.onOpponentGameStateUpdate((gameState) => {
      setOpponentGameState(gameState);
      if (!opponentConnected) {
        setOpponentConnected(true);
      }
    });
    
    socketService.onOpponentReady(() => {
      if (appStage === 'LOBBY_AWAITING_PLAYER2') {
        setAppStage('READY_TO_START');
      } else if (appStage === 'READY_TO_START') {
        triggerActualGameStart();
      }
    });
    
    return () => {
      // Очистка
    };
  }, [appStage, opponentConnected]);
  
  useEffect(() => {
    if (appStage === 'PLAYING') {
      const playerState = isHost 
        ? player1Logic.playerState 
        : player2Logic.playerState;
      
      socketService.sendGameState(playerState);
    }
  }, [isHost, player1Logic.playerState, player2Logic.playerState, appStage]);

  const renderGameUI = () => {
    const currentPlayerState = isHost ? player1Logic.playerState : player2Logic.playerState;
    const currentPlayerName = isHost ? player1Name : player2Name;
    const opponentPlayerName = isHost ? player2Name : player1Name;
    
    return (
      <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-4 lg:gap-6">
        <div className="flex flex-col items-center">
          <PlayerUI 
            playerLabel={`${currentPlayerName || "Вы"}`} 
            playerState={currentPlayerState} 
            playerColorClass="text-blue-600" 
          />
        </div>
        
        {opponentGameState && (
          <div className="flex flex-col items-center">
            <OpponentGameView 
              playerState={opponentGameState} 
              playerName={opponentPlayerName || "Оппонент"}
            />
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    let content;
    switch (appStage) {
      case 'INIT_PLAYER1_NAME':
        content = (
          <form onSubmit={(e) => { e.preventDefault(); handleP1NameSubmit(nameInputRef.current?.value || ''); }} className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-sm w-full space-y-5 border border-slate-200">
            <h2 className="text-xl font-semibold text-center text-slate-700">Введите ваше имя</h2>
            <input
              ref={nameInputRef}
              type="text"
              placeholder="Ваше имя"
              className={inputClass}
              maxLength={20}
              aria-label="Ввод имени игрока"
              defaultValue={player1Name}
            />
            <button type="submit" className={`${primaryButtonClass} w-full`}>Создать лобби</button>
          </form>
        );
        break;
      case 'LOBBY_AWAITING_PLAYER2':
        content = (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full space-y-5 text-center border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-700">Лобби создано, <span className="text-blue-600">{player1Name}</span>!</h2>
            <div className="text-slate-600 text-sm">
              <p>Отправьте эту ссылку второму игроку для присоединения:</p>
              <div className="flex mt-3">
                <input 
                  type="text" 
                  className="flex-grow p-2 text-sm font-mono bg-slate-100 border border-slate-300 rounded-l truncate"
                  value={window.location.href}
                  readOnly
                />
                <button 
                  onClick={copyCurrentUrl} 
                  className="bg-blue-600 text-white p-2 rounded-r hover:bg-blue-700 transition-colors"
                >
                  Копировать
                </button>
              </div>
            </div>
            
            <div className="py-4">
              <p className="text-sm text-slate-700 font-semibold mb-2">Инструкции для второго игрока:</p>
              <ol className="text-left text-sm text-slate-600 space-y-2">
                <li>1. Откройте полученную ссылку</li>
                <li>2. Введите своё имя</li>
                <li>3. Нажмите "Подтвердить"</li>
              </ol>
            </div>
            
            <div className="flex flex-col items-center mt-3 pt-3 border-t border-slate-200">
              <p className="text-slate-500 text-sm">ID лобби: <span className="font-medium text-orange-600">{lobbyId}</span></p>
              <p className="mt-2 text-slate-500">Ожидание второго игрока...</p>
            </div>
          </div>
        );
        break;
      case 'INIT_PLAYER2_NAME_JOIN': 
         content = (
          <form onSubmit={(e) => { e.preventDefault(); handleP2NameSubmit(nameInputRef.current?.value || ''); }} className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-sm w-full space-y-5 border border-slate-200">
            <h2 className="text-xl font-semibold text-center text-slate-700">Присоединение к игре!</h2>
            {player1Name && <p className="text-center text-slate-600 text-md">Вы присоединяетесь к игре <span className="font-medium text-blue-600">{player1Name}</span>.</p>}
            <p className="text-center text-xs text-slate-500">(ID лобби: <span className="font-medium text-orange-600">{lobbyId}</span>)</p>
            <label htmlFor="p2namejoin" className="block text-slate-600 text-sm text-center mt-1">Введите ваше имя:</label>
            <input
              id="p2namejoin"
              ref={nameInputRef}
              type="text"
              placeholder="Ваше имя"
              className={inputClass}
              maxLength={20}
              aria-label="Имя игрока 2"
            />
            <button type="submit" className={`${primaryButtonClass} w-full`}>Подтвердить</button>
          </form>
        );
        break;
      case 'READY_TO_START':
        content = (
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md max-w-md w-full space-y-5 text-center border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-700">Игроки готовы!</h2>
                <div className="text-md text-slate-600 space-y-1.5">
                    <p>Игрок 1: <span className="font-medium text-blue-600">{player1Name}</span></p>
                    <p>Игрок 2: <span className="font-medium text-green-600">{player2Name}</span></p>
                </div>
                <p className="text-xs text-slate-500">ID лобби: <span className="font-medium text-orange-600">{lobbyId}</span></p>
                <button onClick={triggerActualGameStart} className={`${secondaryButtonClass} w-full text-lg py-3`}>
                    Начать игру!
                </button>
            </div>
        );
        break;
      case 'PLAYING':
      case 'GAME_OVER_STATE': 
        content = (
          <>
            {renderGameUI()}
            {appStage === 'PLAYING' && <div className="mt-4 w-full max-w-4xl px-2"><ControlsGuide /></div>}
            <GameOverModal 
                winnerOPlayerName={winnerName}
                onRestart={restartGame} 
                isOpen={appStage === 'GAME_OVER_STATE'} 
            />
          </>
        );
        break;
      default:
        content = <p className="text-slate-500">Loading or unknown state...</p>;
    }
    return <div key={currentStageKey} className="content-fade-in w-full flex flex-col items-center">{content}</div>;
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 space-y-4 sm:space-y-6 select-none">
      <header className="mb-1 sm:mb-2 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-800">
          Tetris <span className="text-blue-600">Clash</span>
        </h1>
        {lobbyId && (appStage === 'LOBBY_AWAITING_PLAYER2' || appStage === 'INIT_PLAYER2_NAME_JOIN' || appStage === 'READY_TO_START') && (
          <p className="text-center text-slate-500 mt-1.5 text-xs sm:text-sm">
            ID лобби: <span className="font-medium text-orange-600">{lobbyId}</span>
          </p>
        )}
      </header>
      
      {renderContent()}
    </div>
  );
};

export default App;
