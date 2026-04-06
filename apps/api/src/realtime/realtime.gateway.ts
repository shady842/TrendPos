import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  namespace: '/realtime',
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection {
  private readonly logger = new Logger(RealtimeGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth as { token?: string })?.token ??
      (client.handshake.query.token as string | undefined);
    if (!token || typeof token !== 'string') {
      this.logger.warn('Socket rejected: no token');
      client.disconnect(true);
      return;
    }
    try {
      const payload = this.jwt.verify<{ sub: string }>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      const memberships = await this.prisma.userCompany.findMany({
        where: { userId: payload.sub },
      });
      for (const m of memberships) {
        await client.join(`company:${m.companyId}`);
      }
      this.logger.log(`Socket ${client.id} joined ${memberships.length} company room(s)`);
    } catch (e) {
      this.logger.warn(`Socket JWT failed: ${(e as Error).message}`);
      client.disconnect(true);
    }
  }

  emitOrderUpdated(companyId: string, payload: unknown) {
    this.server.to(`company:${companyId}`).emit('order:updated', payload);
  }

  emitApprovalUpdated(companyId: string, payload: unknown) {
    this.server.to(`company:${companyId}`).emit('approval:updated', payload);
  }
}
