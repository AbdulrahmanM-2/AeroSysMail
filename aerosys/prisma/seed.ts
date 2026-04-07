import { PrismaClient } from '@prisma/client'
import { users, credentials, emails, deals, invoices, clients, tasks, aiInsights, revenueData } from '../src/lib/data'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Seed Users
  for (const user of users) {
    const password = credentials[user.email] || '$2a$10$LBzPwm8RDfQCh7EZ.qVN0OU8nGHTIaKJEn6tttHIcDNfJS3pXiAMi' // Default to 'admin123' hash if not found
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company,
        password: password,
      },
    })
  }

  // Seed Emails
  for (const email of emails) {
    await prisma.email.create({
      data: {
        id: email.id,
        from: email.from,
        fromName: email.fromName,
        to: email.to,
        subject: email.subject,
        body: email.body,
        preview: email.preview,
        date: new Date(email.date),
        read: email.read,
        starred: email.starred,
        folder: email.folder,
      },
    })
  }

  // Seed Deals
  for (const deal of deals) {
    await prisma.deal.create({
      data: {
        id: deal.id,
        name: deal.name,
        company: deal.company,
        value: deal.value,
        stage: deal.stage,
        assignedTo: deal.assignedTo,
        createdAt: new Date(deal.createdAt),
        updatedAt: new Date(deal.updatedAt),
        probability: deal.probability,
      },
    })
  }

  // Seed Invoices
  for (const invoice of invoices) {
    await prisma.invoice.create({
      data: {
        id: invoice.id,
        client: invoice.client,
        amount: invoice.amount,
        status: invoice.status,
        dueDate: new Date(invoice.dueDate),
        issuedDate: new Date(invoice.issuedDate),
        items: {
          create: invoice.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
          })),
        },
      },
    })
  }

  // Seed Clients
  for (const client of clients) {
    await prisma.client.upsert({
      where: { email: client.email },
      update: {},
      create: {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        phone: client.phone,
        status: client.status,
        totalRevenue: client.totalRevenue,
        deals: client.deals,
        lastContact: new Date(client.lastContact),
      },
    })
  }

  // Seed Tasks
  for (const task of tasks) {
    await prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: new Date(task.dueDate),
        assignedTo: task.assignedTo,
      },
    })
  }

  // Seed AI Insights
  for (const insight of aiInsights) {
    await prisma.aIInsight.create({
      data: {
        id: insight.id,
        message: insight.message,
        type: insight.type,
        timestamp: new Date(insight.timestamp),
      },
    })
  }

  // Seed Revenue Data
  for (const data of revenueData) {
    await prisma.revenueData.create({
      data: {
        month: data.month,
        revenue: data.revenue,
      },
    })
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })