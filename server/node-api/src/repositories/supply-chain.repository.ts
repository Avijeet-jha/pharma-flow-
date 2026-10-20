import prisma from "../config/prisma";

/* =========================================================
   GET AVAILABLE SUPPLY CHAIN PARTNERS
========================================================= */

export const getSupplyChainPartners = async (companyId: string) => {
  const currentCompany = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
    select: {
      companyType: true,
    },
  });

  if (!currentCompany) {
    throw new Error("Company not found");
  }

  /*
   * For now we return active companies other than
   * the logged-in company.
   *
   * Later we can enforce the exact business hierarchy:
   *
   * PHARMA -> WHOLESALER
   * WHOLESALER -> RETAILER
   */

  return prisma.company.findMany({
    where: {
      id: {
        not: companyId,
      },
      status: "ACTIVE",
    },
    select: {
      id: true,
      companyName: true,
      companyType: true,
      city: true,
      state: true,
    },
    orderBy: {
      companyName: "asc",
    },
  });
};

/* =========================================================
   GET SUPPLIER CATALOG
========================================================= */

export const getSupplierCatalog = async (
  companyId: string,
  supplierCompanyId: string,
) => {
  /* -----------------------------------------
     Make sure supplier exists and is active
  ----------------------------------------- */

  const supplier = await prisma.company.findFirst({
    where: {
      id: supplierCompanyId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      companyName: true,
      companyType: true,
      city: true,
      state: true,
    },
  });

  if (!supplier) {
    return null;
  }

  /* -----------------------------------------
     Get supplier medicines
  ----------------------------------------- */

  const medicines = await prisma.medicine.findMany({
    where: {
      companyId: supplierCompanyId,
      isActive: true,
    },

    select: {
      id: true,
      medicineName: true,
      genericName: true,
      strength: true,
      dosageForm: true,
      description: true,

      category: {
        select: {
          id: true,
          name: true,
        },
      },

      batches: {
        select: {
          id: true,
          batchNumber: true,
          manufacturingDate: true,
          expiryDate: true,
          mrp: true,
        },

        orderBy: {
          expiryDate: "asc",
        },
      },
    },

    orderBy: {
      medicineName: "asc",
    },
  });

  return {
    company: supplier,
    medicines,
  };
};
