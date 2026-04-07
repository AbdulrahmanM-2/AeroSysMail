import type { Email, Deal, Invoice, Client, Task, AIInsight, User } from './types'

export const users: User[] = [
  { id: 'u1', email: 'admin@aerosys.aero', name: 'Alex Maxwell', role: 'admin', company: 'AeroSys' },
  { id: 'u2', email: 'client@aerosys.aero', name: 'Sarah Thompson', role: 'client', company: 'Tech Corp' },
  { id: 'u3', email: 'john@aerosys.aero', name: 'John Maxwell', role: 'admin', company: 'AeroSys' },
]

// bcryptjs hash of "admin123" and "client123"
export const credentials: Record<string, string> = {
  'admin@aerosys.aero': '$2a$10$LBzPwm8RDfQCh7EZ.qVN0OU8nGHTIaKJEn6tttHIcDNfJS3pXiAMi',
  'client@aerosys.aero': '$2a$10$LBzPwm8RDfQCh7EZ.qVN0OU8nGHTIaKJEn6tttHIcDNfJS3pXiAMi',
}

export const emails: Email[] = [
  { id: 'e1', from: 'john.maxwell@example.com', fromName: 'John Maxwell', to: 'alex@aerosys.aero', subject: 'Meeting Proposal for Next Week', body: 'Hi Alex,\n\nI hope you\'re doing well. I\'d like to propose a meeting to discuss the project timeline and milestones for next week. Are you available on Wednesday at 2 PM?\n\nLet me know what works for you.\n\nBest,\nJohn Maxwell', preview: 'Arrange meeting at IST\u2019s...', date: '2026-04-06T14:11:00Z', read: false, starred: false, folder: 'inbox' },
  { id: 'e2', from: 'sales@acme.com', fromName: 'Acme Sales', to: 'alex@aerosys.aero', subject: 'Project Finalization', body: 'Hi,\n\nWe need to finalize the project details by end of week. Please review the attached documents and confirm.\n\nRegards,\nAcme Sales Team', preview: 'Take the project finalization...', date: '2026-04-06T13:45:00Z', read: false, starred: false, folder: 'inbox' },
  { id: 'e3', from: 'sarah@techcorp.com', fromName: 'Sarah Thompson', to: 'alex@aerosys.aero', subject: 'Done Calculating TTR', body: 'Hi,\n\nI\'ve finished the TTR calculations. The results look promising - we\'re ahead of schedule on most metrics.\n\nBest,\nSarah', preview: 'Emailing review, ant done calc ttr...', date: '2026-04-06T12:30:00Z', read: true, starred: true, folder: 'inbox' },
  { id: 'e4', from: 'michael@webnex.io', fromName: 'Michael Chen', to: 'alex@aerosys.aero', subject: 'Quote Request', body: 'Hello,\n\nI\'m inquiring about a quote for your enterprise email solution. We have approximately 500 users.\n\nThanks,\nMichael', preview: 'Inquiring for a quote for your e...', date: '2026-04-06T11:20:00Z', read: false, starred: false, folder: 'inbox' },
  { id: 'e5', from: 'clientservices@brightwave.com', fromName: 'BrightWave Services', to: 'alex@aerosys.aero', subject: 'Onboarding Confirmation', body: 'Dear Team,\n\nPlease confirm the onboarding schedule. We\'re ready to proceed with the integration.\n\nBest,\nBrightWave', preview: 'Confirm onboarding; send it a no...', date: '2026-04-06T10:10:00Z', read: true, starred: false, folder: 'inbox' },
  { id: 'e6', from: 'noreply@coolapps.com', fromName: 'CoolApps', to: 'alex@aerosys.aero', subject: 'Feature Update v8.58', body: 'New features in Module 8.58 include improved analytics dashboard and real-time notifications.', preview: 'Feature update: v 8.58 Module...', date: '2026-04-06T07:52:00Z', read: true, starred: false, folder: 'inbox' },
  { id: 'e7', from: 'newsletters@skillwise.io', fromName: 'SkillWise', to: 'alex@aerosys.aero', subject: 'Weekly AI Digest', body: 'This week in AI: breakthroughs in reasoning models, new deployment strategies, and more.', preview: 'Weekly AI newsletter digest...', date: '2026-04-05T16:00:00Z', read: true, starred: false, folder: 'inbox' },
  { id: 'e8', from: 'alex@aerosys.aero', fromName: 'Alex Maxwell', to: 'john.maxwell@example.com', subject: 'Re: Meeting Proposal', body: 'Hi John,\n\nWednesday at 2 PM works great. I\'ll send a calendar invite.\n\nBest,\nAlex', preview: 'Wednesday at 2 PM works great...', date: '2026-04-06T14:30:00Z', read: true, starred: false, folder: 'sent' },
]

export const deals: Deal[] = [
  { id: 'd1', name: 'Enterprise License', company: 'Tech Corp', value: 45000, stage: 'new_lead', assignedTo: 'Alex Maxwell', createdAt: '2026-03-15', updatedAt: '2026-04-05', probability: 25 },
  { id: 'd2', name: 'Cloud Migration', company: 'Delta Solutions', value: 32000, stage: 'new_lead', assignedTo: 'Alex Maxwell', createdAt: '2026-03-20', updatedAt: '2026-04-04', probability: 20 },
  { id: 'd3', name: 'Platform Integration', company: 'Acme Ltd', value: 12500, stage: 'negotiation', assignedTo: 'John Maxwell', createdAt: '2026-02-10', updatedAt: '2026-04-06', probability: 60 },
  { id: 'd4', name: 'API Access Tier', company: 'GreenPath Co', value: 8500, stage: 'negotiation', assignedTo: 'Alex Maxwell', createdAt: '2026-02-28', updatedAt: '2026-04-03', probability: 55 },
  { id: 'd5', name: 'Security Audit', company: 'Skyline Inc', value: 18000, stage: 'negotiation', assignedTo: 'John Maxwell', createdAt: '2026-01-15', updatedAt: '2026-04-01', probability: 70 },
  { id: 'd6', name: 'Email Suite', company: 'Global Media', value: 28000, stage: 'awaiting_signature', assignedTo: 'Alex Maxwell', createdAt: '2026-01-05', updatedAt: '2026-04-06', probability: 90 },
  { id: 'd7', name: 'Mail Gateway', company: 'Skyline Inc', value: 15000, stage: 'awaiting_signature', assignedTo: 'John Maxwell', createdAt: '2026-12-20', updatedAt: '2026-03-30', probability: 85 },
  { id: 'd8', name: 'Full Platform', company: 'Salvo Enterprises', value: 15000, stage: 'closed', assignedTo: 'Alex Maxwell', createdAt: '2025-11-01', updatedAt: '2026-03-25', probability: 100 },
  { id: 'd9', name: 'Annual License', company: 'BrightWave Ltd', value: 22500, stage: 'closed', assignedTo: 'John Maxwell', createdAt: '2025-10-15', updatedAt: '2026-03-20', probability: 100 },
]

export const invoices: Invoice[] = [
  { id: 'inv-001', client: 'Tech Corp', amount: 12500, status: 'paid', dueDate: '2026-03-15', issuedDate: '2026-02-15', items: [{ description: 'Platform License Q1', quantity: 1, rate: 12500 }] },
  { id: 'inv-002', client: 'BrightWave Ltd', amount: 15000, status: 'pending', dueDate: '2026-04-18', issuedDate: '2026-03-18', items: [{ description: 'Annual License', quantity: 1, rate: 15000 }] },
  { id: 'inv-003', client: 'Acme Ltd', amount: 4800, status: 'pending', dueDate: '2026-04-20', issuedDate: '2026-03-20', items: [{ description: 'API Access - March', quantity: 1, rate: 4800 }] },
  { id: 'inv-004', client: 'Global Media', amount: 8000, status: 'overdue', dueDate: '2026-03-30', issuedDate: '2026-02-28', items: [{ description: 'Email Suite Setup', quantity: 1, rate: 8000 }] },
  { id: 'inv-005', client: 'Delta Solutions', amount: 6200, status: 'paid', dueDate: '2026-03-01', issuedDate: '2026-02-01', items: [{ description: 'Consulting Hours', quantity: 31, rate: 200 }] },
  { id: 'inv-006', client: 'Salvo Enterprises', amount: 15000, status: 'paid', dueDate: '2026-02-15', issuedDate: '2026-01-15', items: [{ description: 'Full Platform License', quantity: 1, rate: 15000 }] },
]

export const clients: Client[] = [
  { id: 'c1', name: 'Sarah Thompson', email: 'sarah@techcorp.com', company: 'Tech Corp', phone: '+1 555-0101', status: 'active', totalRevenue: 45000, deals: 3, lastContact: '2026-04-05' },
  { id: 'c2', name: 'James Rodriguez', email: 'james@brightwave.com', company: 'BrightWave Ltd', phone: '+1 555-0102', status: 'active', totalRevenue: 37500, deals: 2, lastContact: '2026-04-04' },
  { id: 'c3', name: 'Emily Chen', email: 'emily@acme.com', company: 'Acme Ltd', phone: '+1 555-0103', status: 'active', totalRevenue: 12500, deals: 1, lastContact: '2026-04-06' },
  { id: 'c4', name: 'David Park', email: 'david@globalmedia.com', company: 'Global Media', phone: '+1 555-0104', status: 'active', totalRevenue: 28000, deals: 1, lastContact: '2026-04-01' },
  { id: 'c5', name: 'Lisa Wang', email: 'lisa@delta.com', company: 'Delta Solutions', phone: '+1 555-0105', status: 'prospect', totalRevenue: 6200, deals: 1, lastContact: '2026-03-28' },
  { id: 'c6', name: 'Michael Torres', email: 'michael@salvo.com', company: 'Salvo Enterprises', phone: '+1 555-0106', status: 'active', totalRevenue: 15000, deals: 1, lastContact: '2026-03-25' },
  { id: 'c7', name: 'Rachel Green', email: 'rachel@skyline.com', company: 'Skyline Inc', phone: '+1 555-0107', status: 'active', totalRevenue: 33000, deals: 2, lastContact: '2026-04-02' },
  { id: 'c8', name: 'Tom Baker', email: 'tom@greenpath.co', company: 'GreenPath Co', phone: '+1 555-0108', status: 'prospect', totalRevenue: 0, deals: 1, lastContact: '2026-04-03' },
]

export const tasks: Task[] = [
  { id: 't1', title: 'Follow up with BrightWave Ltd', description: 'Send updated proposal', priority: 'high', status: 'todo', dueDate: '2026-04-08', assignedTo: 'Alex Maxwell' },
  { id: 't2', title: 'Review Acme contract', description: 'Legal review needed', priority: 'high', status: 'in_progress', dueDate: '2026-04-07', assignedTo: 'John Maxwell' },
  { id: 't3', title: 'Prepare Q2 forecast', description: 'Revenue projections', priority: 'medium', status: 'todo', dueDate: '2026-04-10', assignedTo: 'Alex Maxwell' },
  { id: 't4', title: 'Client onboarding: GreenPath', description: 'Setup and training', priority: 'medium', status: 'todo', dueDate: '2026-04-12', assignedTo: 'Alex Maxwell' },
  { id: 't5', title: 'Update pricing page', description: 'New tier pricing', priority: 'low', status: 'done', dueDate: '2026-04-05', assignedTo: 'John Maxwell' },
]

export const aiInsights: AIInsight[] = [
  { id: 'ai1', message: 'Optimizing lead responses', type: 'optimization', timestamp: '2026-04-06T14:00:00Z' },
  { id: 'ai2', message: 'Best time to follow up: 10 AM', type: 'suggestion', timestamp: '2026-04-06T13:00:00Z' },
  { id: 'ai3', message: 'Leads respond 25% faster with personalized templates', type: 'optimization', timestamp: '2026-04-06T12:00:00Z' },
  { id: 'ai4', message: 'BrightWave deal likely to close this week (87%)', type: 'suggestion', timestamp: '2026-04-06T11:00:00Z' },
  { id: 'ai5', message: '3 invoices approaching due date', type: 'alert', timestamp: '2026-04-06T10:00:00Z' },
]

export const revenueData = [
  { month: 'Jan', revenue: 1250000 },
  { month: 'Feb', revenue: 1380000 },
  { month: 'Mar', revenue: 1420000 },
  { month: 'Apr', revenue: 1550000 },
  { month: 'May', revenue: 1720000 },
  { month: 'Jun', revenue: 1845200 },
]
