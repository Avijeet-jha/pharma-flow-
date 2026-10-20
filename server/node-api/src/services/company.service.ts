import {
  getAllCompanies,
  createCompany,
  approveCompany,
  getCompanyById,
  updateCompanyStatus,
  getCompanyPerformance,
} from "../repositories/company.repository";

/*
|--------------------------------------------------------------------------
| Get all companies
|--------------------------------------------------------------------------
*/
export const getCompanies = async () => {
  return getAllCompanies();
};

/*
|--------------------------------------------------------------------------
| Get single company
|--------------------------------------------------------------------------
*/
export const getCompany = async (
  companyId: string
) => {
  return getCompanyById(companyId);
};

/*
|--------------------------------------------------------------------------
| Register company
|--------------------------------------------------------------------------
*/
export const registerCompany = async (data: {
  companyName: string;
  companyType:
    | "PHARMA"
    | "WHOLESALER"
    | "RETAILER";
  email: string;
  passwordHash: string;
  phone?: string;
  gstNumber?: string;
  drugLicenseNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}) => {
  return createCompany(data);
};

/*
|--------------------------------------------------------------------------
| Approve company
|--------------------------------------------------------------------------
*/
export const approveCompanyService = async (
  companyId: string
) => {
  return approveCompany(companyId);
};

/*
|--------------------------------------------------------------------------
| Get company details
|--------------------------------------------------------------------------
*/
export const getCompanyDetails = async (
  companyId: string
) => {
  return getCompanyById(companyId);
};

/*
|--------------------------------------------------------------------------
| Update company status
|--------------------------------------------------------------------------
*/
export const changeCompanyStatus = async (
  companyId: string,
  newStatus:
    | "ACTIVE"
    | "SUSPENDED"
    | "REJECTED"
) => {
  /*
  |--------------------------------------------------------------------------
  | Find company first
  |--------------------------------------------------------------------------
  */
  const company = await getCompanyById(
    companyId
  );

  if (!company) {
    throw new Error(
      "Company not found"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Validate status transition
  |--------------------------------------------------------------------------
  */

  // PENDING → ACTIVE
  if (
    company.status === "PENDING" &&
    newStatus === "ACTIVE"
  ) {
    return updateCompanyStatus(
      companyId,
      "ACTIVE"
    );
  }

  // PENDING → REJECTED
  if (
    company.status === "PENDING" &&
    newStatus === "REJECTED"
  ) {
    return updateCompanyStatus(
      companyId,
      "REJECTED"
    );
  }

  // ACTIVE → SUSPENDED
  if (
    company.status === "ACTIVE" &&
    newStatus === "SUSPENDED"
  ) {
    return updateCompanyStatus(
      companyId,
      "SUSPENDED"
    );
  }

  // SUSPENDED → ACTIVE
  if (
    company.status === "SUSPENDED" &&
    newStatus === "ACTIVE"
  ) {
    return updateCompanyStatus(
      companyId,
      "ACTIVE"
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Invalid transition
  |--------------------------------------------------------------------------
  */
  throw new Error(
    `Cannot change company status from ${company.status} to ${newStatus}`
  );
};

export const getCompanyPerformanceService = async (
  companyId: string
) => {
  return getCompanyPerformance(
    companyId
  );
};