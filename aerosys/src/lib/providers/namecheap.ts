import { Namecheap } from 'namecheap-api';

// Initialize Namecheap client
// In production, these should be environment variables
const namecheap = new Namecheap({
  user: process.env.NAMECHEAP_USER || 'demo_user',
  apiUser: process.env.NAMECHEAP_API_USER || 'demo_user',
  apiKey: process.env.NAMECHEAP_API_KEY || 'demo_key',
  clientIp: process.env.NAMECHEAP_CLIENT_IP || '127.0.0.1',
  useSandbox: process.env.NODE_ENV !== 'production'
});

export async function registerDomain(domainName: string, years: number = 1) {
  try {
    // Check availability first
    const check = await namecheap.apiCall('namecheap.domains.check', {
      DomainList: domainName
    });
    
    const isAvailable = check.response.DomainCheckResult[0].$.Available === 'true';
    
    if (!isAvailable) {
      throw new Error(`Domain ${domainName} is not available`);
    }

    // Register the domain
    // Note: Requires full contact info in a real scenario
    const result = await namecheap.apiCall('namecheap.domains.create', {
      DomainName: domainName,
      Years: years,
      // Placeholder contact info for demonstration
      RegistrantFirstName: 'John',
      RegistrantLastName: 'Doe',
      RegistrantAddress1: '123 Main St',
      RegistrantCity: 'Anytown',
      RegistrantStateProvince: 'CA',
      RegistrantPostalCode: '12345',
      RegistrantCountry: 'US',
      RegistrantPhone: '+1.5555555555',
      RegistrantEmailAddress: 'admin@aerosys.aero',
      // Tech, Admin, Aux billing contacts would also be required
    });

    return {
      success: true,
      data: result.response.DomainCreateResult[0].$
    };
  } catch (error) {
    console.error('Namecheap registration error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getDomainInfo(domainName: string) {
  try {
    const result = await namecheap.apiCall('namecheap.domains.getInfo', {
      DomainName: domainName
    });
    return {
      success: true,
      data: result.response.DomainGetInfoResult[0]
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}