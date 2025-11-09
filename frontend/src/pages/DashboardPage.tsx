import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { listEquipment, type Equipment, type EquipmentFilters } from "../api/equipment";
import { requestLoan, type LoanRequestPayload } from "../api/loans";
import { useAuth } from "../context/AuthContext";

const categories = ["Sports", "Laboratory", "Audio/Visual", "Musical", "Miscellaneous"];

const DashboardPage = () => {
  const queryClient = useQueryClient();
  const { hasRole } = useAuth();
  const [filters, setFilters] = useState<EquipmentFilters>({});
  const [selected, setSelected] = useState<Equipment | null>(null);

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ["equipment", filters],
    queryFn: () => listEquipment(filters),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });

  const requestMutation = useMutation({
    mutationFn: (payload: LoanRequestPayload) => requestLoan(payload),
    onSuccess: () => {
      toast.success("Request submitted!");
      setSelected(null);
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
    },
    onError: () => toast.error("Failed to submit request"),
  });

  const canRequest = hasRole("student", "staff", "admin");

  const equipmentSummary = useMemo(() => {
    if (!equipment.length) return { total: 0, available: 0, categories: 0 };
    const total = equipment.length;
    const available = equipment.filter((item) => item.availableQuantity > 0).length;
    const categoryCount = new Set(equipment.map((item) => item.category)).size;
    return { total, available, categories: categoryCount };
  }, [equipment]);

  const handleFilterChange = (patch: EquipmentFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  return (
    <div className="page">
      <section className="cards-row">
        <div className="stat-card">
          <h3>Total Items</h3>
          <p>{equipmentSummary.total}</p>
        </div>
        <div className="stat-card">
          <h3>Available Now</h3>
          <p>{equipmentSummary.available}</p>
        </div>
        <div className="stat-card">
          <h3>Categories</h3>
          <p>{equipmentSummary.categories}</p>
        </div>
      </section>

      <section className="filters">
        <input
          type="text"
          placeholder="Search equipment"
          value={filters.search ?? ""}
          onChange={(event) => handleFilterChange({ search: event.target.value })}
        />
        <select
          value={filters.category ?? ""}
          onChange={(event) => handleFilterChange({ category: event.target.value || undefined })}
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          value={String(filters.available ?? "")}
          onChange={(event) => {
            const value = event.target.value;
            handleFilterChange({
              available: value === "" ? undefined : value === "true",
            });
          }}
        >
          <option value="">All availability</option>
          <option value="true">Available</option>
          <option value="false">Currently Unavailable</option>
        </select>
      </section>

      <section className="equipment-grid">
        {isLoading && <div className="empty-state">Loading equipment...</div>}
        {!isLoading && equipment.length === 0 && (
          <div className="empty-state">
            <p>No equipment found. Try adjusting your filters.</p>
          </div>
        )}
        {equipment.map((item) => (
          <article className="equipment-card" key={item._id}>
            <header>
              <h3>{item.name}</h3>
              <span className={`badge badge-${item.condition}`}>{item.condition}</span>
            </header>
            <p className="equipment-description">{item.description ?? "No description"}</p>
            <dl className="equipment-meta">
              <div>
                <dt>Category</dt>
                <dd>{item.category}</dd>
              </div>
              <div>
                <dt>Available</dt>
                <dd>
                  {item.availableQuantity} / {item.quantity}
                </dd>
              </div>
            </dl>
            <footer>
              {canRequest ? (
                <button
                  type="button"
                  className="btn-primary"
                  disabled={item.availableQuantity === 0}
                  onClick={() => setSelected(item)}
                >
                  {item.availableQuantity === 0 ? "Unavailable" : "Request"}
                </button>
              ) : (
                <span className="muted-text">Login to request</span>
              )}
            </footer>
          </article>
        ))}
      </section>

      {selected && (
        <RequestPanel
          equipment={selected}
          disabled={requestMutation.isPending}
          onClose={() => setSelected(null)}
          onSubmit={(payload) =>
            requestMutation.mutate({
              ...payload,
              equipmentId: selected._id,
            })
          }
        />
      )}
    </div>
  );
};

interface RequestPanelProps {
  equipment: Equipment;
  disabled: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<LoanRequestPayload, "equipmentId">) => void;
}

const RequestPanel = ({ equipment, disabled, onClose, onSubmit }: RequestPanelProps) => {
  const [quantity, setQuantity] = useState(1);
  const [requestReason, setRequestReason] = useState("");
  const [requestedForDate, setRequestedForDate] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({
      quantity,
      requestReason,
      requestedForDate: requestedForDate || undefined,
      dueDate: dueDate || undefined,
    });
  };

  return (
    <div className="request-panel">
      <div className="request-panel__content">
        <header>
          <h2>Request {equipment.name}</h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Close
          </button>
        </header>
        <form onSubmit={handleSubmit} className="request-form">
          <label>
            Quantity
            <input
              type="number"
              min={1}
              max={equipment.availableQuantity}
              value={quantity}
              onChange={(event) => setQuantity(Number(event.target.value))}
              required
            />
          </label>
          <label>
            Reason / Notes
            <textarea
              value={requestReason}
              onChange={(event) => setRequestReason(event.target.value)}
              placeholder="Explain how you'll use this equipment"
            />
          </label>
          <div className="date-grid">
            <label>
              Needed from
              <input
                type="date"
                value={requestedForDate}
                onChange={(event) => setRequestedForDate(event.target.value)}
              />
            </label>
            <label>
              Return by
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </label>
          </div>
          <button type="submit" className="btn-primary" disabled={disabled}>
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
};

export default DashboardPage;

