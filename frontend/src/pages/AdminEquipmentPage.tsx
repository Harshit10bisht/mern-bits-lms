import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  createEquipment,
  deleteEquipment,
  listEquipment,
  updateEquipment,
  type Equipment,
  type EquipmentPayload,
} from "../api/equipment";

const initialForm: EquipmentPayload = {
  name: "",
  category: "",
  description: "",
  condition: "good",
  quantity: 1,
};

const AdminEquipmentPage = () => {
  const queryClient = useQueryClient();
  const { data: equipment = [] } = useQuery({
    queryKey: ["equipment", {}],
    queryFn: () => listEquipment({}),
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  });
  const [form, setForm] = useState<EquipmentPayload>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const invalidateEquipment = () =>
    queryClient.invalidateQueries({ queryKey: ["equipment"] });

  const createMutation = useMutation({
    mutationFn: createEquipment,
    onSuccess: () => {
      toast.success("Equipment added");
      setForm(initialForm);
      invalidateEquipment();
    },
    onError: () => toast.error("Failed to add equipment"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<EquipmentPayload> }) =>
      updateEquipment(id, payload),
    onSuccess: () => {
      toast.success("Equipment updated");
      setEditingId(null);
      setForm(initialForm);
      invalidateEquipment();
    },
    onError: () => toast.error("Failed to update equipment"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEquipment,
    onSuccess: () => {
      toast.success("Equipment removed");
      invalidateEquipment();
    },
    onError: () => toast.error("Failed to delete equipment"),
  });

  const categories = useMemo(
    () => Array.from(new Set(equipment.map((item) => item.category))).sort(),
    [equipment]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const action = editingId
      ? updateMutation.mutate({ id: editingId, payload: form })
      : createMutation.mutate(form);
    return action;
  };

  const startEdit = (item: Equipment) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      condition: item.condition,
      quantity: item.quantity,
      availableQuantity: item.availableQuantity,
    });
  };

  return (
    <div className="page">
      <div className="split-layout">
        <section className="panel">
          <header>
            <h2>{editingId ? "Edit equipment" : "Add new equipment"}</h2>
          </header>
          <form className="equipment-form" onSubmit={handleSubmit}>
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </label>
            <label>
              Category
              <input
                list="category-options"
                value={form.category}
                onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
                required
              />
              <datalist id="category-options">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </label>
            <label>
              Description
              <textarea
                value={form.description ?? ""}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                rows={3}
              />
            </label>
            <label>
              Condition
              <select
                value={form.condition}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    condition: event.target.value as EquipmentPayload["condition"],
                  }))
                }
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </label>
            <label>
              Quantity
              <input
                type="number"
                min={0}
                value={form.quantity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, quantity: Number(event.target.value) }))
                }
                required
              />
            </label>
            <label>
              Available quantity
              <input
                type="number"
                min={0}
                max={form.quantity}
                value={form.availableQuantity ?? form.quantity}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    availableQuantity: Number(event.target.value),
                  }))
                }
              />
            </label>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? "Save changes" : "Add equipment"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setEditingId(null);
                    setForm(initialForm);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="panel">
          <header>
            <h2>Existing equipment</h2>
            <p className="muted-text">
              Manage inventory, update availability, and track condition.
            </p>
          </header>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Condition</th>
                  <th>Availability</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {equipment.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.category}</td>
                    <td>
                      <span className={`badge badge-${item.condition}`}>{item.condition}</span>
                    </td>
                    <td>
                      {item.availableQuantity} / {item.quantity}
                    </td>
                    <td className="table-actions table-actions--nowrap">
                      <div className="table-actions__group">
                        <button type="button" className="btn-secondary" onClick={() => startEdit(item)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => deleteMutation.mutate(item._id)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminEquipmentPage;

