import api from "./axiosInstance";

export async function useAzure(environment = "dev") {
  const res = await api.post("/cloud/azure/provision", { environment });
  return res.data;
}

export async function destroyAzure(environment = "dev") {
  const res = await api.post("/cloud/azure/destroy", { environment });
  return res.data;
}

export async function getAzureStatus(environment = "dev") {
  const res = await api.get("/cloud/azure/status", {
    params: { environment },
  });
  return res.data;
}
