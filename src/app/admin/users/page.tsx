// app/admin/users/page.tsx
"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

interface Account {
  id: string;
  username: string;
}

export default function UsersPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin"); // admin / user
  const [adminList, setAdminList] = useState<Account[]>([]);
  const [userList, setUserList] = useState<Account[]>([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true); // Tambahkan state loading

  const fetchAdmins = async () => {
    const querySnapshot = await getDocs(collection(db, "admins"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      username: doc.data().username,
    }));
    setAdminList(data);
  };

  const fetchUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      username: doc.data().username,
    }));
    setUserList(data);
  };

  const handleAddAccount = async () => {
    setError("");
    setSuccess("");
    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      return;
    }

    try {
      const data =
        role === "admin"
          ? { username, password }
          : { username, password, hasVoted: false };

      const targetCollection = role === "admin" ? "admins" : "users";

      await addDoc(collection(db, targetCollection), data);

      setUsername("");
      setPassword("");
      setSuccess(`Akun ${role} berhasil ditambahkan.`);

      // refresh list
      if (role === "admin") fetchAdmins();
      else fetchUsers();
    } catch (err) {
      console.error("Error tambah akun:", err);
      setError("Gagal menambahkan akun.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAdmins(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-xl text-gray-700">Memuat data akun...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-xl p-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center gap-3">
          <span className="text-indigo-600">👤</span> Kelola Akun
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tambah Akun Baru Section */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 pb-3 border-indigo-200">
              Tambah Akun Baru
            </h2>
            {error && (
              <p className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </p>
            )}
            {success && (
              <p className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                {success}
              </p>
            )}
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Masukkan username"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="Masukkan password"
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="role" className="block text-gray-700 text-sm font-medium mb-2">
                Peran Akun
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="admin">Admin</option>
                <option value="user">User Pemilih</option>
              </select>
            </div>
            <button
              onClick={handleAddAccount}
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Tambah Akun
            </button>
          </div>

          {/* Daftar Akun Section */}
          <div className="grid grid-rows-2 gap-8">
            {/* Daftar Admin */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 pb-3 border-indigo-200">
                Daftar Admin
              </h2>
              {adminList.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {adminList.map((admin) => (
                    <li key={admin.id} className="flex items-center">
                      <span className="text-indigo-500 mr-2">●</span> {admin.username}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Belum ada akun admin.</p>
              )}
            </div>

            {/* Daftar User Pemilih */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-5 border-b-2 pb-3 border-indigo-200">
                Daftar User Pemilih
              </h2>
              {userList.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  {userList.map((user) => (
                    <li key={user.id} className="flex items-center">
                      <span className="text-indigo-500 mr-2">●</span> {user.username}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Belum ada akun user pemilih.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}