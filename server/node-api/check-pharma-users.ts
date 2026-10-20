import prisma from "./src/config/prisma";

const checkPharmaUsers = async () => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "PHARMA",
      },

      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        isActive: true,

        company: {
          select: {
            id: true,
            companyName: true,
            companyType: true,
            status: true,
          },
        },
      },
    });

    console.log("\n========== PHARMA USERS ==========\n");

    if (users.length === 0) {
      console.log("❌ No PHARMA users found.");
    } else {
      console.table(
        users.map(
          (user: (typeof users)[number]) => ({
            userId: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            companyId: user.companyId,
            company: user.company?.companyName,
            companyStatus: user.company?.status,
            active: user.isActive,
          })
        )
      );
    }

    console.log("\n==================================\n");
  } catch (error) {
    console.error("❌ Failed to check Pharma users:");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
};

checkPharmaUsers();