import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../lib/api";

export const useDispatchJob = (jobId) => {
  return useQuery({
    queryKey: ["dispatch", jobId],
    queryFn: async () => {
      const { data } = await api.get(`/mail/status/${jobId}`);
      return data.data;
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "queued" || status === "processing") {
        return 2000;
      }
      return false;
    },
  });
};

export const useUserJobs = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ["dispatch", "jobs", page, limit],
    queryFn: async () => {
      const { data } = await api.get(`/mail/jobs?page=${page}&limit=${limit}`);
      return data.data;
    },
  });
};

export const useDispatchEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dispatchData) => {
      const { data } = await api.post("/mail/dispatch", dispatchData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dispatch", "jobs"] });
    },
  });
};
