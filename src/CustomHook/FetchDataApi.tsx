import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useRefreshTable } from "../AllContext/context";

const useFetchDataApi = (url: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [data, setData] = useState([]);
  const { refreshTables } = useRefreshTable();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await axios.get(url);
      setData(response.data);
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [refreshTables]);

  return { isError, isLoading, data };
};

export default useFetchDataApi;
