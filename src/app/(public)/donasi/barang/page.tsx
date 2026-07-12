"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { AlertModal } from "@/components/ui/AlertModal";
import imageCompression from "browser-image-compression";
import { useAuth } from "@/hooks/useAuth";
import {
  MdOutlinePerson,
  MdOutlineAssignment,
  MdOutlineInventory2,
  MdOutlineShoppingCart,
  MdClose,
  MdDelete,
  MdEdit,
  MdCloudUpload,
  MdAddShoppingCart,
  MdCheckCircle,
} from "react-icons/md";

type CatalogItem = {
  id: string;
  itemName: string;
  category: string;
  stock: number;
  target_qty: number;
  unit: string;
  remaining_need: number;
  is_disabled: boolean;
  virtual_stock: number;
  next_available_date: string;
};

const kategoriOptions = [
  "Sembako & Pangan Dasar",
  "Peralatan Pendidikan",
  "Pakaian & Aksesoris",
  "Perlengkapan Bayi",
  "Obat & Suplemen",
  "Lainnya (Non Spesifik)",
];

const kondisiOptions = ["Baru / Segel", "Bekas Layak Pakai", "Perlu Sortir"];

/* ───── TYPES ───── */
type CartItem = {
  id: string;
  source: "MANUAL" | "KATALOG";
  item_name: string;
  item_category: string;
  item_qty: string;
  item_condition: string;
  item_description: string;
  photoName: string | null;
  photoFile?: File | null;
};

export default function DonasiBarangCheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Global States
  const [identity, setIdentity] = useState({
    donor_name: "",
    donor_phone: "",
    donor_email: "",
  });

  useEffect(() => {
    if (user) {
      const savedPhone = typeof window !== "undefined"
        ? localStorage.getItem("user_phone") ?? ""
        : "";
      setIdentity((prev) => ({
        ...prev,
        donor_name:  prev.donor_name  || (user as any).name  || "",
        donor_email: prev.donor_email || (user as any).email || "",
        donor_phone: prev.donor_phone || (user as any).phone || savedPhone,
      }));
    }
  }, [user]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<"MANUAL" | "KATALOG">("KATALOG");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleImageCompression = async (file: File): Promise<File> => {
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
        fileType: "image/webp",
      };
      return await imageCompression(file, options);
    } catch (error) {
      console.error("Compression error:", error);
      return file;
    }
  };

  // Manual Form States
  const manualFileInputRef = useRef<HTMLInputElement>(null);
  const [manualForm, setManualForm] = useState({
    item_name: "",
    item_category: "",
    item_qty: "",
    item_condition: "Baru / Segel",
    item_description: "",
  });
  const [manualPhotoName, setManualPhotoName] = useState<string | null>(null);
  const [manualPhotoFile, setManualPhotoFile] = useState<File | null>(null);

  // Catalog Form States
  const catalogFileInputRef = useRef<HTMLInputElement>(null);
  const [catalogNeeds, setCatalogNeeds] = useState<CatalogItem[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);
  const [selectedNeed, setSelectedNeed] = useState<CatalogItem | null>(null);
  const [catalogQty, setCatalogQty] = useState("");
  const [catalogPhotoName, setCatalogPhotoName] = useState<string | null>(null);
  const [catalogPhotoFile, setCatalogPhotoFile] = useState<File | null>(null);

  React.useEffect(() => {
    if (catalogNeeds.length === 0) {
      setIsLoadingCatalog(true);
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/public/katalog-kebutuhan`,
        { credentials: "include" },
      )
        .then((res) => res.json())
        .then((json) => {
          if (json.status === "success") {
            setCatalogNeeds(json.data);
          }
        })
        .finally(() => setIsLoadingCatalog(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ───── HANDLERS ───── */
  const handleIdentityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdentity({ ...identity, [e.target.id]: e.target.value });
  };

  const handleManualFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setManualForm({ ...manualForm, [e.target.id]: e.target.value });
  };

  const handleAddManual = async () => {
    if (
      !manualForm.item_name ||
      !manualForm.item_category ||
      !manualForm.item_qty
    ) {
      setAlertMessage("Nama Barang, Kategori, dan Jumlah wajib diisi.");
      setShowAlert(true);
      return;
    }

    const isExactMatch = catalogNeeds.some(
      (inv) => inv.itemName.toLowerCase() === manualForm.item_name.trim().toLowerCase()
    );

    if (isExactMatch) {
      setAlertMessage(`Barang "${manualForm.item_name.trim()}" sudah ada di dalam katalog. Silakan pilih dari menu katalog untuk mencegah data ganda.`);
      setShowAlert(true);
      return;
    }

    const parsedQty = parseInt(manualForm.item_qty);
    if (isNaN(parsedQty) || parsedQty < 1) {
      setAlertMessage("Jumlah barang harus minimal 1.");
      setShowAlert(true);
      return;
    }

    setIsCompressing(true);
    let finalPhotoFile = manualPhotoFile;
    let finalPhotoName = manualPhotoName;

    if (manualPhotoFile) {
      finalPhotoFile = await handleImageCompression(manualPhotoFile);
      finalPhotoName = finalPhotoFile.name;
    }

    const newItem: CartItem = {
      id: Date.now().toString(),
      source: "MANUAL",
      ...manualForm,
      photoName: finalPhotoName,
      photoFile: finalPhotoFile,
    };
    setCartItems([...cartItems, newItem]);

    // Reset Manual Form
    setManualForm({
      item_name: "",
      item_category: "",
      item_qty: "",
      item_condition: "Baru / Segel",
      item_description: "",
    });
    setManualPhotoName(null);
    setManualPhotoFile(null);
    setIsCompressing(false);
  };

  const handleAddCatalog = async () => {
    if (!selectedNeed || !catalogQty) {
      setAlertMessage("Silakan pilih barang dari katalog dan masukkan jumlahnya.");
      setShowAlert(true);
      return;
    }

    const parsedQty = parseInt(catalogQty);
    if (isNaN(parsedQty) || parsedQty < 1) {
      setAlertMessage("Jumlah donasi harus minimal 1.");
      setShowAlert(true);
      return;
    }

    setIsCompressing(true);
    let finalPhotoFile = catalogPhotoFile;
    let finalPhotoName = catalogPhotoName;

    if (catalogPhotoFile) {
      finalPhotoFile = await handleImageCompression(catalogPhotoFile);
      finalPhotoName = finalPhotoFile.name;
    }

    const newItem: CartItem = {
      id: selectedNeed.id,
      source: "KATALOG",
      item_name: selectedNeed.itemName,
      item_category: selectedNeed.category,
      item_qty: catalogQty,
      item_condition: "Baru / Segel",
      item_description: "Dari Katalog Panti",
      photoName: finalPhotoName,
      photoFile: finalPhotoFile,
    };
    setCartItems([...cartItems, newItem]);

    // Reset Catalog Form
    setSelectedNeed(null);
    setCatalogQty("");
    setCatalogPhotoName(null);
    setCatalogPhotoFile(null);
    setIsCompressing(false);
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleEditItem = (item: CartItem) => {
    // Populate back to the respective form
    if (item.source === "MANUAL") {
      setActiveTab("MANUAL");
      setManualForm({
        item_name: item.item_name,
        item_category: item.item_category,
        item_qty: item.item_qty,
        item_condition: item.item_condition,
        item_description: item.item_description,
      });
      setManualPhotoName(item.photoName);
      setManualPhotoFile(item.photoFile || null);
    } else {
      setActiveTab("KATALOG");
      const need =
        catalogNeeds.find((n) => n.itemName === item.item_name) || null;
      setSelectedNeed(need);
      setCatalogQty(item.item_qty);
      setCatalogPhotoName(item.photoName);
      setCatalogPhotoFile(item.photoFile || null);
    }
    // Remove from cart so it acts as an "edit move"
    handleRemoveItem(item.id);
    setIsCheckoutOpen(false);
  };

  const submitFinalDonation = async () => {
    if (!identity.donor_name || !identity.donor_phone || !identity.donor_email) {
      setAlertMessage("Mohon lengkapi Identitas Donatur (Nama, WhatsApp, & Email) sebelum checkout.");
      setShowAlert(true);
      setIsCheckoutOpen(false);
      return;
    }
    if (cartItems.length === 0) {
      setAlertMessage("Keranjang donasi masih kosong.");
      setShowAlert(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("donorName", identity.donor_name);
      formData.append("donorPhone", identity.donor_phone);
      if (identity.donor_email) {
        formData.append("donorEmail", identity.donor_email);
      }

      cartItems.forEach((item, index) => {
        formData.append(`items[${index}][id]`, item.source === "KATALOG" ? item.id : "MANUAL");
        formData.append(`items[${index}][name]`, item.item_name);
        formData.append(`items[${index}][qty]`, item.item_qty.toString());
        if (item.photoFile) {
          formData.append(`items[${index}][image]`, item.photoFile);
        }
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/public/donasi-barang`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            // Do NOT set Content-Type to application/json or multipart/form-data manually!
            // Browser sets it with the correct boundary for FormData automatically.
          },
          body: formData,
        },
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.errors?.items) {
          setAlertMessage(`Kapasitas Terbatas: ${data.errors.items[0]}`);
          setShowAlert(true);
        } else {
          throw new Error(data.message || "Gagal memproses donasi.");
        }
        return;
      }

      setCartItems([]);
      setIsCheckoutOpen(false);
      
      const redirectUrl = identity.donor_email 
        ? `/donasi/lacak-donasi/${data.tracking_code}?emailSent=true`
        : `/donasi/lacak-donasi/${data.tracking_code}`;
        
      router.push(redirectUrl);
    } catch (error: any) {
      setAlertMessage(error.message);
      setShowAlert(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <section className="px-6 md:px-12 lg:px-20 py-16 lg:py-24">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-[1.1] text-gray-900 mb-3 italic">
              Formulir Donasi Barang
            </h1>
            <p className="text-gray-500 font-sans text-sm md:text-base">
              Tambahkan beberapa barang sekaligus sebelum melakukan checkout.
            </p>
          </div>

          {/* ═══════════════════════════════════════
              SEKSI 1: IDENTITAS DONATUR
          ═══════════════════════════════════════ */}
          <div className="bg-white/80 backdrop-blur-xl shadow-sm rounded-2xl p-6 md:p-8 border-none">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <MdOutlinePerson className="text-xl" />
              </div>
              <h2 className="font-bold text-xl text-gray-900 font-sans">
                Identitas Donatur
              </h2>
            </div>

            <div className="space-y-5">
              <InputField
                id="donor_name"
                label="Nama Lengkap *"
                placeholder="Masukkan nama sesuai KTP"
                value={identity.donor_name}
                onChange={handleIdentityChange}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  id="donor_phone"
                  label="Nomor WhatsApp *"
                  placeholder="Contoh: 08123456789"
                  type="tel"
                  value={identity.donor_phone}
                  onChange={handleIdentityChange}
                />
                <InputField
                  id="donor_email"
                  label="Alamat Email *"
                  placeholder="nama@email.com"
                  type="email"
                  value={identity.donor_email}
                  onChange={handleIdentityChange}
                />
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              SEKSI 2: SISTEM 2 TAB INPUT BARANG
          ═══════════════════════════════════════ */}
          <div className="bg-white/80 backdrop-blur-xl shadow-sm rounded-2xl p-6 md:p-8 border-none">
            {/* Tabs Navigation */}
            <div className="flex gap-2 p-1.5 bg-gray-100 rounded-xl mb-8">
              {/* ── KATALOG dipindah ke kiri ── */}
              <button
                onClick={() => setActiveTab("KATALOG")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeTab === "KATALOG"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MdOutlineInventory2 className="text-lg" />
                Katalog Kebutuhan
              </button>

              {/* ── MANUAL dipindah ke kanan ── */}
              <button
                onClick={() => setActiveTab("MANUAL")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeTab === "MANUAL"
                    ? "bg-white text-teal-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <MdOutlineAssignment className="text-lg" />
                Formulir Bebas
              </button>
            </div>

            {/* TAB 1: FORMULIR BEBAS */}
            {activeTab === "MANUAL" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                <InputField
                  id="item_name"
                  label="Nama Barang *"
                  placeholder="Misal: Pakaian Bekas Layak Pakai"
                  value={manualForm.item_name}
                  onChange={handleManualFormChange}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-public-sans font-semibold text-gray-500">
                      Kategori *
                    </label>
                    <select
                      id="item_category"
                      value={manualForm.item_category}
                      onChange={handleManualFormChange}
                      className="w-full px-4 py-3 bg-gray-50 rounded-md transition-colors focus:outline-none focus:ring-0 border-none appearance-none text-sm font-sans text-gray-900 cursor-pointer"
                    >
                      <option value="" disabled>
                        Pilih Kategori
                      </option>
                      {kategoriOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <InputField
                    id="item_qty"
                    label="Jumlah / Satuan *"
                    placeholder="Contoh: 3"
                    type="number"
                    min={1}
                    value={manualForm.item_qty}
                    onChange={handleManualFormChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-public-sans font-semibold text-gray-500">
                      Kondisi
                    </label>
                    <select
                      id="item_condition"
                      value={manualForm.item_condition}
                      onChange={handleManualFormChange}
                      className="w-full px-4 py-3 bg-gray-50 rounded-md transition-colors focus:outline-none focus:ring-0 border-none appearance-none text-sm font-sans text-gray-900 cursor-pointer"
                    >
                      {kondisiOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-public-sans font-semibold text-gray-500">
                      Upload Foto Barang (Opsional)
                    </label>
                    <button
                      type="button"
                      onClick={() => manualFileInputRef.current?.click()}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-sm font-sans text-gray-500 flex items-center justify-between"
                    >
                      <span className="truncate">
                        {manualPhotoName || "Pilih file foto..."}
                      </span>
                      <MdCloudUpload className="text-lg flex-shrink-0" />
                    </button>
                    <input
                      ref={manualFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setManualPhotoFile(file);
                          setManualPhotoName(file.name);
                        } else {
                          setManualPhotoFile(null);
                          setManualPhotoName(null);
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-public-sans font-semibold text-gray-500">
                    Deskripsi Tambahan
                  </label>
                  <textarea
                    id="item_description"
                    rows={3}
                    placeholder="Catatan tambahan untuk petugas panti..."
                    value={manualForm.item_description}
                    onChange={handleManualFormChange}
                    className="w-full px-4 py-3 bg-gray-50 rounded-md transition-colors focus:outline-none focus:ring-0 border-none resize-none text-sm font-sans text-gray-900"
                  />
                </div>

                <button
                  onClick={handleAddManual}
                  disabled={isCompressing}
                  className="w-full py-4 bg-teal-50 text-teal-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-100 transition-colors mt-4 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCompressing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                      Memproses Gambar...
                    </>
                  ) : (
                    <>
                      <MdAddShoppingCart className="text-xl" />
                      Tambahkan ke Keranjang
                    </>
                  )}
                </button>
              </div>
            )}

            {/* TAB 2: KATALOG KEBUTUHAN */}
            {activeTab === "KATALOG" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                {!selectedNeed ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {isLoadingCatalog ? (
                      <div className="col-span-full py-10 flex items-center justify-center text-gray-500">
                        <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin mr-3" />
                        Memuat Katalog...
                      </div>
                    ) : catalogNeeds.length === 0 ? (
                      <div className="col-span-full py-10 flex items-center justify-center text-gray-500">
                        Tidak ada kebutuhan barang saat ini.
                      </div>
                    ) : (
                      catalogNeeds.map((need) => (
                        <div
                          key={need.id}
                          onClick={() => {
                            if (!need.is_disabled) setSelectedNeed(need);
                          }}
                          className={`p-5 rounded-xl transition-colors border ${
                            need.is_disabled
                              ? "bg-gray-100 opacity-60 grayscale cursor-not-allowed border-transparent"
                              : "bg-gray-50 hover:bg-teal-50 cursor-pointer border-transparent hover:border-teal-200"
                          }`}
                        >
                          <h3 className="font-bold text-gray-900 mb-1">
                            {need.itemName}
                          </h3>
                          <p className="text-xs text-gray-500 mb-3">
                            {need.category}
                          </p>
                          {need.is_disabled ? (
                            <div className="text-xs font-medium text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                              Kapasitas Gudang Penuh. Dapat disumbangkan kembali
                              saat stok berkurang.
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                  Sisa Dibutuhkan:
                                </span>
                                <span className="font-bold text-red-500">
                                  {need.remaining_need} {need.unit}
                                </span>
                              </div>
                              {need.virtual_stock > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">
                                    Kapasitas Terisi:
                                  </span>
                                  <span className="font-semibold text-gray-600">
                                    {need.stock}{" "}
                                    <span className="text-amber-600">
                                      (+{need.virtual_stock} Menunggu)
                                    </span>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-teal-50 p-5 rounded-xl relative">
                      <button
                        onClick={() => setSelectedNeed(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                      >
                        <MdClose className="text-xl" />
                      </button>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1 block">
                        Barang Dipilih
                      </span>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {selectedNeed.itemName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Kebutuhan Tersisa:{" "}
                        <span className="font-bold text-red-500">
                          {selectedNeed.remaining_need} {selectedNeed.unit}
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField
                        label="Jumlah Donasi Anda *"
                        placeholder="Contoh: 10"
                        type="number"
                        min={1}
                        value={catalogQty}
                        onChange={(e) => setCatalogQty(e.target.value)}
                      />
                      <div className="flex flex-col gap-1">
                        <label className="text-sm font-public-sans font-semibold text-gray-500">
                          Upload Foto Barang (Opsional)
                        </label>
                        <button
                          type="button"
                          onClick={() => catalogFileInputRef.current?.click()}
                          className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-sm font-sans text-gray-500 flex items-center justify-between"
                        >
                          <span className="truncate">
                            {catalogPhotoName || "Pilih file foto..."}
                          </span>
                          <MdCloudUpload className="text-lg flex-shrink-0" />
                        </button>
                        <input
                          ref={catalogFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setCatalogPhotoFile(file);
                              setCatalogPhotoName(file.name);
                            } else {
                              setCatalogPhotoFile(null);
                              setCatalogPhotoName(null);
                            }
                          }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddCatalog}
                      disabled={isCompressing}
                      className="w-full py-4 bg-teal-50 text-teal-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-100 transition-colors mt-4 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isCompressing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                          Memproses Gambar...
                        </>
                      ) : (
                        <>
                          <MdAddShoppingCart className="text-xl" />
                          Tambahkan ke Keranjang
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          STICKY CHECKOUT FAB (Floating Action Button)
      ═══════════════════════════════════════ */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => setIsCheckoutOpen(true)}
          className="relative bg-[#0B648C] text-white p-5 rounded-2xl shadow-xl hover:-translate-y-1 hover:shadow-2xl transition-all group flex items-center gap-3"
        >
          <MdOutlineShoppingCart className="text-2xl" />
          <span className="font-bold hidden md:block">Checkout Donasi</span>

          {/* Badge */}
          {cartItems.length > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center border-2 border-[#F9FAFB] shadow-sm animate-in zoom-in">
              {cartItems.length}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════
          MODAL CHECKOUT (SUMMARY)
      ═══════════════════════════════════════ */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setIsCheckoutOpen(false)}
          ></div>

          <div className="bg-white/95 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center">
                  <MdOutlineShoppingCart className="text-xl" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    Keranjang Donasi
                  </h2>
                  <p className="text-xs text-gray-500">
                    {identity.donor_name || "Donatur Anonim"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <MdClose className="text-xl" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50/50">
              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <MdOutlineShoppingCart className="text-4xl" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Keranjang Masih Kosong
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Silakan tambahkan barang donasi melalui Formulir Bebas atau
                    Katalog Kebutuhan.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between group hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.source === "KATALOG" ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600"}`}
                          >
                            {item.source}
                          </span>
                          <h4 className="font-bold text-gray-900">
                            {item.item_name}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.item_category} &bull; {item.item_condition}
                        </p>
                        <div className="inline-block px-3 py-1 bg-gray-50 rounded-lg text-sm font-bold text-gray-700">
                          Qty: {item.item_qty}
                        </div>
                        {item.photoName && (
                          <p className="text-xs text-teal-600 flex items-center gap-1 mt-2">
                            <MdCheckCircle /> {item.photoName}
                          </p>
                        )}
                      </div>

                      <div className="flex items-start gap-2 border-t border-gray-100 pt-3 sm:border-none sm:pt-0">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-bold"
                        >
                          <MdEdit /> Edit
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors text-sm font-bold"
                        >
                          <MdDelete /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 border-t border-gray-100 bg-white">
              <PrimaryButton
                onClick={submitFinalDonation}
                disabled={cartItems.length === 0 || isSubmitting}
                className="w-full py-4 text-lg font-bold shadow-xl shadow-teal-900/20 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Ajukan Donasi Sekarang"
                )}
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
      />
    </div>
  );
}
