"use client";

import { useState, useEffect } from "react";
import { db } from "../../../../lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"; // Import icons

interface Candidate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function CandidatesPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal open/close

  const fetchCandidates = async () => {
    try {
      const snapshot = await getDocs(collection(db, "candidates"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Candidate[];
      setCandidates(data);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setError("Gagal memuat daftar kandidat.");
    }
  };

  const handleAddOrUpdate = async () => {
    setError("");
    setSuccess("");

    if (!name.trim() || !description.trim() || (!imageFile && !editingId)) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    try {
      setUploading(true);
      let imageUrl = imagePreview; // Use current preview if no new file is selected

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "unsigned_voting"); // Pastikan ini sesuai dengan preset Cloudinary Anda

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "https://api.cloudinary.com/v1_1/dwy5gp05w/image/upload", true);

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percent);
          }
        };

        const uploadPromise = new Promise<Response>((resolve, reject) => {
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(new Response(xhr.responseText));
            } else {
              reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
            }
          };
          xhr.onerror = () => reject(new Error("Upload gagal"));
        });

        xhr.send(formData);
        const response = await uploadPromise;
        const data = await response.json();
        imageUrl = data.secure_url;
      }

      if (editingId) {
        await updateDoc(doc(db, "candidates", editingId), {
          name,
          description,
          ...(imageUrl && { imageUrl }),
        });
        setSuccess("Kandidat berhasil diperbarui.");
      } else {
        await addDoc(collection(db, "candidates"), {
          name,
          description,
          imageUrl,
        });
        setSuccess("Kandidat berhasil ditambahkan.");
      }

      resetForm();
      fetchCandidates();
      setIsModalOpen(false); // Close modal after success
    } catch (err) {
      console.error("Gagal menambah/memperbarui kandidat:", err);
      setError("Gagal menambah/memperbarui kandidat. Pastikan format gambar benar.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kandidat ini?")) {
      try {
        await deleteDoc(doc(db, "candidates", id));
        setSuccess("Kandidat berhasil dihapus.");
        fetchCandidates();
      } catch (err) {
        console.error("Error deleting candidate:", err);
        setError("Gagal menghapus kandidat.");
      }
    }
  };

  const handleEdit = (cand: Candidate) => {
    setEditingId(cand.id);
    setName(cand.name);
    setDescription(cand.description);
    setImagePreview(cand.imageUrl);
    setIsModalOpen(true); // Open modal for editing
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setUploadProgress(0);
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
          Kelola Kandidat Pemilihan
        </h1>

        {/* Action Button for Adding New Candidate */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Tambah Kandidat Baru
          </button>
        </div>

        {/* Candidates List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {candidates.length === 0 && (
            <p className="col-span-full text-center text-gray-600">Belum ada kandidat terdaftar.</p>
          )}
          {candidates.map((cand) => (
            <div
              key={cand.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:scale-102 transition duration-300 ease-in-out"
            >
              <img
                src={cand.imageUrl || "/default-placeholder.png"} // Fallback image
                alt={cand.name}
                className="w-full h-56 object-cover"
              />
              <div className="p-5">
                <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">
                  {cand.name}
                </h2>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {cand.description}
                </p>
                <div className="flex justify-between items-center space-x-2">
                  <button
                    onClick={() => handleEdit(cand)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition duration-150 ease-in-out"
                  >
                    <PencilIcon className="h-4 w-4 mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cand.id)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-800 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" /> Hapus
                  </button>
                  <button
                    onClick={() => setViewCandidate(cand)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-800 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" /> Lihat
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Candidate Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fade-in-up">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {editingId ? "Edit Kandidat" : "Tambah Kandidat Baru"}
              </h2>

              {error && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              {success && (
                <div
                  className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <span className="block sm:inline">{success}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nama Kandidat
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Nama Lengkap Kandidat"
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    placeholder="Deskripsi singkat tentang kandidat (visi, misi, dll.)"
                    rows={4}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm resize-y"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div>
                  <label
                    htmlFor="image"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Gambar Kandidat
                  </label>
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setImageFile(file);
                      if (file) {
                        setImagePreview(URL.createObjectURL(file));
                      } else if (!editingId) {
                        setImagePreview(null); // Clear preview if not editing and no file
                      }
                    }}
                  />
                  {uploading && (
                    <div className="mt-2 text-blue-600 text-sm flex items-center">
                      <span className="mr-2">Mengunggah gambar...</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{uploadProgress}%</span>
                    </div>
                  )}
                  {imagePreview && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-48 w-auto object-contain rounded-lg shadow-md border border-gray-200"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAddOrUpdate}
                  className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                  disabled={uploading}
                >
                  {uploading
                    ? "Mengunggah..."
                    : editingId
                    ? "Perbarui Kandidat"
                    : "Tambah Kandidat"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal View Candidate Details */}
        {viewCandidate && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative animate-fade-in-up">
              <button
                onClick={() => setViewCandidate(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <div className="flex flex-col items-center">
                <img
                  src={viewCandidate.imageUrl || "/default-placeholder.png"}
                  alt={viewCandidate.name}
                  className="w-full h-64 object-cover rounded-lg mb-4 shadow-md"
                />
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">
                  {viewCandidate.name}
                </h2>
                <p className="text-lg text-gray-700 text-center leading-relaxed">
                  {viewCandidate.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}