import { useState } from "react";
import { AxiosApi } from "../Axios/Axios";
import { alertError } from "../../HtmlHelper/Alert";

export const useFileUpload = () => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");
    const [uploading, setUploading] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);

    // Preview តែប៉ុណ្ណោះ — មិន Upload ទៅ Server
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        setFile(selected);
        setPreview(URL.createObjectURL(selected));
        setIsRemoved(false);
    };

    // Clear file + Mark ថា User លុបរូបភាព
    const handleRemove = () => {
        setFile(null);
        setPreview("");
        setIsRemoved(true);
    };

    // Delete រូបភាពចាស់ពី Server/Cloudinary (non-blocking)
    const deleteImage = async (imageUrl: string) => {
        if (!imageUrl) return;
        try {
            await AxiosApi.delete(`FileStorage/delete?fileUrl=${encodeURIComponent(imageUrl)}`);
        } catch (error) {
            console.error("Image delete failed (non-blocking):", error);
        }
    };

    // Upload File ថ្មី — Call តែពេល Submit
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

    // Set URL ចាស់ (ប្រើពេល Edit)
    const setExistingUrl = (url: string) => {
        setPreview(url);
        setIsRemoved(false);
    };

    return {
        file,
        preview,
        uploading,
        hasNewFile: file !== null,
        isRemoved,
        handleFileChange,
        handleRemove,
        deleteImage,
        uploadFile,
        setExistingUrl,
    };
};