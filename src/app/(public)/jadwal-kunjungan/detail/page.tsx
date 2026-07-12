"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { FiCalendar, FiClock, FiShield, FiAlertCircle } from "react-icons/fi";
import { FaRegHeart, FaRunning } from "react-icons/fa";
import {
  MdAddShoppingCart,
  MdOutlineDeleteOutline,
  MdArrowBack,
  MdCloudUpload,
} from "react-icons/md";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { AlertModal } from "@/components/ui/AlertModal";
import { useAuth } from "@/hooks/useAuth";

/* ──────────────────────────────────────────
   Stepper
   ────────────────────────────────────────── */
interface StepInfo {
  number: number;
  label: string;
}

const steps: StepInfo[] = [
  { number: 1, label: "Jadwal" },
  { number: 2, label: "Detail" },
  { number: 3, label: "Konfirmasi" },
];

/* ──────────────────────────────────────────
   Identity type tabs
   ────────────────────────────────────────── */
type IdentityType = "individu" | "lembaga";

/* ──────────────────────────────────────────
   Visit category cards
   ────────────────────────────────────────── */
interface VisitCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

const visitCategories: VisitCategory[] = [
  {
    id: "biasa",
    label: "Kunjungan Biasa",
    description: "Pertemuan santai, perkenalan, dan bermain bersama anak-anak.",
    icon: <FaRegHeart className="text-primary text-lg" />,
    iconBg: "bg-primary/10",
  },
  {
    id: "kegiatan",
    label: "Melakukan Kegiatan",
    description:
      "Workshop, donasi formal, hiburan, atau perayaan ulang tahun bersama.",
    icon: <FaRunning className="text-tertiary text-lg" />,
    iconBg: "bg-tertiary/10",
  },
];

/* ══════════════════════════════════════════
   Inventory item type (fetched from API)
   ══════════════════════════════════════════ */
interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  stock: number;
  unit: string;
}

/* ══════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════ */
function DetailPengunjungContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Read schedule selection from URL params (set by atur-jadwal page)
  const capacityId = searchParams.get("capacity_id") || "";
  const scheduledDate = searchParams.get("date") || "";
  const sessionLabel = decodeURIComponent(
    searchParams.get("session_label") || "",
  );
  const sessionTime = decodeURIComponent(
    searchParams.get("session_time") || "",
  );

  const [identityType, setIdentityType] = useState<IdentityType>("individu");
  const [selectedCategory, setSelectedCategory] = useState<string>("biasa");
  const [bringDonation, setBringDonation] = useState(false);
  const [namaField, setNamaField] = useState("");
  const [whatsappField, setWhatsappField] = useState("");
  const [tujuanField, setTujuanField] = useState("");
  const [proposalFile, setProposalFile] = useState<File | null>(null);
  const [showModal, setShowModal] = useState(false);

  // API integration state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const [userVisits, setUserVisits] = useState<any>(null);

  useEffect(() => {
    if (user) {
      setNamaField(prev => prev || user.name || "");
      setWhatsappField(prev => prev || user.phone || "");

      // Fetch user's existing visits to check for active ones on the same date
      const token = localStorage.getItem("auth_token") || "";
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/user/visits`, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.ok ? res.json() : null)
          .then((json) => {
            if (json && json.data) {
              setUserVisits(json.data);
            }
          })
          .catch(() => {});
      }
    }
  }, [user]);

  // Multistep Logic
  const [formStep, setFormStep] = useState<"detail" | "cart">("detail");

  // Smart Cart State (uses inventory UUIDs from API)
  const [cartItems, setCartItems] = useState<
    { id: string; name: string; qty: number; inventory_id: string; photoFile?: File | null; photoName?: string | null; }[]
  >([]);
  const [selectedInventoryId, setSelectedInventoryId] = useState("");
  const [manualName, setManualName] = useState("");
  const [itemQty, setItemQty] = useState("");
  const [itemPhotoFile, setItemPhotoFile] = useState<File | null>(null);
  const [itemPhotoName, setItemPhotoName] = useState<string | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Inventory items fetched from backend
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/inventories`, {
      credentials: 'include',
      headers: { Accept: "application/json" },
    })
      .then((res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => setInventoryList(json.data || []))
      .catch(() => setInventoryList([]));
  }, []);

  const currentStep = formStep === "detail" ? 2 : 2;

  const handleNext = () => {
    // Check for active visit on the same date (Max 1 session per day)
    if (userVisits && scheduledDate) {
      const pendingVisits = userVisits["PENDING"] || [];
      const approvedVisits = userVisits["APPROVED"] || [];
      const activeVisits = [...pendingVisits, ...approvedVisits];
      
      const hasActive = activeVisits.some((visit: any) => {
        if (!visit.capacity || !visit.capacity.date) return false;
        // Ensure date comparison matches YYYY-MM-DD
        return visit.capacity.date.startsWith(scheduledDate) || scheduledDate.startsWith(visit.capacity.date.split("T")[0]);
      });

      if (hasActive) {
        setErrorMessage("Anda sudah memiliki pengajuan kunjungan yang aktif pada tanggal ini. Maksimal 1 sesi per hari.");
        return;
      }
    }

    // Validate Lembaga & Proposal
    if (identityType === "lembaga" && !proposalFile) {
      setErrorMessage("Proposal / Surat Kunjungan wajib diunggah untuk lembaga.");
      return;
    }

    if (bringDonation && formStep === "detail") {
      setFormStep("cart");
    } else {
      setErrorMessage("");
      setShowModal(true);
    }
  };

  const handleSubmitToApi = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setShowModal(false);

    const formData = new FormData();
    formData.append("capacity_id", capacityId);
    formData.append("bringsDonation", bringDonation ? "1" : "0");
    formData.append("visitor_type", identityType === "lembaga" ? "Lembaga/Instansi" : "Individu");

    if (identityType === "lembaga") {
      formData.append("visitor_name", namaField);
    }

    if (tujuanField.trim() !== "") {
      formData.append("purpose", tujuanField.trim());
    }

    if (identityType === "lembaga" && proposalFile) {
      formData.append("proposal_file", proposalFile);
    }

    if (bringDonation && cartItems.length > 0) {
      formData.append("donorPhone", whatsappField);
      cartItems.forEach((item, index) => {
        formData.append(`items[${index}][qty]`, item.qty.toString());
        if (item.inventory_id && item.inventory_id !== "MANUAL") {
          formData.append(`items[${index}][inventory_id]`, item.inventory_id);
        } else {
          formData.append(`items[${index}][id]`, "MANUAL");
          formData.append(`items[${index}][name]`, item.name);
        }
        if (item.photoFile) {
          formData.append(`items[${index}][image]`, item.photoFile);
        }
      });
    }

    try {
      const token = localStorage.getItem("auth_token") || "";
      const headers: HeadersInit = {
        Accept: "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visits`, {
        method: "POST",
        credentials: 'include',
        headers,
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 422 && data.errors) {
          const msgs = Object.values(data.errors).flat().join(" ");
          setErrorMessage(msgs);
        } else {
          setErrorMessage(
            data.message || "Terjadi kesalahan. Silakan coba lagi.",
          );
        }
        return;
      }

      const confirmParams = new URLSearchParams({
        date: scheduledDate,
        session_label: sessionLabel,
        session_time: sessionTime,
        category:
          selectedCategory === "kegiatan"
            ? "Melakukan Kegiatan"
            : "Kunjungan Biasa",
        has_donation: bringDonation ? "1" : "0",
        email_sent: "true",
      });
      router.push(`/jadwal-kunjungan/konfirmasi?${confirmParams.toString()}`);
    } catch {
      setErrorMessage("Tidak dapat terhubung ke server. Periksa koneksi Anda.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (selectedInventoryId && itemQty) {
      const parsedQty = parseInt(itemQty);
      if (isNaN(parsedQty) || parsedQty < 1) {
        setAlertMessage("Jumlah barang harus minimal 1.");
        setShowAlert(true);
        return;
      }
      
      if (selectedInventoryId === "MANUAL") {
        if (!manualName.trim()) {
          setAlertMessage("Nama barang manual wajib diisi.");
          setShowAlert(true);
          return;
        }

        const isExactMatch = inventoryList.some(
          (inv) => inv.itemName.toLowerCase() === manualName.trim().toLowerCase()
        );

        if (isExactMatch) {
          setAlertMessage(`Barang "${manualName.trim()}" sudah ada di dalam katalog. Silakan pilih dari menu katalog untuk mencegah data ganda.`);
          setShowAlert(true);
          return;
        }

        setCartItems([
          ...cartItems,
          {
            id: `manual_${Date.now()}`,
            name: manualName.trim(),
            qty: parsedQty,
            inventory_id: "MANUAL",
            photoFile: itemPhotoFile,
            photoName: itemPhotoName,
          },
        ]);
      } else {
        const inv = inventoryList.find((i) => i.id === selectedInventoryId);
        if (!inv) return;
        setCartItems([
          ...cartItems,
          {
            id: `${Date.now()}`,
            name: `${inv.itemName} (${inv.unit})`,
            qty: parsedQty,
            inventory_id: inv.id,
            photoFile: itemPhotoFile,
            photoName: itemPhotoName,
          },
        ]);
      }
      setSelectedInventoryId("");
      setManualName("");
      setItemQty("");
      setItemPhotoFile(null);
      setItemPhotoName(null);
    }
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-surface min-h-screen">
      {/* ═══════════════════════════════════════
          STEPPER
         ═══════════════════════════════════════ */}
      <section className="pt-18 pb-6 px-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-center">
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      step.number <= currentStep
                        ? "bg-primary text-white"
                        : "bg-surface-container-low text-on-surface-variant"
                    }`}
                  >
                    {step.number}
                  </span>
                  <span
                    className={`font-sans text-sm font-medium ${
                      step.number === currentStep
                        ? "text-on-surface font-bold"
                        : step.number < currentStep
                          ? "text-on-surface-variant"
                          : "text-on-surface-variant"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-4 ${
                      step.number < currentStep
                        ? "bg-primary"
                        : "bg-outline-variant/30"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PAGE HEADER
         ═══════════════════════════════════════ */}
      <section className="px-6 pb-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-[44px] font-black tracking-tighter leading-[1.08] text-on-surface mb-4">
            Detail Pengunjung &amp; Kegiatan
          </h1>
          <p className="text-on-surface-variant font-sans text-sm md:text-base leading-relaxed max-w-lg mx-auto">
            Lengkapi informasi diri Anda atau lembaga Anda untuk memastikan
            proses kunjungan berjalan selaras dengan rutinitas anak-anak.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FORM SECTION
         ═══════════════════════════════════════ */}
      <section className="px-6 pb-10">
        <div className="max-w-2xl mx-auto">
          {/* ── JENIS IDENTITAS ── */}
          {formStep === "detail" ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-8">
                <h3 className="font-public-sans text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface-variant text-center mb-4">
                  Jenis Identitas
                </h3>
                <div className="flex justify-center">
                  <div className="inline-flex bg-surface-container-low rounded-xl p-1">
                    <button
                      onClick={() => setIdentityType("individu")}
                      className={`px-8 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all duration-200 ${
                        identityType === "individu"
                          ? "bg-surface-container-lowest text-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Individu
                    </button>
                    <button
                      onClick={() => setIdentityType("lembaga")}
                      className={`px-8 py-2.5 rounded-lg font-sans text-sm font-semibold transition-all duration-200 ${
                        identityType === "lembaga"
                          ? "bg-surface-container-lowest text-primary shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      Lembaga
                    </button>
                  </div>
                </div>
              </div>

              {/* ── NAME + WHATSAPP FIELDS ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                {/* Nama */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-public-sans font-semibold text-on-surface/80">
                    {identityType === "individu"
                      ? "Nama Perwakilan / Lembaga"
                      : "Nama Lembaga / Organisasi"}
                  </label>
                  <input
                    type="text"
                    value={namaField}
                    onChange={(e) => setNamaField(e.target.value)}
                    placeholder={
                      identityType === "individu"
                        ? "Contoh: Budi Santoso / PT. Sinergi"
                        : "Contoh: Yayasan Peduli Anak"
                    }
                    className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl transition-colors
                  focus:outline-none focus:ring-0 border border-outline-variant/15 focus:border-primary/40
                  font-sans text-sm text-on-surface placeholder:text-on-surface-variant/40"
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-public-sans font-semibold text-on-surface/80">
                    Nomor WhatsApp (Aktif)
                  </label>
                  <input
                    type="tel"
                    value={whatsappField}
                    onChange={(e) => setWhatsappField(e.target.value)}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl transition-colors
                  focus:outline-none focus:ring-0 border border-outline-variant/15 focus:border-primary/40
                  font-sans text-sm text-on-surface placeholder:text-on-surface-variant/40"
                  />
                </div>
              </div>

              {/* ── PROPOSAL / SURAT KUNJUNGAN (LEMBAGA) ── */}
              {identityType === "lembaga" && (
                <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <h3 className="font-public-sans text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface mb-3">
                    Dokumen Pendukung
                  </h3>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-public-sans font-semibold text-on-surface/80">
                      Unggah Proposal / Surat Kunjungan (Wajib)
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => setProposalFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl transition-colors border border-outline-variant/15 focus:border-primary/40 font-sans text-sm text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                    <p className="text-xs text-on-surface-variant mt-1">
                      Maksimal ukuran file: 5MB. Format: PDF, DOCX, JPG, PNG.
                    </p>
                  </div>
                </div>
              )}

              {/* ── KATEGORI KUNJUNGAN ── */}
              <div className="mb-8">
                <h3 className="font-public-sans text-[11px] font-bold uppercase tracking-[0.18em] text-on-surface mb-4">
                  Kategori Kunjungan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visitCategories.map((cat) => {
                    const isActive = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`text-left p-5 rounded-xl transition-all duration-200 ${
                          isActive
                            ? "bg-surface-container-lowest ring-2 ring-primary/30 shadow-ambient"
                            : "bg-surface-container-lowest border border-outline-variant/10 hover:border-outline-variant/25"
                        }`}
                      >
                        {/* Icon */}
                        <div
                          className={`w-10 h-10 rounded-xl ${cat.iconBg} flex items-center justify-center mb-3`}
                        >
                          {cat.icon}
                        </div>
                        {/* Label */}
                        <h4 className="font-sans font-bold text-sm text-on-surface mb-1">
                          {cat.label}
                        </h4>
                        {/* Description */}
                        <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                          {cat.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── RINCIAN TUJUAN / SUSUNAN KEGIATAN ── */}
              <div className="mb-6">
                <label className="block text-sm font-public-sans font-semibold text-on-surface/80 mb-1.5">
                  Rincian Tujuan / Susunan Kegiatan
                </label>
                <textarea
                  value={tujuanField}
                  onChange={(e) => setTujuanField(e.target.value)}
                  rows={4}
                  placeholder="Ceritakan sedikit rencana kegiatan Anda atau barang apa yang ingin didonasikan..."
                  className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl transition-colors resize-none
                focus:outline-none focus:ring-0 border border-outline-variant/15 focus:border-primary/40
                font-sans text-sm text-on-surface placeholder:text-on-surface-variant/40 leading-relaxed"
                />
              </div>

              {/* ── BRING DONATION TOGGLE ── */}
              <div className="mb-10">
                <GlassContainer className="px-5 py-4 flex items-start gap-4">
                  <div className="flex-1">
                    <p className="font-sans text-sm font-bold text-on-surface leading-snug">
                      Saya berencana membawa buah tangan / donasi fisik saat
                      berkunjung
                    </p>
                    <p className="font-sans text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Kami akan menyiapkan Resi Penitipan untuk mendata barang
                      bawaan Anda agar transparan.
                    </p>
                  </div>
                  {/* Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={bringDonation}
                    onClick={() => setBringDonation(!bringDonation)}
                    className={`relative flex-shrink-0 w-12 h-7 rounded-full transition-colors duration-200 ${
                      bringDonation ? "bg-primary" : "bg-surface-dim"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                        bringDonation ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </GlassContainer>
              </div>

              {/* ═══════════════════════════════════════
              RINGKASAN KUNJUNGAN
             ═══════════════════════════════════════ */}
              {/* ── ERROR MESSAGE ── */}
              {errorMessage && (
                <div className="mb-6 flex flex-col gap-3 bg-red-50/80 rounded-xl px-5 py-4 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-red-500 text-base flex-shrink-0 mt-0.5" />
                    <p className="font-sans text-sm text-red-600 leading-relaxed">
                      {errorMessage}
                    </p>
                  </div>
                  {errorMessage.includes("Maksimal 1 sesi per hari") && (
                    <button 
                      type="button"
                      onClick={() => router.push("/jadwal-kunjungan")}
                      className="text-sm font-bold text-red-700 bg-red-100 hover:bg-red-200 py-2 px-4 rounded-lg self-start transition-colors border-none"
                    >
                      Pilih Tanggal Lain
                    </button>
                  )}
                </div>
              )}

              <GlassContainer className="p-6 md:p-8 bg-surface-container-low/60 mb-6">
                <h3 className="font-sans font-black text-lg text-on-surface mb-5">
                  Ringkasan Kunjungan
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tanggal */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FiCalendar className="text-primary text-base" />
                    </div>
                    <div>
                      <span className="block font-public-sans text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                        Tanggal Kunjungan
                      </span>
                      <span className="block font-sans text-sm font-bold text-on-surface mt-0.5">
                        {scheduledDate || "Belum dipilih"}
                      </span>
                    </div>
                  </div>

                  {/* Sesi */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FiClock className="text-primary text-base" />
                    </div>
                    <div>
                      <span className="block font-public-sans text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
                        Sesi Terpilih
                      </span>
                      <span className="block font-sans text-sm font-bold text-on-surface mt-0.5">
                        Sesi {sessionLabel} ({sessionTime})
                      </span>
                    </div>
                  </div>
                </div>
              </GlassContainer>

              {/* ═══════════════════════════════════════
              CTA BUTTON
             ═══════════════════════════════════════ */}
              <PrimaryButton
                onClick={handleNext}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-md hover:shadow-lg transition-all tracking-wide rounded-xl"
              >
                {isLoading
                  ? "Mengirim..."
                  : bringDonation && formStep === "detail"
                    ? "Lanjut Isi Data Barang"
                    : "Lanjut ke Konfirmasi"}
              </PrimaryButton>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="mb-6 flex items-center gap-4">
                <button
                  onClick={() => setFormStep("detail")}
                  className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                >
                  <MdArrowBack className="text-xl" />
                </button>
                <div>
                  <h3 className="font-sans font-black text-xl text-on-surface">
                    Data Barang Bawaan
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant mt-1">
                    Tambahkan barang yang akan Anda bawa saat kunjungan.
                  </p>
                </div>
              </div>

              <GlassContainer className="p-6 mb-8">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-public-sans font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                        Pilih Barang
                      </label>
                      <select
                        value={selectedInventoryId}
                        onChange={(e) => setSelectedInventoryId(e.target.value)}
                        className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/15 focus:border-primary/40 focus:ring-0 font-sans text-sm text-on-surface outline-none appearance-none"
                      >
                        <option value="">— Pilih dari daftar kebutuhan —</option>
                        {inventoryList.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.itemName} ({inv.unit}) — Stok: {inv.stock}
                          </option>
                        ))}
                        <option value="MANUAL">— Barang Lain (Di Luar Katalog) —</option>
                      </select>
                    </div>
                    
                    {selectedInventoryId === "MANUAL" && (
                      <div className="flex-1">
                        <label className="text-xs font-public-sans font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                          Nama Barang
                        </label>
                        <input
                          type="text"
                          value={manualName}
                          onChange={(e) => setManualName(e.target.value)}
                          placeholder="Misal: Buku Cerita Anak"
                          className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/15 focus:border-primary/40 focus:ring-0 font-sans text-sm text-on-surface outline-none"
                        />
                      </div>
                    )}

                    <div className="w-24">
                      <label className="text-xs font-public-sans font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                        Jumlah
                      </label>
                      <input
                        type="number"
                        value={itemQty}
                        onChange={(e) => setItemQty(e.target.value)}
                        min={1}
                        placeholder="1"
                        className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/15 focus:border-primary/40 focus:ring-0 font-sans text-sm text-on-surface text-center outline-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3 items-end">
                    <div className="flex-1">
                      <label className="text-xs font-public-sans font-bold uppercase tracking-widest text-on-surface-variant mb-2 block">
                        Upload Foto Barang (Opsional)
                      </label>
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="w-full px-4 py-3 bg-surface-container-lowest hover:bg-surface-container-low rounded-xl transition-colors border border-outline-variant/15 font-sans text-sm text-on-surface-variant flex items-center justify-between"
                      >
                        <span className="truncate">
                          {itemPhotoName || "Pilih file foto..."}
                        </span>
                        <MdCloudUpload className="text-lg flex-shrink-0" />
                      </button>
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setItemPhotoFile(file);
                            setItemPhotoName(file.name);
                          } else {
                            setItemPhotoFile(null);
                            setItemPhotoName(null);
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="h-[46px] px-6 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl font-bold flex items-center justify-center transition-colors shrink-0"
                    >
                      <MdAddShoppingCart className="text-xl mr-2" /> Tambah
                    </button>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-outline-variant/20 rounded-xl">
                      <p className="text-sm text-on-surface-variant font-sans">
                        Belum ada barang ditambahkan.
                      </p>
                    </div>
                  ) : (
                    cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm"
                      >
                        <div>
                          <p className="font-sans font-bold text-on-surface text-sm">
                            {item.name}
                          </p>
                          <p className="font-sans text-xs text-on-surface-variant mt-0.5">
                            {item.qty} item
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <MdOutlineDeleteOutline className="text-lg" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </GlassContainer>

              <PrimaryButton
                onClick={handleNext}
                disabled={isLoading || cartItems.length === 0}
                className="w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-md hover:shadow-lg transition-all tracking-wide rounded-xl"
              >
                {isLoading ? "Mengirim..." : "Konfirmasi Seluruh Data"}
              </PrimaryButton>
            </div>
          )}

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={handleSubmitToApi}
            confirmText={isLoading ? "Mengirim..." : "Ya, Ajukan Kunjungan"}
            summaryItems={[
              { label: 'Tanggal', value: scheduledDate || '-' },
              { label: 'Waktu', value: `Sesi ${sessionLabel} (${sessionTime})` },
              ...(bringDonation ? [{ 
                label: 'Status Donasi', 
                value: `Membawa Barang (${cartItems.reduce((acc, item) => acc + item.qty, 0)} item)` 
              }] : [])
            ]}
          />

          {/* ═══════════════════════════════════════
              TRUST / PRIVACY NOTICE
             ═══════════════════════════════════════ */}
          <div className="mt-5 mb-4">
            <div className="flex items-start gap-3 bg-surface-container-low/50 rounded-xl px-5 py-4">
              <FiShield className="text-primary text-base flex-shrink-0 mt-0.5" />
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Data Anda dienkripsi dan hanya digunakan untuk kepentingan
                verifikasi kunjungan oleh Panti Asuhan Dr. J. Lucas. Kami menghargai
                privasi Anda sebagaimana kami menjaga kenyamanan anak-anak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
      />
    </div>
  );
}

export default function DetailPengunjungPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface min-h-screen flex items-center justify-center">
          <p className="text-on-surface-variant font-sans text-sm animate-pulse">
            Memuat halaman...
          </p>
        </div>
      }
    >
      <DetailPengunjungContent />
    </Suspense>
  );
}
