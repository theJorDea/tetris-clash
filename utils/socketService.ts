import { PlayerState } from '../types';

// Используем бесплатный WebSocket сервер для демо
const WS_URL = 'wss://demo.piesocket.com/v3/channel_1?api_key=VCXCEuvhGcBDP7XhiJJUDvR1e1D3eiVjgZ9VRiaV';

class SocketService {
  private socket: WebSocket | null = null;
  private lobbyId: string | null = null;
  private playerNumber: number = 0; // 1 - хост, 2 - гость
  private messageHandlers: {[type: string]: ((data: any) => void)[]} = {};

  public connect(lobbyId: string, playerName: string, isHost: boolean): void {
    this.lobbyId = lobbyId;
    this.playerNumber = isHost ? 1 : 2;
    
    // Отключаем предыдущее соединение, если оно существует
    if (this.socket) {
      this.disconnect();
    }
    
    try {
      this.socket = new WebSocket(WS_URL);
      
      this.socket.onopen = () => {
        console.log(`[Socket] Connected to lobby ${lobbyId} as ${isHost ? 'host' : 'guest'}`);
        
        // Отправляем информацию о подключении
        this.send('join_lobby', {
          lobbyId,
          playerName,
          playerNumber: this.playerNumber
        });
      };
      
      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message && message.type && message.data && message.data.lobbyId === this.lobbyId) {
            // Вызываем обработчики для этого типа сообщения
            const handlers = this.messageHandlers[message.type] || [];
            handlers.forEach(handler => handler(message.data));
          }
        } catch (e) {
          console.error('[Socket] Error parsing message:', e);
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('[Socket] Error:', error);
      };
      
      this.socket.onclose = () => {
        console.log('[Socket] Connection closed');
      };
    } catch (error) {
      console.error('[Socket] Failed to connect:', error);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.lobbyId = null;
      this.messageHandlers = {};
      console.log('[Socket] Disconnected');
    }
  }
  
  private send(type: string, data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({
        type,
        data: {
          ...data,
          lobbyId: this.lobbyId,
          playerNumber: this.playerNumber,
          timestamp: Date.now()
        }
      });
      
      this.socket.send(message);
    } else {
      console.warn('[Socket] Cannot send message, socket not connected');
    }
  }
  
  private on(type: string, callback: (data: any) => void): void {
    if (!this.messageHandlers[type]) {
      this.messageHandlers[type] = [];
    }
    
    this.messageHandlers[type].push(callback);
  }

  // Отправка обновлённого состояния игрока
  public sendGameState(gameState: PlayerState): void {
    this.send('game_state_update', {
      gameState
    });
  }

  // Подписка на обновления от оппонента
  public onOpponentGameStateUpdate(callback: (gameState: PlayerState) => void): void {
    this.on('game_state_update', (data) => {
      if (data.playerNumber !== this.playerNumber) {
        callback(data.gameState);
      }
    });
  }

  // Оповещение о готовности к игре
  public sendPlayerReady(): void {
    this.send('player_ready', {});
  }

  // Подписка на готовность оппонента
  public onOpponentReady(callback: () => void): void {
    this.on('player_ready', (data) => {
      if (data.playerNumber !== this.playerNumber) {
        callback();
      }
    });
  }

  // Синхронизация случайных блоков
  public sendRandomPiece(pieceId: number, sequence: number): void {
    this.send('random_piece', {
      pieceId,
      sequence
    });
  }

  public onRandomPieceGenerated(callback: (pieceId: number, sequence: number) => void): void {
    this.on('random_piece', (data) => {
      callback(data.pieceId, data.sequence);
    });
  }

  // Для тестирования подключения
  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }
}

// Синглтон для использования во всем приложении
export default new SocketService(); 