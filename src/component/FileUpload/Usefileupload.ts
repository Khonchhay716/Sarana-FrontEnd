import { useState } from "react";
import { alertError } from "../../HtmlHelper/Alert";
import { AxiosApi } from "../Axios/Axios";

export const useFileUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [uploading, setUploading] = useState(false);

    // ✅ Preview តែប៉ុណ្ណោះ — មិន Upload ទៅ Server
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
    };

    // ✅ Clear file និង preview
    const handleRemove = () => {
        setFile(null);
        setPreview("");
    };

    // ✅ Upload ពិតប្រាកដ — Call តែពេល Submit
    const uploadFile = async (): Promise<string | null> => {
        if (!file) return null;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append("file", file);
            const res = await AxiosApi.post("FileStorage/upload", fd, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return res?.data?.url ?? null;
        } catch (error) {
            alertError("Upload failed! Please try again.");
            return null;
        } finally {
            setUploading(false);
        }
    };

    // ✅ Set URL ចាស់ (ប្រើពេល Edit)
    const setExistingUrl = (url: string) => {
        setPreview(url);
        // ✅ file នៅ null — hasNewFile នៅ false
    };

    return {
        file,
        preview,
        uploading,
        hasNewFile: file !== null, // ✅ true = User ជ្រើស File ថ្មី, false = URL ចាស់
        handleFileChange,
        handleRemove,
        uploadFile,
        setExistingUrl,
    };
};