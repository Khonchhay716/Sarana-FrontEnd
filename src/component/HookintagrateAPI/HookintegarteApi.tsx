import { useState } from "react";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.min.css";
import { alertError } from "../../HtmlHelper/Alert";
import { AxiosApi, AxiosFileApi } from "../Axios/Axios";
import { useRefreshTable } from "../../AllContext/context";



interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: any;
  metadata: any;
  requestId: string;
  apiVersion: string;
  timestamp: string;
  uiMessage: string | null;
  warnings: any;
}

export function HookIntergrateAPI<T>() {
  const [loading, setLoading] = useState(false);
  const { setRefreshTables } = useRefreshTable();

  const createData = async (url: string, data: T, onSuccess?: (responseData?: T) => void, hodeAlertSuccess?: boolean, onError?: () => void) => {
    setLoading(true);
    try {
      const res = await AxiosApi.post<ApiResponse<T>>(url, data);
      if (res.data.success) {
        onSuccess?.(res.data.data);
        setTimeout(() => { setRefreshTables(new Date()); }, 500);
        if (!hodeAlertSuccess) {
          setTimeout(() => alertify.success("Success"), 500);
        }
        return res.data.data;
      } else {
        const allErrors = Object.values(res.data.errors || {})
          .flat().filter(Boolean).join(" | ");
        alertError("Failed to create item: " + allErrors);
        onError?.();
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.log("Unauthorized - 401");
        return;
      }
      console.error(error);
      alertError(error?.response?.data?.message || error?.message || "Something went wrong.");
      onError?.(); // ✅ Call ពេល Exception
    } finally {
      setTimeout(() => { setLoading(false); }, 500);
    }
  };

  const createFormData = async (url: string, formData: FormData, onSuccess?: () => void) => {
    setLoading(true);
    try {
      const res = await AxiosFileApi.post<ApiResponse<T>>(url, formData);
      if (res.data.success) {
        onSuccess?.();
        setRefreshTables(new Date());
        setTimeout(() => alertify.success("Create Successfully"), 500);
      } else {
        const allErrors = Object.values(res.data.errors || {})
          .flat().filter(Boolean).join(" | ");
        alertError("Failed to create item: " + allErrors);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.log("Unauthorized - 401");
        return;
      }
      console.error(error);
      alertError(error?.response?.data?.message || error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const DeleteData = async (url: string, id: number) => {
    try {
      const res = await AxiosApi.delete<ApiResponse<T>>(`${url}/${id}`);
      if (res.data.success) {
        setTimeout(() => alertify.success("Delete Successfully!!"), 500);
      } else {
        const message = res.data.message || "Unknown error";
        alertError("Failed to delete data: " + message);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.log("Unauthorized - 401");
        return;
      }
      console.error(error);
      alertError(error?.response?.data?.message || error?.message || "Something went wrong.");
    }
  };

  const GetDatabyID = async (url: string, id: number, subUrl?: string) => {
    try {
      const finalUrl = subUrl ? `${url}/${id}/${subUrl}` : `${url}/${id}`;
      const res = await AxiosApi.get<ApiResponse<T>>(finalUrl);
      if (res.data.success) {
        return res.data.data;
      } else {
        alertError("Failed to fetch data: " + (res.data.message || "Unknown error"));
        return null;
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.log("Unauthorized - 401");
        return;
      }
      console.error(error);
      alertError(error?.response?.data?.message || "API error: 404 Not Found");
      return null;
    }
  };

  const GetDatabyIDForm = async (url: string, id: number) => {
    try {
      const res = await AxiosFileApi.get<ApiResponse<T>>(`${url}/${id}`);
      if (res.data.success) {
        return res.data.data;
      } else {
        alertError("Failed to fetch data: " + (res.data.message || "Unknown error"));
        return null;
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.log("Unauthorized - 401");
        return;
      }
      console.error(error);
      alertError(error?.response?.data?.message || "API error: 404 Not Found");
      return null;
    }
  };

  const GetDataAll = async (url: string) => {
    try {
      const res = await AxiosApi.get<T>(url);
      return res.data;
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.log("Unauthorized - 401");
        return;
      }
      console.error(error);
      alertError(error?.response?.data?.message || "Something went wrong.");
      return null;
    }
  };

  const updateData = async (url: string, id: number, data: T, onSuccess?: () => void, subUrl?: string, onError?: () => void) => {
    setLoading(true);
    try {
      const res = await AxiosApi.put<ApiResponse<T>>(`${url}/${id}${subUrl ? `/${subUrl}` : ''}`, data);
      if (res.data.success) {
        onSuccess?.();
        setTimeout(() => { setRefreshTables(new Date()); }, 500);
        setTimeout(() => alertify.success("Updated successfully"), 500);
      } else {
        const allErrors = Object.values(res.data.errors || {})
          .flat().filter(Boolean).join(" | ") || res.data.message || "Unknown error";
        alertError("Failed to update item: " + allErrors);
        onError?.();
      }
    } catch (error: any) {
      if (error?.response?.status == 401) {
        console.log("Unauthorized - 401");
        return;
      }
      console.error(error);
      alertError(error?.response?.data?.message || error?.message || "Something went wrong.");
      onError?.(); // Call when Exception
    } finally {
      setTimeout(() => { setLoading(false); }, 500);
    }
  };

  const updateFormData = async (url: string, id: number, formData: FormData, onSuccess?: () => void, subUrl?: string) => {
    setLoading(true);
    try {
      const res = await AxiosFileApi.put<ApiResponse<T>>(`${url}/${id}${subUrl ? `/${subUrl}` : ''}`, formData);
      if (res.data.success) {
        onSuccess?.();
        setRefreshTables(new Date());
        setTimeout(() => alertify.success("Updated successfully"), 500);
      } else {
        const allErrors = Object.values(res.data.errors || {})
          .flat().filter(Boolean).join(" | ") || res.data.message || "Unknown error";
        alertError("Failed to update item: " + allErrors);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.log("Unauthorized - 401");
        return;
      }
      console.error(error);
      alertError(error?.response?.data?.message || error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData2 = async (url: string, id: number, formData: FormData, onSuccess?: () => void, subUrl?: string) => {
    setLoading(true);
    try {
      const res = await AxiosFileApi.put<ApiResponse<T>>(`${url}?id=${id}${subUrl ? `/${subUrl}` : ''}`, formData);
      if (res.data.success) {
        onSuccess?.();
        setRefreshTables(new Date());
        setTimeout(() => alertify.success("Updated successfully"), 500);
      } else {
        const allErrors = Object.values(res.data.errors || {})
          .flat().filter(Boolean).join(" | ") || res.data.message || "Unknown error";
        alertError("Failed to update item: " + allErrors);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        console.log("Unauthorized - 401");
        return;
      }
      console.error(error);
      alertError(error?.response?.data?.message || error?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return {
    GetDataAll,
    createData,
    createFormData,
    updateFormData,
    updateFormData2,
    DeleteData,
    GetDatabyID,
    GetDatabyIDForm,
    loading,
    updateData,
  };
}