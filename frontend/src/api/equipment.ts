import apiClient from "./client";

export interface Equipment {
  _id: string;
  name: string;
  category: string;
  description?: string;
  condition: "excellent" | "good" | "fair" | "poor";
  quantity: number;
  availableQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentFilters {
  category?: string;
  available?: boolean;
  search?: string;
}

export const listEquipment = async (
  filters: EquipmentFilters = {}
): Promise<Equipment[]> => {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (typeof filters.available === "boolean") {
    params.set("available", String(filters.available));
  }
  if (filters.search) params.set("search", filters.search);

  const { data } = await apiClient.get<{ equipment: Equipment[] }>(
    `/equipment?${params.toString()}`
  );
  return data.equipment;
};

export interface EquipmentPayload {
  name: string;
  category: string;
  description?: string;
  condition?: Equipment["condition"];
  quantity: number;
  availableQuantity?: number;
}

export const createEquipment = async (payload: EquipmentPayload) => {
  const { data } = await apiClient.post<{ equipment: Equipment }>(
    "/equipment",
    payload
  );
  return data.equipment;
};

export const updateEquipment = async (
  id: string,
  payload: Partial<EquipmentPayload>
) => {
  const { data } = await apiClient.put<{ equipment: Equipment }>(
    `/equipment/${id}`,
    payload
  );
  return data.equipment;
};

export const deleteEquipment = async (id: string) => {
  await apiClient.delete(`/equipment/${id}`);
};

