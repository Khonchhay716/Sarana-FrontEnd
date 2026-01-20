import React, { useState } from "react";

const PasswordPBKDF2Hash = () => {
    const [password, setPassword] = useState("");
    const [hash, setHash] = useState("");

    console.log("password ", password);
    console.log("password hash ", hash);

    const handleHash = async () => {
        const encoder = new TextEncoder();
        const salt = crypto.getRandomValues(new Uint8Array(16)); // generate random salt
        const passwordKey = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveBits"]
        );

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 100000,
                hash: "SHA-256",
            },
            passwordKey,
            256 // output bits (256 = 32 bytes)
        );

        const derivedArray = Array.from(new Uint8Array(derivedBits));
        const base64Hash = btoa(String.fromCharCode(...derivedArray));

        setHash(base64Hash);
    };

    return (
        <div className="p-6 bg-white rounded shadow space-y-4 max-w-md mx-auto">
            <h2 className="text-lg font-bold">PBKDF2 Password Hash</h2>
            <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="border p-2 w-full rounded"
            />
            <button
                onClick={handleHash}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Hash with PBKDF2
            </button>
            {hash && (
                <div className="break-all">
                    <strong>PBKDF2 Base64 Hash:</strong>
                    <p className="text-sm text-gray-700">{hash}</p>
                </div>
            )}
        </div>
    );
};

export default PasswordPBKDF2Hash;
