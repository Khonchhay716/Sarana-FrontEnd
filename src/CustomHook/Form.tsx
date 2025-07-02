import { IoCloseSharp } from "react-icons/io5";
import { useState, useEffect } from "react";

type Product = {
  id?: number;
  [key: string]: any;
};

type OptionItem = {
  label: string;
  value: any;
};

type SingleField = {
  key: string;
  label: string;
  type: string;
  options?: OptionItem[];
  optionAPI?: string;
  className?: string;
  col?: number;
  required?: boolean;
  placeholder?: string;
  accept?: string;
};

type FieldConfig = SingleField | { row: SingleField[] };

type Props = {
  onClose?: () => void;
  onSubmit?: (data: Product) => void;
  productBack?: Product | null;
  formlayout?: FieldConfig[];
  Title?:string
};

export default function FormProduct({ onClose, onSubmit, productBack, formlayout, Title }: Props) {
  const fields: FieldConfig[] = formlayout ?? [];
  const [formData, setFormData] = useState<Product>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [apiOptions, setApiOptions] = useState<Record<string, OptionItem[]>>({});

  useEffect(() => {
    const initialFormData = fields.reduce((acc, field) => {
      const group = "row" in field ? field.row : [field];
      group.forEach((f) => {
        if (productBack && productBack[f.key] !== undefined) {
          acc[f.key] = productBack[f.key];
          if (f.type === "file" && productBack[f.key]) {
            setImagePreviews((prev) => ({ ...prev, [f.key]: productBack[f.key] }));
          }
        } else {
          if (f.type === "checkbox") acc[f.key] = false;
          else if (f.type === "select") acc[f.key] = null;
          else if (f.type === "number") acc[f.key] = 0;
          else acc[f.key] = "";
        }
      });
      return acc;
    }, {} as Product);

    setFormData({ ...initialFormData, id: productBack?.id });
  }, [fields, productBack]);

  useEffect(() => {
    return () => {
      Object.values(imagePreviews).forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [imagePreviews]);

  useEffect(() => {
    fields.forEach((field) => {
      const group = "row" in field ? field.row : [field];
      group.forEach(async (f) => {
        if (f.type === "select" && f.optionAPI) {
          try {
            const res = await fetch(f.optionAPI);
            const data = await res.json();
            const formatted = data.map((item: any) => ({
              label: item.label || item.name || item.title || String(item.id),
              value: item.value ?? item.id ?? item,
            }));
            setApiOptions((prev) => ({ ...prev, [f.key]: formatted }));
          } catch (err) {
            console.error(`Error fetching ${f.key} options:`, err);
          }
        }
      });
    });
  }, [fields]);

  const uploadImage = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://fake.upload.com/${file.name}-${Date.now()}`);
      }, 1000);
    });
  };

  const handleImageUpload = async (key: string, file: File) => {
    if (!file) return;

    const localPreview = URL.createObjectURL(file);
    setImagePreviews((prev) => {
      if (prev[key]?.startsWith("blob:")) {
        URL.revokeObjectURL(prev[key]);
      }
      return { ...prev, [key]: localPreview };
    });

    handleChange(key, localPreview);
    setIsUploading(true);

    try {
      const uploadedUrl = await uploadImage(file);
      handleChange(key, uploadedUrl);

      setImagePreviews((prev) => {
        if (prev[key]?.startsWith("blob:")) {
          URL.revokeObjectURL(prev[key]);
        }
        return { ...prev, [key]: uploadedUrl };
      });
    } catch (error) {
      setErrors((prev) => ({ ...prev, [key]: "Upload failed" }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      const newErr = { ...errors };
      delete newErr[key];
      setErrors(newErr);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      const group = "row" in field ? field.row : [field];
      group.forEach((f) => {
        const value = formData[f.key];
        if (
          f.required &&
          (value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0))
        ) {
          newErrors[f.key] = `${f.label} is required`;
        }
      });
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm() && !isUploading) {
      onSubmit?.(formData);
    }
  };

  const renderField = ({
    key,
    label,
    type,
    options,
    optionAPI,
    col,
    className,
    placeholder,
    required,
    accept,
  }: SingleField) => {
    const allOptions = options ?? apiOptions[key] ?? [];
    const colClass = col ? `col-span-${col}` : "col-span-12";
    const isError = !!errors[key];
    const inputStyle = `w-full p-2 border rounded text-orange-500 ${
      isError ? "border-red-500" : "border-amber-50"
    }`;

    return (
      <div key={key} className={`${colClass} ${className || ""}`}>
        <label className="block font-medium mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {type === "select" ? (
          <select
            value={formData[key] !== null && formData[key] !== undefined ? JSON.stringify(formData[key]) : ""}
            onChange={(e) => {
              const selected = allOptions.find((o) => JSON.stringify(o.value) === e.target.value);
              handleChange(key, selected ? selected.value : null);
            }}
            className={inputStyle}
          >
            <option value="">{placeholder || "Select an option"}</option>
            {allOptions.map((o) => (
              <option key={JSON.stringify(o.value)} value={JSON.stringify(o.value)}>
                {o.label}
              </option>
            ))}
          </select>
        ) : type === "file" ? (
          <>
            <input
              id={key}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => handleImageUpload(key, e.target.files?.[0] as File)}
            />
            <label
              htmlFor={key}
              className={`block p-2 rounded text-center cursor-pointer border ${
                isError ? "border-red-500" : "border-amber-50"
              }`}
            >
              {imagePreviews[key] ? "Change Image" : placeholder || "Choose a file"}
            </label>
            {imagePreviews[key] && (
              <img
                src={imagePreviews[key]}
                alt="preview"
                className="mt-2 h-28 object-cover rounded border"
              />
            )}
          </>
        ) : type === "checkbox" ? (
          <input
            type="checkbox"
            checked={!!formData[key]}
            onChange={(e) => handleChange(key, e.target.checked)}
            className="h-5 w-5"
          />
        ) : type === "radio" && options ? (
          <div className="flex gap-4">
            {options.map((o) => (
              <label key={o.value} className="flex items-center gap-1">
                <input
                  type="radio"
                  name={key}
                  checked={formData[key] === o.value}
                  onChange={() => handleChange(key, o.value)}
                />
                {o.label}
              </label>
            ))}
          </div>
        ) : type === "textarea" ? (
          <textarea
            className={inputStyle}
            value={formData[key] ?? ""}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={4}
          />
        ) : (
          <input
            type={type}
            className={inputStyle}
            value={formData[key] ?? ""}
            onChange={(e) =>
              handleChange(key, type === "number" ? Number(e.target.value) || 0 : e.target.value)
            }
            placeholder={placeholder}
          />
        )}
        {isError && <p className="text-sm text-red-500">{errors[key]}</p>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-gray-800 text-white w-[50%] p-6 rounded-lg shadow-lg max-h-[90%] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{Title??"Name Form"}</h2>
          <button onClick={onClose} className="p-2 rounded bg-red-600 hover:bg-red-700">
            <IoCloseSharp size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field, idx) =>
            "row" in field ? (
              <div key={idx} className="grid grid-cols-12 gap-4">
                {field.row.map((f) => renderField(f))}
              </div>
            ) : (
              renderField(field)
            )
          )}

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="submit"
              className={`px-4 py-2 font-semibold rounded bg-blue-500 hover:bg-blue-600 ${
                isUploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : productBack ? "UPDATE" : "CREATE"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold rounded bg-red-500 hover:bg-red-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
