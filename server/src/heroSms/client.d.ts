export declare class HeroSmsClient {
    private apiKey;
    constructor(apiKey: string);
    private request;
    getBalance(): Promise<number>;
    getPrices(country?: number, service?: string): Promise<any>;
    getNumber(service: string, country: number, operator?: string): Promise<{
        id: string | undefined;
        number: string | undefined;
    }>;
    getStatus(id: string): Promise<any>;
    setStatus(id: string, status: number): Promise<any>;
    getActiveActivations(): Promise<any>;
}
//# sourceMappingURL=client.d.ts.map