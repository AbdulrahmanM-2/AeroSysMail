declare module 'namecheap-api' {
  export class Namecheap {
    constructor(config: {
      user: string;
      apiUser: string;
      apiKey: string;
      clientIp: string;
      useSandbox?: boolean;
    });
    apiCall(command: string, params: any): Promise<any>;
  }
}