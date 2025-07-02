import { useState } from "react";

export default function ImageUploader() {
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Create a local URL for the file
      const localUrl = URL.createObjectURL(file);

      // Set this URL to state to use as image src
      setImageUrl(localUrl);
      console.log(URL.createObjectURL(file));

      // Optional: Revoke URL later to free memory when no longer needed
      // URL.revokeObjectURL(localUrl);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      {imageUrl && (
        <img
          src={imageUrl}
          alt="preview"
          style={{ width: "150px", height: "150px", objectFit: "cover" }}
        />
      )}
    </div>
  );
}
