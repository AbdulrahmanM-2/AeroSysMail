import type { Domain, DomainTransfer, DomainPricing, WHOISInfo } from './types'

export const domainPricing: DomainPricing[] = [
  { tld: '.com', registerPrice: 12.99, renewalPrice: 14.99, transferPrice: 12.99, premium: false, popular: true, category: 'generic' },
  { tld: '.net', registerPrice: 13.99, renewalPrice: 15.99, transferPrice: 13.99, premium: false, popular: true, category: 'generic' },
  { tld: '.org', registerPrice: 11.99, renewalPrice: 13.99, transferPrice: 11.99, premium: false, popular: true, category: 'generic' },
  { tld: '.aero', registerPrice: 38.00, renewalPrice: 38.00, transferPrice: 38.00, premium: false, popular: true, category: 'aviation' },
  { tld: '.io', registerPrice: 32.99, renewalPrice: 39.99, transferPrice: 32.99, premium: false, popular: true, category: 'generic' },
  { tld: '.dev', registerPrice: 14.99, renewalPrice: 16.99, transferPrice: 14.99, premium: false, popular: false, category: 'generic' },
  { tld: '.co', registerPrice: 11.99, renewalPrice: 29.99, transferPrice: 11.99, premium: false, popular: true, category: 'generic' },
  { tld: '.app', registerPrice: 15.99, renewalPrice: 18.99, transferPrice: 15.99, premium: false, popular: false, category: 'generic' },
  { tld: '.cloud', registerPrice: 8.99, renewalPrice: 19.99, transferPrice: 8.99, premium: false, popular: false, category: 'new' },
  { tld: '.ai', registerPrice: 69.99, renewalPrice: 69.99, transferPrice: 69.99, premium: true, popular: true, category: 'generic' },
  { tld: '.tech', registerPrice: 6.99, renewalPrice: 39.99, transferPrice: 6.99, premium: false, popular: false, category: 'new' },
  { tld: '.store', registerPrice: 2.99, renewalPrice: 39.99, transferPrice: 2.99, premium: false, popular: false, category: 'business' },
  { tld: '.online', registerPrice: 1.99, renewalPrice: 34.99, transferPrice: 1.99, premium: false, popular: false, category: 'new' },
  { tld: '.uk', registerPrice: 8.99, renewalPrice: 8.99, transferPrice: 8.99, premium: false, popular: false, category: 'country' },
  { tld: '.de', registerPrice: 7.99, renewalPrice: 7.99, transferPrice: 7.99, premium: false, popular: false, category: 'country' },
  { tld: '.us', registerPrice: 6.99, renewalPrice: 6.99, transferPrice: 6.99, premium: false, popular: false, category: 'country' },
  { tld: '.xyz', registerPrice: 1.99, renewalPrice: 12.99, transferPrice: 1.99, premium: false, popular: false, category: 'new' },
  { tld: '.flights', registerPrice: 45.00, renewalPrice: 45.00, transferPrice: 45.00, premium: false, popular: false, category: 'aviation' },
  { tld: '.travel', registerPrice: 24.99, renewalPrice: 24.99, transferPrice: 24.99, premium: false, popular: false, category: 'aviation' },
  { tld: '.agency', registerPrice: 8.99, renewalPrice: 22.99, transferPrice: 8.99, premium: false, popular: false, category: 'business' },
]

export const domains: Domain[] = [
  { id: 'dom1', name: 'aerosys.aero', tld: '.aero', registrant: 'AeroSys Corp', registrantEmail: 'admin@aerosys.aero', status: 'active', registeredAt: '2024-01-15', expiresAt: '2027-01-15', autoRenew: true, locked: true, whoisPrivacy: true, nameservers: ['ns1.aerosys.aero','ns2.aerosys.aero'], price: 38, renewalPrice: 38, dnsRecords: [
    { id:'r1', domainId:'dom1', type:'A', name:'@', value:'76.76.21.21', ttl:3600 },
    { id:'r2', domainId:'dom1', type:'CNAME', name:'www', value:'cname.vercel-dns.com', ttl:3600 },
    { id:'r3', domainId:'dom1', type:'MX', name:'@', value:'mail.aerosys.aero', ttl:3600, priority:10 },
    { id:'r4', domainId:'dom1', type:'TXT', name:'@', value:'v=spf1 include:aerosys.aero ~all', ttl:3600 },
    { id:'r5', domainId:'dom1', type:'TXT', name:'_dmarc', value:'v=DMARC1; p=quarantine; rua=mailto:dmarc@aerosys.aero', ttl:3600 },
  ]},
  { id: 'dom2', name: 'techcorp.com', tld: '.com', registrant: 'Tech Corp', registrantEmail: 'sarah@techcorp.com', status: 'active', registeredAt: '2023-06-20', expiresAt: '2026-06-20', autoRenew: true, locked: true, whoisPrivacy: true, nameservers: ['ns1.aerosys.aero','ns2.aerosys.aero'], price: 12.99, renewalPrice: 14.99, dnsRecords: [
    { id:'r6', domainId:'dom2', type:'A', name:'@', value:'192.168.1.100', ttl:3600 },
    { id:'r7', domainId:'dom2', type:'CNAME', name:'www', value:'techcorp.com', ttl:3600 },
    { id:'r8', domainId:'dom2', type:'MX', name:'@', value:'mail.techcorp.com', ttl:3600, priority:10 },
  ]},
  { id: 'dom3', name: 'brightwave.io', tld: '.io', registrant: 'BrightWave Ltd', registrantEmail: 'james@brightwave.com', status: 'active', registeredAt: '2024-03-10', expiresAt: '2026-03-10', autoRenew: true, locked: false, whoisPrivacy: false, nameservers: ['ns1.aerosys.aero','ns2.aerosys.aero'], price: 32.99, renewalPrice: 39.99, dnsRecords: [
    { id:'r9', domainId:'dom3', type:'A', name:'@', value:'10.0.0.50', ttl:3600 },
    { id:'r10', domainId:'dom3', type:'CNAME', name:'www', value:'brightwave.io', ttl:3600 },
  ]},
  { id: 'dom4', name: 'skylineflights.aero', tld: '.aero', registrant: 'Skyline Inc', registrantEmail: 'rachel@skyline.com', status: 'active', registeredAt: '2025-01-01', expiresAt: '2027-01-01', autoRenew: true, locked: true, whoisPrivacy: true, nameservers: ['ns1.aerosys.aero','ns2.aerosys.aero'], price: 38, renewalPrice: 38, dnsRecords: [
    { id:'r11', domainId:'dom4', type:'A', name:'@', value:'172.16.0.1', ttl:3600 },
    { id:'r12', domainId:'dom4', type:'CNAME', name:'www', value:'skylineflights.aero', ttl:3600 },
    { id:'r13', domainId:'dom4', type:'MX', name:'@', value:'mail.skylineflights.aero', ttl:3600, priority:10 },
  ]},
  { id: 'dom5', name: 'greenpath.co', tld: '.co', registrant: 'GreenPath Co', registrantEmail: 'tom@greenpath.co', status: 'pending', registeredAt: '2026-04-05', expiresAt: '2027-04-05', autoRenew: false, locked: false, whoisPrivacy: false, nameservers: ['ns1.aerosys.aero','ns2.aerosys.aero'], price: 11.99, renewalPrice: 29.99, dnsRecords: [] },
  { id: 'dom6', name: 'deltasolutions.net', tld: '.net', registrant: 'Delta Solutions', registrantEmail: 'lisa@delta.com', status: 'expired', registeredAt: '2023-03-15', expiresAt: '2026-03-15', autoRenew: false, locked: false, whoisPrivacy: true, nameservers: ['ns1.aerosys.aero','ns2.aerosys.aero'], price: 13.99, renewalPrice: 15.99, dnsRecords: [
    { id:'r14', domainId:'dom6', type:'A', name:'@', value:'203.0.113.10', ttl:3600 },
  ]},
  { id: 'dom7', name: 'acme-aviation.aero', tld: '.aero', registrant: 'Acme Ltd', registrantEmail: 'emily@acme.com', status: 'active', registeredAt: '2025-02-14', expiresAt: '2027-02-14', autoRenew: true, locked: true, whoisPrivacy: true, nameservers: ['ns1.aerosys.aero','ns2.aerosys.aero'], price: 38, renewalPrice: 38, dnsRecords: [
    { id:'r15', domainId:'dom7', type:'A', name:'@', value:'198.51.100.25', ttl:3600 },
    { id:'r16', domainId:'dom7', type:'CNAME', name:'www', value:'acme-aviation.aero', ttl:3600 },
    { id:'r17', domainId:'dom7', type:'MX', name:'@', value:'mail.acme-aviation.aero', ttl:3600, priority:10 },
    { id:'r18', domainId:'dom7', type:'TXT', name:'@', value:'v=spf1 include:aerosys.aero ~all', ttl:3600 },
  ]},
  { id: 'dom8', name: 'globalmedia.ai', tld: '.ai', registrant: 'Global Media', registrantEmail: 'david@globalmedia.com', status: 'transferring', registeredAt: '2025-06-01', expiresAt: '2027-06-01', autoRenew: true, locked: false, whoisPrivacy: true, nameservers: ['ns1.godaddy.com','ns2.godaddy.com'], price: 69.99, renewalPrice: 69.99, dnsRecords: [] },
]

export const domainTransfers: DomainTransfer[] = [
  { id:'tr1', domainName:'globalmedia.ai', fromRegistrar:'GoDaddy', toRegistrar:'AeroSys', status:'in_progress', initiatedAt:'2026-04-03', authCode:'GM8x!kP2z', clientId:'c4', clientName:'David Park' },
  { id:'tr2', domainName:'salvo.tech', fromRegistrar:'Namecheap', toRegistrar:'AeroSys', status:'pending', initiatedAt:'2026-04-05', authCode:'SV3q#mR9p', clientId:'c6', clientName:'Michael Torres' },
  { id:'tr3', domainName:'skyline-ops.com', fromRegistrar:'Cloudflare', toRegistrar:'AeroSys', status:'completed', initiatedAt:'2026-03-20', completedAt:'2026-03-27', authCode:'SK7w@nJ4t', clientId:'c7', clientName:'Rachel Green' },
  { id:'tr4', domainName:'brightwave-app.io', fromRegistrar:'Google Domains', toRegistrar:'AeroSys', status:'failed', initiatedAt:'2026-03-15', authCode:'BW1y!kL6q', clientId:'c2', clientName:'James Rodriguez' },
]

export const whoisRecords: WHOISInfo[] = [
  { domainId:'dom1', registrantName:'AeroSys Corp', registrantOrg:'AeroSys Aviation Technologies', registrantEmail:'admin@aerosys.aero', registrantPhone:'+1.5550100', registrantAddress:'100 Aviation Blvd', registrantCity:'San Francisco', registrantState:'CA', registrantCountry:'US', registrantZip:'94105', adminName:'Alex Maxwell', adminEmail:'alex@aerosys.aero', techName:'John Maxwell', techEmail:'john@aerosys.aero', privacyEnabled:true, createdDate:'2024-01-15', updatedDate:'2026-04-01', expiryDate:'2027-01-15' },
  { domainId:'dom2', registrantName:'Sarah Thompson', registrantOrg:'Tech Corp', registrantEmail:'sarah@techcorp.com', registrantPhone:'+1.5550101', registrantAddress:'200 Tech Park Dr', registrantCity:'Austin', registrantState:'TX', registrantCountry:'US', registrantZip:'73301', adminName:'Sarah Thompson', adminEmail:'sarah@techcorp.com', techName:'Sarah Thompson', techEmail:'tech@techcorp.com', privacyEnabled:true, createdDate:'2023-06-20', updatedDate:'2026-01-10', expiryDate:'2026-06-20' },
  { domainId:'dom3', registrantName:'James Rodriguez', registrantOrg:'BrightWave Ltd', registrantEmail:'james@brightwave.com', registrantPhone:'+1.5550102', registrantAddress:'50 Innovation Way', registrantCity:'Seattle', registrantState:'WA', registrantCountry:'US', registrantZip:'98101', adminName:'James Rodriguez', adminEmail:'james@brightwave.com', techName:'BrightWave IT', techEmail:'it@brightwave.com', privacyEnabled:false, createdDate:'2024-03-10', updatedDate:'2025-12-01', expiryDate:'2026-03-10' },
]
