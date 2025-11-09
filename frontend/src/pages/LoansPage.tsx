import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  approveLoan,
  issueLoan,
  listLoans,
  rejectLoan,
  returnLoan,
  type Loan,
  type LoanFilters,
  type LoanStatus,
} from "../api/loans";
import { useAuth } from "../context/AuthContext";

const statusOptions: LoanStatus[] = ["pending", "approved", "issued", "returned", "rejected"];

const LoansPage = () => {
  const { hasRole, user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<LoanFilters>({});

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ["loans", filters],
    queryFn: () => listLoans(filters),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["loans"] });
    queryClient.invalidateQueries({ queryKey: ["equipment"] });
  };

  const approveMutation = useMutation({
    mutationFn: approveLoan,
    onSuccess: refresh,
  });

  const rejectMutation = useMutation({
    mutationFn: rejectLoan,
    onSuccess: refresh,
  });

  const issueMutation = useMutation({
    mutationFn: issueLoan,
    onSuccess: refresh,
  });

  const returnMutation = useMutation({
    mutationFn: returnLoan,
    onSuccess: refresh,
  });

  const [busyState, setBusyState] = useState<{ id: string; action: LoanStatus | "reject" } | null>(
    null
  );

  const handleAction = async (id: string, action: LoanStatus | "reject") => {
    setBusyState({ id, action });
    try {
      switch (action) {
        case "approved":
          await approveMutation.mutateAsync(id);
          toast.success("Loan approved");
          break;
        case "issued":
          await issueMutation.mutateAsync(id);
          toast.success("Loan issued");
          break;
        case "returned":
          await returnMutation.mutateAsync(id);
          toast.success("Loan marked as returned");
          break;
        case "reject":
          await rejectMutation.mutateAsync(id);
          toast.success("Loan rejected");
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error("Action failed");
    } finally {
      setBusyState(null);
    }
  };

  const isManager = hasRole("staff", "admin");

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Loan Requests</h1>
          <p className="muted-text">
            Track and manage borrowing requests. {isManager ? "Approve, issue, or close requests." : "View your requests and their status."}
          </p>
        </div>
        <select
          value={filters.status ?? ""}
          onChange={(event) =>
            setFilters({ status: event.target.value ? (event.target.value as LoanStatus) : undefined })
          }
        >
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.toUpperCase()}
            </option>
          ))}
        </select>
      </header>

      {isLoading ? (
        <div className="empty-state">Loading loan data...</div>
      ) : loans.length === 0 ? (
        <div className="empty-state">
          <p>No loan requests found.</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Equipment</th>
                {isManager && <th>Borrower</th>}
                <th>Qty</th>
                <th>Status</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loans.map((loan) => (
                <LoanRow
                  key={loan.id}
                  loan={loan}
                  currentUserId={user?.id}
                  isManager={isManager}
                  busyAction={busyState && busyState.id === loan.id ? busyState.action : null}
                  onApprove={() => handleAction(loan.id, "approved")}
                  onReject={() => handleAction(loan.id, "reject")}
                  onIssue={() => handleAction(loan.id, "issued")}
                  onReturn={() => handleAction(loan.id, "returned")}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

interface LoanRowProps {
  loan: Loan;
  isManager: boolean;
  currentUserId?: string;
  busyAction: (LoanStatus | "reject") | null;
  onApprove: () => void;
  onReject: () => void;
  onIssue: () => void;
  onReturn: () => void;
}

const LoanRow = ({
  loan,
  isManager,
  currentUserId,
  busyAction,
  onApprove,
  onReject,
  onIssue,
  onReturn,
}: LoanRowProps) => {
  const requestedDates =
    loan.requestedForDate && loan.dueDate
      ? `${new Date(loan.requestedForDate).toLocaleDateString()} → ${new Date(
          loan.dueDate
        ).toLocaleDateString()}`
      : "—";

  const canManage = isManager;
  const canReturn = isManager || loan.borrower.id === currentUserId;

  const showDecisionActions = canManage && loan.status === "pending";
  const showIssueAction = canManage && loan.status === "approved";
  const showReturnAction = canReturn && ["approved", "issued"].includes(loan.status);
  const hasNoActions = !showDecisionActions && !showIssueAction && !showReturnAction;

  return (
    <tr>
      <td>
        <div className="table-primary">
          <strong>{loan.equipment.name}</strong>
          <span className="muted-text">{loan.equipment.category}</span>
        </div>
      </td>
      {isManager && (
        <td>
          <div className="table-primary">
            <strong>{loan.borrower.fullName}</strong>
            <span className="muted-text">{loan.borrower.email}</span>
          </div>
        </td>
      )}
      <td>{loan.quantity}</td>
      <td>
        <span className={`badge badge-status-${loan.status}`}>{loan.status.toUpperCase()}</span>
      </td>
      <td>{requestedDates}</td>
      <td className="muted-text">{loan.requestReason ?? "—"}</td>
      <td className="table-actions">
        <div className="table-actions__group">
          {showDecisionActions && (
            <>
              <button
                type="button"
                className="btn-secondary"
                onClick={onApprove}
                disabled={busyAction === "approved" || busyAction === "reject"}
              >
                Approve
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={onReject}
                disabled={busyAction === "approved" || busyAction === "reject"}
              >
                Reject
              </button>
            </>
          )}
          {showIssueAction && (
            <button
              type="button"
              className="btn-primary"
              onClick={onIssue}
              disabled={busyAction === "issued"}
            >
              Mark Issued
            </button>
          )}
          {showReturnAction && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onReturn}
              disabled={busyAction === "returned"}
            >
              Mark Returned
            </button>
          )}
          {hasNoActions && <span className="table-actions__empty">No actions</span>}
        </div>
      </td>
    </tr>
  );
};

export default LoansPage;

