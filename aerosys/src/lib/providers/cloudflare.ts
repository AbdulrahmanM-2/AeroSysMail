import Cloudflare from 'cloudflare';

// Initialize Cloudflare client
const cf = new Cloudflare({
  apiEmail: process.env.CLOUDFLARE_EMAIL || 'admin@aerosys.aero',
  apiKey: process.env.CLOUDFLARE_API_KEY || 'demo_key',
});

export async function addZone(domainName: string) {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || 'demo_account_id';
    
    const zone = await cf.zones.create({
      account: { id: accountId },
      name: domainName,
      type: 'full'
    });

    return {
      success: true,
      data: zone
    };
  } catch (error) {
    console.error('Cloudflare add zone error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function addDNSRecord(zoneId: string, type: string, name: string, content: string, ttl: number = 1) {
  try {
    const record = await cf.dns.records.create({
      zone_id: zoneId,
      type: type as any,
      name: name,
      content: content,
      ttl: ttl
    });

    return {
      success: true,
      data: record
    };
  } catch (error) {
    console.error('Cloudflare add DNS record error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}