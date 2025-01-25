import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs"; // Altere para bcryptjs

const prisma = new PrismaClient();

async function main() {
  // Vamos usar uma senha mais simples para teste
  const plainPassword = "demo123";
  const hashedPassword = await hash(plainPassword, 10);

  console.log("Creating user with plain password:", plainPassword);

  const adminUser = await prisma.user.upsert({
    where: { email: "mecanicarocha21@gmail.com" },
    update: {
      role: "ADMIN", // Force update role to ADMIN
    },
    create: {
      email: "mecanicarocha21@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log("Admin user updated/created:", {
    email: adminUser.email,
    role: adminUser.role,
    id: adminUser.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
