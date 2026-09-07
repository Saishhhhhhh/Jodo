export interface AccessTokenPayload {
    sub: string;
    tenantId: string;
    storeId: string;
    email: string;
    name: string;
    type: 'access';
}
export interface RefreshTokenPayload {
    sub: string;
    tenantId: string;
    family: string;
    type: 'refresh';
}
export declare function signAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string;
export declare function signRefreshToken(payload: Omit<RefreshTokenPayload, 'type'>): string;
export declare function verifyAccessToken(token: string): AccessTokenPayload;
export declare function verifyRefreshToken(token: string): RefreshTokenPayload;
export declare function getRefreshTokenExpiry(): Date;
export declare function generateTokenFamily(): string;
