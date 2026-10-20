import {
  getSupplyChainPartners,
  getSupplierCatalog,
} from "../repositories/supply-chain.repository";


/* =========================================================
   GET PARTNERS
========================================================= */

export const getPartners = async (
  companyId: string
) => {
  return getSupplyChainPartners(companyId);
};


/* =========================================================
   GET SUPPLIER CATALOG
========================================================= */

export const getCatalog = async (
  companyId: string,
  supplierCompanyId: string
) => {
  return getSupplierCatalog(
    companyId,
    supplierCompanyId
  );
};