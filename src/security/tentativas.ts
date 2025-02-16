import { RateLimiterMemory } from 'rate-limiter-flexible';

export const emailLimiter = new RateLimiterMemory({
    points: 5, // Permite 5 tentativas de email
    duration: 0
});


export const senhaLimiter = new RateLimiterMemory({
    points: 5, // Permite 5 tentativas de senha
    duration: 0
});