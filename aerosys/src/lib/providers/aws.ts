import AWS from 'aws-sdk';

// Initialize AWS Route53 client
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'demo_key',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'demo_secret',
  region: process.env.AWS_REGION || 'us-east-1'
});

const route53 = new AWS.Route53();
const route53domains = new AWS.Route53Domains({ region: 'us-east-1' }); // Domains API is only in us-east-1

export async function checkDomainAvailability(domainName: string) {
  try {
    const result = await route53domains.checkDomainAvailability({
      DomainName: domainName
    }).promise();

    return {
      success: true,
      available: result.Availability === 'AVAILABLE'
    };
  } catch (error) {
    console.error('AWS Route53 check availability error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function createHostedZone(domainName: string) {
  try {
    const callerReference = `${Date.now()}-${domainName}`;
    
    const result = await route53.createHostedZone({
      Name: domainName,
      CallerReference: callerReference
    }).promise();

    return {
      success: true,
      data: result.HostedZone
    };
  } catch (error) {
    console.error('AWS Route53 create hosted zone error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}