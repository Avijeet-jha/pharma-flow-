import { getCategories } from "../repositories/category.repository";

export const fetchCategories = async () => {
  return getCategories();
};