/**
 * Occupancy 看板專用的 WebSocket 連線。
 *
 * 與 webSocketService.js 分開的原因：後者是單例，整個 app 共用一條連線並固定
 * dispatch 到 store 的 setNotifications，無法再掛第二條通道。
 *
 * 推播格式（僅四個欄位，不含影像）：
 *   { counted, direction, person_uuid, status }
 * 心跳沿用既有慣例，帶 statusCode: '200'。
 */
export default class OccupancySocket {
  /**
   * @param {string} url
   * @param {object} handlers
   * @param {(payload: object) => void} handlers.onUpdate   收到進出判定結果
   * @param {() => void} handlers.onReconnect               斷線後重新連上（需重載全量資料補齊缺口）
   * @param {(online: boolean) => void} handlers.onStatus    連線狀態變化
   */
  constructor(url, handlers = {}) {
    this.url = url;
    this.handlers = handlers;

    this.socket = null;
    this.reconnectTimer = null;
    this.reconnectInterval = 1000;
    this.maxReconnectInterval = 5000;

    // 首次連線不算重連，不必觸發補資料
    this.hasConnected = false;
    this.closedByUs = false;
  }

  connect() {
    this.closedByUs = false;

    try {
      this.socket = new WebSocket(this.url);
    } catch (e) {
      console.error('OccupancySocket 建立連線失敗:', e);
      this.scheduleReconnect();
      return;
    }

    this.socket.onopen = () => {
      this.reconnectInterval = 1000;

      if (this.handlers.onStatus) this.handlers.onStatus(true);

      // 斷線期間漏收的事件無法補回，重連後必須重載完整資料
      if (this.hasConnected && this.handlers.onReconnect) {
        this.handlers.onReconnect();
      }
      this.hasConnected = true;
    };

    this.socket.onmessage = (event) => {
      let payload = null;

      try {
        payload = JSON.parse(event.data);
      } catch (e) {
        return; // 不是合法 JSON 就忽略
      }

      if (!payload || payload.statusCode === '200') return; // 心跳
      if (this.handlers.onUpdate) this.handlers.onUpdate(payload);
    };

    this.socket.onclose = (event) => {
      if (this.handlers.onStatus) this.handlers.onStatus(false);

      // 1000 是正常關閉；主動 disconnect 時也不重連
      if (this.closedByUs || (event && event.code === 1000)) return;
      this.scheduleReconnect();
    };

    this.socket.onerror = (e) => {
      console.error('OccupancySocket 連線錯誤:', e);
    };
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;

      if (this.reconnectInterval < this.maxReconnectInterval) {
        this.reconnectInterval += 1000;
      }
      this.connect();
    }, this.reconnectInterval);
  }

  disconnect() {
    this.closedByUs = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.close(1000);
      this.socket = null;
    }
  }
}
