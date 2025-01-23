"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs"); // Altere para bcryptjs
const prisma = new client_1.PrismaClient();
async function main() {
    // Vamos usar uma senha mais simples para teste
    const plainPassword = "admin123";
    const hashedPassword = await (0, bcryptjs_1.hash)(plainPassword, 10);
    console.log("Creating user with plain password:", plainPassword);
    const adminUser = await prisma.user.upsert({
        where: { email: "admin@serviceflow.com" },
        update: {},
        create: {
            email: "admin@serviceflow.com",
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    });
    console.log("Admin user created with email:", adminUser.email);
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
