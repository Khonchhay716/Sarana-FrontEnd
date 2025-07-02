import { IoCloseSharp } from "react-icons/io5";
import { useState, useEffect } from "react";

type Product = {
  id?: number;
  [key: string]: any;
};

type SingleField = {
  key: string;
  label: string;
  type: string;
  options?: string[];
  className?: string;
  col?: number; // Column span (1-12)
  required?: boolean;
  placeholder?: string;
};

type FieldConfig = SingleField | { row: SingleField[] };

type Props = {
  onClose?: () => void;
  onSubmit?: (data: Product) => void;
  productBack?: Product | null;
  formlayout?: FieldConfig[];
};

export default function FormProduct({
  onClose,
  onSubmit,
  productBack,
  formlayout,
}: Props) {
  const fields: FieldConfig[] = formlayout ?? [];

  const [formData, setFormData] = useState<Product>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const initialFormData = fields.reduce((acc, field) => {
      const fieldArray = "row" in field ? field.row : [field];
      fieldArray.forEach((f) => {
        if (productBack && productBack[f.key] !== undefined) {
          acc[f.key] = productBack[f.key];
        } else {
          if (f.type === "checkbox") acc[f.key] = false;
          else if (f.type === "select") acc[f.key] = "";
          else if (f.type === "number") acc[f.key] = 0; // Initialize numbers as null
          else acc[f.key] = "";
        }
      });
      return acc;
    }, {} as Product);

    setFormData({ ...initialFormData, id: productBack?.id });
  }, [fields, productBack]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    fields.forEach((field) => {
      const fieldArray = "row" in field ? field.row : [field];
      fieldArray.forEach((f) => {
        if (f.required) {
          const value = formData[f.key];
          if (
            value === undefined ||
            value === null ||
            value === "" ||
            (f.type === "number" && isNaN(value)) || // Handle NaN cases
            (Array.isArray(value) && value.length === 0)
          ) {
            newErrors[f.key] = `${f.label} is required`;
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const renderField = ({ key, label, type, options, className, col, required, placeholder }: SingleField) => {
    const colClasses = [
      "", // 0
      "col-span-1", // 1
      "col-span-2", // 2
      "col-span-3", // 3
      "col-span-4", // 4
      "col-span-5", // 5
      "col-span-6", // 6
      "col-span-7", // 7
      "col-span-8", // 8
      "col-span-9", // 9
      "col-span-10", // 10
      "col-span-11", // 11
      "col-span-12", // 12
    ];
    
    const colClass = col ? colClasses[col] : 'col-span-12';
    const isError = !!errors[key];
    
    return (
      <div key={key} className={`${colClass} ${className || ''}`}>
        <label className="block font-medium mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {type === "radio" && options ? (
          <div className="flex space-x-4">
            {options.map((opt) => (
              <label key={opt} className="flex items-center space-x-1">
                <input
                  type="radio"
                  name={key}
                  value={opt}
                  checked={formData[key] === opt}
                  onChange={() => handleChange(key, opt)}
                  className={isError ? "border-red-500" : ""}
                />
                <span>{opt}</span>
              </label>
            ))}
          </div>
        ) : type === "checkbox" ? (
          <input
            type="checkbox"
            checked={!!formData[key]}
            onChange={(e) => handleChange(key, e.target.checked)}
            className={`h-5 w-5 ${isError ? "border-red-500" : ""}`}
          />
        ) : type === "select" && options ? (
          <select
            value={formData[key] ?? ""}
            onChange={(e) => handleChange(key, e.target.value)}
            className={`w-full p-2 border rounded text-orange-500 ${
              isError ? "border-red-500" : "border-amber-50"
            }`}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            value={formData[key] ?? ""}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={4}
            className={`w-full p-2 border rounded text-orange-500 ${
              isError ? "border-red-500" : "border-amber-50"
            }`}
            placeholder={placeholder}
          />
        ) : (
          <input
            type={type}
            value={type === "number" 
              ? formData[key] === null ? "" : formData[key] 
              : formData[key] ?? ""}
            onChange={(e) =>
              handleChange(
                key,
                type === "number"
                  ? e.target.value === ""
                    ? 0
                    : Number(e.target.value)
                  : e.target.value
              )
            }
            className={`w-full p-2 border rounded text-orange-500 ${
              isError ? "border-red-500" : "border-amber-50"
            }`}
            placeholder={placeholder}
          />
        )}
        {isError && (
          <p className="mt-1 text-sm text-red-500">{errors[key]}</p>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60">
      <div className="rounded-lg p-6 shadow-lg w-[50%] bg-gray-800 text-white max-h-[90%] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{productBack ? "Update" : "Create"} Product</h2>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
          >
            <IoCloseSharp size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field, index) =>
            "row" in field ? (
              <div key={index} className="grid grid-cols-12 gap-4">
                {field.row.map((f) => renderField(f))}
              </div>
            ) : (
              renderField(field)
            )
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="w-[120px] h-[40px] bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold text-sm"
            >
              {productBack ? "UPDATE" : "CREATE"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-[120px] h-[40px] bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm ml-2.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}