import { AnyEndpoint, Resolver } from './common.mjs'
import { Packet } from '@leichtgewicht/dns-packet'
import { IncomingMessage } from 'http';
export type Response = undefined | XMLHttpRequest | IncomingMessage;

export function request (url: URL, method: 'POST' | 'GET', packet: Uint8Array, timeout: number, abortSignal: AbortSignal): Promise<{
  error: Error
  response: Response
} | {
  data: Buffer
  response: Response
}>
export function loadJSON (url: URL, cache: null | {
  name: string,
  maxTime: number
}, timeout: number, abortSignal: AbortSignal): Promise<any>

export function queryDns (endpoint: AnyEndpoint, query: Packet, timeout: number, signal?: AbortSignal): Promise<Packet>
export function processResolvers (resolvers: Resolver[]): Resolver[]
