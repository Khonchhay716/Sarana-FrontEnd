import React, { useState } from "react";
import bcrypt from "bcryptjs";

////// note //////
// if encrypt it to comapre can not match because value is change , if use like this it will true 
// bcrypt.compareSync("mypassword", storedHash); // ✅ true   for frondned 
// BCrypt.Net.BCrypt.Verify("mypassword", user.PasswordHash); // ✅ true   for backend 
////// note //////


const BcryptHashExample = () => {
  const [password, setPassword] = useState("");
  const [hash, setHash] = useState("");

      console.log("password ", password);
    console.log("password hash ", hash);

  const handleHash = () => {
    const hashed = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    setHash(hashed);
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded shadow space-y-4">
      <h2 className="text-xl font-bold">bcryptjs Password Hash</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="w-full p-2 border rounded"
      />
      <button
        onClick={handleHash}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Hash Password
      </button>
      {hash && (
        <div className="break-all">
          <strong>Hashed Password:</strong>
          <p className="text-sm text-gray-700">{hash}</p>
        </div>
      )}
    </div>
  );
};

export default BcryptHashExample;
