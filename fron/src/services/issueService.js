import { issues } from "../data/issues";

export const getIssues = () => {
  return {
    issues,
    total: issues.length,
  };
};

export const getIssueById = (id) => {
  return issues.find((issue) => issue._id === id);
};