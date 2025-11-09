import apiClient from "./client";
import type { Equipment } from "./equipment";
import type { Role } from "./auth";

export type LoanStatus = "pending" | "approved" | "rejected" | "issued" | "returned";

export interface LoanUser {
  id: string;
  _id: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface Loan {
  id: string;
  _id?: string;
  equipment: Equipment & { id: string };
  borrower: LoanUser;
  quantity: number;
  status: LoanStatus;
  requestReason?: string;
  requestedForDate?: string;
  dueDate?: string;
  approvedBy?: LoanUser;
  issuedAt?: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoanFilters {
  status?: LoanStatus;
}

export const listLoans = async (filters: LoanFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);

  const { data } = await apiClient.get<{ loans: Loan[] }>(
    `/loans?${params.toString()}`
  );
  return data.loans;
};

export interface LoanRequestPayload {
  equipmentId: string;
  quantity: number;
  requestReason?: string;
  requestedForDate?: string;
  dueDate?: string;
}

export const requestLoan = async (payload: LoanRequestPayload) => {
  const { data } = await apiClient.post<{ loan: Loan }>("/loans", payload);
  return data.loan;
};

export const approveLoan = async (id: string) => {
  const { data } = await apiClient.patch<{ loan: Loan }>(`/loans/${id}/approve`);
  return data.loan;
};

export const rejectLoan = async (id: string) => {
  const { data } = await apiClient.patch<{ loan: Loan }>(`/loans/${id}/reject`);
  return data.loan;
};

export const issueLoan = async (id: string) => {
  const { data } = await apiClient.patch<{ loan: Loan }>(`/loans/${id}/issue`);
  return data.loan;
};

export const returnLoan = async (id: string) => {
  const { data } = await apiClient.patch<{ loan: Loan }>(`/loans/${id}/return`);
  return data.loan;
};

