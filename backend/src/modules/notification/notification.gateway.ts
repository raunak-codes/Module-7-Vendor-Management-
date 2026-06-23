import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token ?? socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return socket.disconnect();

      if (await this.redis.isBlacklisted(token)) return socket.disconnect();

      const payload = this.jwtService.verify(token, { secret: this.config.get('JWT_SECRET') }) as { id: string };
      (socket as any).userId = payload.id;

      socket.join(`user:${payload.id}`);

      if (!this.userSockets.has(payload.id)) this.userSockets.set(payload.id, new Set());
      this.userSockets.get(payload.id)!.add(socket.id);

      this.logger.log(`Socket connected: user=${payload.id} socket=${socket.id}`);
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const userId = (socket as any).userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) { sockets.delete(socket.id); if (!sockets.size) this.userSockets.delete(userId); }
      this.logger.log(`Socket disconnected: user=${userId}`);
    }
  }

  sendToUser(userId: string, event: string, payload: any) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  broadcast(event: string, payload: any) {
    this.server.emit(event, payload);
  }
}
