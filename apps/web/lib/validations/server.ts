import { z } from 'zod';

export const createServerSchema = z.object({
  name: z.string().min(2, 'Server name must be at least 2 characters').max(40, 'Max 40 characters'),
  description: z.string().max(255).optional(),
  edition: z.enum(['JAVA', 'BEDROCK', 'CROSSPLAY']),
  version: z.string().min(1, 'Minecraft version is required'),
  software: z.enum(['PAPER', 'PURPUR', 'VANILLA', 'FABRIC', 'FORGE', 'BEDROCK']),
  memoryLimitMb: z.number().min(1024, 'Minimum 1GB RAM').max(32768, 'Maximum 32GB RAM'),
  cpuLimitCores: z.number().min(1).max(8),
  diskLimitMb: z.number().min(5120).max(102400),
  maxPlayers: z.number().min(1).max(500),
  difficulty: z.enum(['peaceful', 'easy', 'normal', 'hard']),
  gameMode: z.enum(['survival', 'creative', 'adventure', 'spectator']),
  onlineMode: z.boolean(),
  pvp: z.boolean(),
  allowFlight: z.boolean(),
  whitelist: z.boolean(),
  viewDistance: z.number().min(4).max(32),
  simulationDistance: z.number().min(3).max(32),
});
