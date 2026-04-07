export type UserRole = 'admin' | 'client'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  company?: string
}

export interface SessionPayload {
  userId: string
  email: string
  name: string
  role: UserRole
  exp: number
}

export interface Email {
  id: string
  from: string
  fromName: string
  to: string
  subject: string
  body: string
  preview: string
  date: string
  read: boolean
  starred: boolean
  folder: 'inbox' | 'sent' | 'drafts' | 'starred' | 'important'
  avatar?: string
}

export interface Deal {
  id: string
  name: string
  company: string
  value: number
  stage: 'new_lead' | 'negotiation' | 'awaiting_signature' | 'closed'
  assignedTo: string
  createdAt: string
  updatedAt: string
  probability: number
}

export interface Invoice {
  id: string
  client: string
  amount: number
  status: 'paid' | 'pending' | 'overdue' | 'draft'
  dueDate: string
  issuedDate: string
  items: { description: string; quantity: number; rate: number }[]
}

export interface Client {
  id: string
  name: string
  email: string
  company: string
  phone: string
  status: 'active' | 'inactive' | 'prospect'
  totalRevenue: number
  deals: number
  lastContact: string
  avatar?: string
}

export interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'done'
  dueDate: string
  assignedTo: string
}

export interface AIInsight {
  id: string
  message: string
  type: 'optimization' | 'alert' | 'suggestion'
  timestamp: string
}

// Domain Registrar Types
export type DomainStatus = 'active' | 'pending' | 'expired' | 'transferring' | 'suspended'
export type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA'
export type TransferStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled'

export interface Domain {
  id: string; name: string; tld: string; registrant: string; registrantEmail: string
  status: DomainStatus; registeredAt: string; expiresAt: string; autoRenew: boolean
  locked: boolean; whoisPrivacy: boolean; nameservers: string[]; dnsRecords: DNSRecord[]
  price: number; renewalPrice: number
}

export interface DNSRecord {
  id: string; domainId: string; type: DNSRecordType; name: string; value: string
  ttl: number; priority?: number; weight?: number; port?: number
}

export interface DomainTransfer {
  id: string; domainName: string; fromRegistrar: string; toRegistrar: string
  status: TransferStatus; initiatedAt: string; completedAt?: string; authCode: string
  clientId: string; clientName: string
}

export interface DomainPricing {
  tld: string; registerPrice: number; renewalPrice: number; transferPrice: number
  premium: boolean; popular: boolean; category: 'generic' | 'country' | 'new' | 'aviation' | 'business'
}

export interface WHOISInfo {
  domainId: string; registrantName: string; registrantOrg: string; registrantEmail: string
  registrantPhone: string; registrantAddress: string; registrantCity: string
  registrantState: string; registrantCountry: string; registrantZip: string
  adminName: string; adminEmail: string; techName: string; techEmail: string
  privacyEnabled: boolean; createdDate: string; updatedDate: string; expiryDate: string
}

export interface DomainSearchResult {
  domain: string; available: boolean; premium: boolean; price: number; renewalPrice: number
}
