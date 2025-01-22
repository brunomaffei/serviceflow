// seed para usuario admin

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@admin";
const ADMIN_PASSWORD = "123";

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    include: {
      companyInfo: true,
    },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const user = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        companyInfo: {
          create: {
            name: "Empresa Demonstração",
            cnpj: "00.000.000/0001-00",
            email: ADMIN_EMAIL,
            phone: "(00) 0000-0000",
            address: "Endereço Demonstração",
          },
        },
      },
      include: {
        companyInfo: true,
      },
    });

    console.log("Admin user created with company info:", user);
  } else {
    console.log("Admin user already exists:", existingAdmin);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
