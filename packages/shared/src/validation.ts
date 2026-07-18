import { z } from 'zod';

export const TxLineHeaderSchema = z.object({
  eventId: z.string(),
  timestamp: z.number(),
  status: z.enum(['LIVE', 'FINISHED', 'CANCELLED']),
  proofRoute: z.string().optional()
});

export const MatchFixtureSchema = z.object({
  matchId: z.string(),
  homeTeam: z.string(),
  awayTeam: z.string(),
  tournament: z.string(),
  startTime: z.number()
});

export const MarketScoreSchema = z.object({
  matchId: z.string(),
  homeScore: z.number(),
  awayScore: z.number(),
  firstScorer: z.string().nullable(),
  isFinalised: z.boolean(),
  cryptographicProof: z.string().optional()
});
