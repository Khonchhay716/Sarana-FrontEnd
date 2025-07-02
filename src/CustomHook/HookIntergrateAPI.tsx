import { useState } from "react";
import alertify from "alertifyjs";
import "alertifyjs/build/css/alertify.min.css";
import { useRefreshTable } from "../AllContext/context";

export function HookIntergrateAPI<T>() {
  const [loading, setLoading] = useState(false);
  const { setRefreshTables } = useRefreshTable();

  /// create data in api
  const createData = async (url: string, data: T, onSuccess?: () => void) => {
    setLoading(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // alertify.success("Create Successfully");
        onSuccess?.();
        setRefreshTables(new Date());
      } else {
        const err = await response.json();
        alert("Failed to create item: " + (err?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /// delete data in api
  const DeleteData = async (url: string, id: number) => {
    const confirmed = window.confirm(`Are you sure you want to delete this product? that have id : ${id}`);
    if (confirmed) {
      try {
        const response = await fetch(`${url}/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setRefreshTables(new Date());
          alertify.success('Delete Successfuly!!');
        } else {
          console.error("Failed to delete product.");
        }
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  }

  /// get data by id
  const GetDatabyID = async (url: string, id: number) => {
    try {
      const response = await fetch(`${url}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
      });

      if (response.ok) {
        const data: T = await response.json();
        // console.log(data);
        return data;
      } else {
        const err = await response.json();
        alert("Failed to fetch data: " + (err?.message || "Unknown error"));
        return null;
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong.");
      return null;
    }

  }

  /// get data all 
  const GetDataAll = async (url: string) => {
    try {
      const response = await fetch(`${url}`);
      if (response.ok) {
        const data: T = await response.json();
        return data;
      } else {
        const err = await response.json();
        alert("Failed to fetch data: " + (err?.message || "Unknown error"));
        return null;
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong.");
      return null;
    }

  }


  /// update data in API
  const updateData = async (url: string, id: number, data: T, onSuccess?: () => void) => {
    setLoading(true);
    try {
      const response = await fetch(`${url}/${id}`, {
        method: "PUT", // Use "PATCH" if your API supports partial updates
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // alertify.success("Updated successfully");
        onSuccess?.();
        setRefreshTables(new Date());
      } else {
        const err = await response.json();
        alert("Failed to update item: " + (err?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("API error:", error);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };



  // /// get data all API
  // function GetDataAll<T>(url: string) {
  //   const [data, setData] = useState<T | null>(null);
  //   const [loading, setLoading] = useState<boolean>(true);
  //   const [error, setError] = useState<string | null>(null);

  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await fetch(url, {
  //         method: "GET",
  //         headers: { "Content-Type": "application/json" },
  //       });

  //       if (response.ok) {
  //         const result: T = await response.json();
  //         setData(result);
  //       } else {
  //         const err = await response.json();
  //         setError(err?.message || "Unknown error");
  //       }
  //     } catch (error) {
  //       console.error("Fetch error:", error);
  //       setError("Something went wrong.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   useEffect(() => {
  //     fetchData();
  //   }, [url]);
  // }

  return {GetDataAll, createData, DeleteData, GetDatabyID, loading, updateData };
}



