import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "./generated/prisma/client"
const adapter = new PrismaMariaDb(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  const femme = await prisma.category.create({
    data: { name: "Femme", position: 0 },
  })
  const vetements = await prisma.category.create({
    data: { name: "Vêtements", parent_id: femme.id, position: 0 },
  })
  const jean = await prisma.category.create({
    data: { name: "Jean", parent_id: vetements.id, position: 0 },
  })
  await prisma.category.createMany({
    data: [
      { name: "Jean slim", parent_id: jean.id, position: 0 },
      { name: "Jean bootcut", parent_id: jean.id, position: 1 },
      { name: "Jean taille haute", parent_id: jean.id, position: 2 },
      { name: "Jean large", parent_id: jean.id, position: 3 },
    ],
  })
}

main().then(() => prisma.$disconnect())
