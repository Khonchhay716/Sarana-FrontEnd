import React, { useState } from "react";

const PasswordHashMatchCSharp = () => {
    const [password, setPassword] = useState("");
    const [hash, setHash] = useState("");
    console.log("password ", password);
    console.log("password hash ", hash);

    const handleHash = async () => {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const base64 = btoa(String.fromCharCode(...hashArray));
        setHash(base64);
    };

    return (
        <div className="p-6 max-w-md mx-auto space-y-4 bg-white shadow rounded">
            <h2 className="text-xl font-bold">Frontend SHA-256 Base64 Hash</h2>
            <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter password"
            />
            <button
                onClick={handleHash}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Hash (match C#)
            </button>
            {hash && (
                <div className="break-all">
                    <strong>Hashed Base64 (same as C#):</strong>
                    <p className="text-sm text-gray-700">{hash}</p>
                </div>
            )}
        </div>
    );
};

export default PasswordHashMatchCSharp;
