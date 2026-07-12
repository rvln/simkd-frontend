"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { GlassContainer } from "@/components/ui/GlassContainer";
import { InputField } from "@/components/ui/InputField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { FiShield, FiCheckCircle, FiLock, FiChevronDown, FiAlertCircle } from "react-icons/fi";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/* ───── Amount presets ───── */
interface AmountPreset {
  label: string;
  value: number;
}

const amountPresets: AmountPreset[] = [
  { label: "Sapaan Kebaikan", value: 50000 },
  { label: "Langkah Bersama", value: 100000 },
  { label: "Cahaya Harapan", value: 250000 },
];

/* ───── Privacy options ───── */
interface PrivacyOption {
  id: string;
  label: string;
  description: string;
}

const privacyOptions: PrivacyOption[] = [
  {
    id: "show",
    label: "Tampilkan Nama",
    description: "Nama Anda akan terlihat di daftar donatur",
  },
  {
    id: "hide",
    label: "Sembunyikan Nama",
    description: "Donasi akan tercatat sebagai Hamba Allah",
  },
  {
    id: "anon",
    label: "Identitas Anonim",
    description: "Gunakan sebutan hangat sebagai pengganti nama",
  },
];

const anonAliases = [
  "Sahabat Kemanusiaan",
  "Teman Baik Anak",
  "Pelita Harapan",
  "Cahaya Kasih",
];

/* ───── Format currency ───── */
function formatRp(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

type PaymentState = "IDLE" | "PROCESSING" | "PENDING_PAYMENT" | "SUCCESS";

/* ══════════════════════════════════════════
   COMPONENT
   ══════════════════════════════════════════ */
export default function DonasiFinansialPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(100000);
  const [customAmount, setCustomAmount] = useState("");
  const [privacyMode, setPrivacyMode] = useState("show");
  const [selectedAlias, setSelectedAlias] = useState(anonAliases[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentState, setPaymentState] = useState<PaymentState>("IDLE");
  const [snapToken, setSnapToken] = useState<string | null>(null);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [paymentChannel, setPaymentChannel] = useState<"MIDTRANS" | "MANUAL">(
    "MIDTRANS",
  );
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const effectiveAmount =
    selectedAmount ?? (customAmount ? parseInt(customAmount, 10) : 0);

  const [formData, setFormData] = useState({
    donorName: "",
    donorEmail: "",
    donorPhone: "",
  });

  useEffect(() => {
    if (user) {
      // user.phone is populated from /api/user after profile update;
      // localStorage fallback ensures autofill works in the same session
      const savedPhone = typeof window !== "undefined"
        ? localStorage.getItem("user_phone") ?? ""
        : "";
      setFormData((prev) => ({
        ...prev,
        donorName:  prev.donorName  || (user as any).name  || "",
        donorEmail: prev.donorEmail || (user as any).email || "",
        donorPhone: prev.donorPhone || (user as any).phone || savedPhone,
      }));
    }
  }, [user]);

  // Handler untuk mengubah nilai form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setFormError(null);

    // Validasi sederhana
    if (
      !formData.donorName ||
      !formData.donorEmail ||
      !formData.donorPhone ||
      effectiveAmount <= 0
    ) {
      setFormError("Mohon lengkapi semua data donasi.");
      setIsLoading(false);
      return;
    }

    if (paymentChannel === "MANUAL" && !paymentProof) {
      setFormError("Mohon unggah bukti transfer untuk metode pembayaran manual.");
      setIsLoading(false);
      return;
    }

    try {
      const fd = new FormData();
      // When anon mode, use the selected alias as the donor name
      const effectiveDonorName =
        privacyMode === "anon" ? selectedAlias : formData.donorName;
      fd.append("donorName", effectiveDonorName);
      fd.append("donorEmail", formData.donorEmail);
      fd.append("donorPhone", formData.donorPhone);
      fd.append("amount", effectiveAmount.toString());
      fd.append("payment_channel", paymentChannel);
      fd.append("donor_name_privacy", privacyMode);

      if (paymentChannel === "MANUAL" && paymentProof) {
        fd.append("payment_proof", paymentProof);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/donasi/finansial`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
          body: fd,
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Gagal memproses donasi.");
      }

      const result = await res.json();

      if (paymentChannel === "MANUAL") {
        router.push("/donasi/menunggu-validasi");
        return;
      }

      const token = result.data?.snap_token;
      setSnapToken(token);
      let newDonationId = null;
      if (result.data?.donation && result.data.donation.id) {
        newDonationId = result.data.donation.id;
        setDonationId(newDonationId);
      }

      if (token) {
        // Reset loading BEFORE opening Snap — the popup manages its own UX.
        // If we don't reset here, the button stays "Memproses..." forever
        // when the user closes or cancels the Snap popup.
        setIsLoading(false);
        triggerSnap(token, newDonationId);
      } else {
        throw new Error("Token pembayaran Midtrans tidak ditemukan.");
      }
    } catch (error: any) {
      console.error("Network error:", error);
      setFormError(error.message || "Terjadi kesalahan jaringan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  const handleCancelTransaction = async () => {
    if (donationId) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/public/donations/${donationId}/cancel`,
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          },
        );
      } catch (error) {
        console.error("Failed to cancel donation:", error);
      }
    }
    setSnapToken(null);
    setDonationId(null);
    setPaymentState("IDLE");
  };

  const triggerSnap = (token: string, currentDonationId: string | null) => {
    if (!(window as any).snap) {
      setFormError("Sistem pembayaran belum siap. Silakan refresh halaman.");
      return;
    }
    (window as any).snap.pay(token, {
      onSuccess: () => {
        setSnapToken(null);
        if (currentDonationId) {
          router.push(`/donasi/invoice/${currentDonationId}`);
        } else {
          setPaymentState("SUCCESS");
        }
      },
      onPending: () => {
        setPaymentState("PENDING_PAYMENT");
      },
      onError: () => {
        setFormError("Transaksi gagal. Silakan coba lagi.");
        setPaymentState("IDLE");
        setSnapToken(null);
      },
      onClose: () => {
        setPaymentState("PENDING_PAYMENT");
      },
    });
  };

  return (
    <div className="bg-surface">
      <section className="px-6 md:px-12 lg:px-20 py-16 lg:py-24 pt-14 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-10 lg:gap-16 items-start">
          {/* ── Left Column: Hero image + quote ── */}
          <div className="relative hidden lg:block">
            <div className="sticky top-24">
              {/* Image */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-ambient">
                <Image
                  src="/example_img/unsplash5.png"
                  alt="Anak-anak Panti Asuhan"
                  fill
                  className="object-cover"
                  sizes="420px"
                  priority
                />
                {/* Gradient overlay from bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/70 via-on-surface/20 to-transparent" />

                {/* Quote overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <GlassContainer className="p-5 bg-primary/80 backdrop-blur-lg border-none">
                    <span className="block text-black/60 text-2xl font-black leading-none mb-2">
                      &ldquo;&rdquo;
                    </span>
                    <p className="text-black text-sm font-sans italic leading-relaxed">
                      &ldquo;Setiap kontribusi adalah benang yang merajut
                      harmoni dalam ekosistem transparansi kami.&rdquo;
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="w-5 h-px bg-black/50" />
                      <span className="font-public-sans text-[9px] font-bold uppercase tracking-[0.2em] text-black/70">
                        Panti Asuhan Dr. J. Lucas
                      </span>
                    </div>
                  </GlassContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column: Form ── */}
          <div>
            {(paymentState === "IDLE" || paymentState === "PROCESSING") && (
              <>
                {/* Headline */}
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.08] text-on-surface mb-3 italic">
                  Wujudkan Kepedulian Anda
                </h1>
                <div className="flex items-center gap-2 mb-10">
                  <FiCheckCircle className="text-tertiary text-base" />
                  <span className="text-on-surface-variant font-sans text-sm">
                    Transaksi Anda 100% transparan dan dapat dilacak.
                  </span>
                </div>

                {/* ── Step 1: Pilih Nominal ── */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      1
                    </span>
                    <h2 className="font-bold text-lg text-on-surface font-sans">
                      Pilih Nominal
                    </h2>
                  </div>

                  {/* Preset grid */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    {amountPresets.map((preset) => {
                      const active = selectedAmount === preset.value;
                      return (
                        <button
                          key={preset.value}
                          onClick={() => {
                            setSelectedAmount(preset.value);
                            setCustomAmount("");
                          }}
                          className={`flex flex-col items-center gap-1.5 py-5 px-3 rounded-xl text-center transition-all duration-200 ${
                            active
                              ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-ambient"
                              : "bg-surface-container-lowest text-on-surface hover:bg-surface-container-low border border-outline-variant/10"
                          }`}
                        >
                          <span
                            className={`font-public-sans text-[9px] font-bold uppercase tracking-[0.14em] ${
                              active
                                ? "text-white/70"
                                : "text-on-surface-variant"
                            }`}
                          >
                            {preset.label}
                          </span>
                          <span className="font-sans font-black text-lg tracking-tight">
                            Rp {formatRp(preset.value)}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom amount */}
                  <div className="flex items-center gap-3 bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/15 focus-within:border-primary/40 transition-colors">
                    <span className="font-sans font-bold text-on-surface-variant text-sm">
                      Rp
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Nominal Lainnya"
                      value={customAmount}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "");
                        setCustomAmount(v);
                        if (v) setSelectedAmount(null);
                      }}
                      className="flex-1 bg-transparent focus:outline-none text-sm font-sans text-on-surface placeholder:text-on-surface-variant/50"
                    />
                  </div>
                </div>

                {/* ── Step 2: Identitas Donatur ── */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      2
                    </span>
                    <h2 className="font-bold text-lg text-on-surface font-sans">
                      Identitas Donatur
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {/* Name + Email row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputField
                        id="donorName"
                        label="Nama Lengkap"
                        placeholder="Contoh: Ahmad Sulaiman"
                        type="text"
                        value={formData.donorName}
                        onChange={handleInputChange}
                      />
                      <InputField
                        id="donorEmail"
                        label="Email"
                        placeholder="nama@email.com"
                        type="email"
                        value={formData.donorEmail}
                        onChange={handleInputChange}
                      />
                    </div>

                    {/* WhatsApp */}
                    <InputField
                      id="donorPhone"
                      label="Nomor WhatsApp"
                      placeholder="+62 812-xxxx-xxxx"
                      type="tel"
                      value={formData.donorPhone}
                      onChange={handleInputChange}
                    />

                    {/* Privacy radios */}
                    <div>
                      <span className="block font-public-sans text-[11px] font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-3">
                        Privasi Nama
                      </span>

                      <div className="space-y-2">
                        {privacyOptions.map((opt) => {
                          const active = privacyMode === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setPrivacyMode(opt.id)}
                              className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
                                active
                                  ? "bg-primary/5 ring-2 ring-primary/30"
                                  : "bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/10"
                              }`}
                            >
                              {/* Custom radio circle */}
                              <span
                                className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  active
                                    ? "border-primary"
                                    : "border-outline-variant/40"
                                }`}
                              >
                                {active && (
                                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                                )}
                              </span>

                              <div>
                                <span className="block font-sans font-bold text-sm text-on-surface">
                                  {opt.label}
                                </span>
                                <span className="block font-sans text-xs text-on-surface-variant mt-0.5">
                                  {opt.description}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Anon alias dropdown — only when "anon" is selected */}
                      {privacyMode === "anon" && (
                        <div className="mt-3 relative">
                          <div className="bg-surface-container-lowest rounded-xl px-4 py-3 border border-outline-variant/15 flex items-center justify-between">
                            <select
                              value={selectedAlias}
                              onChange={(e) => setSelectedAlias(e.target.value)}
                              className="w-full bg-transparent focus:outline-none text-sm font-sans text-on-surface appearance-none cursor-pointer"
                            >
                              {anonAliases.map((alias) => (
                                <option key={alias} value={alias}>
                                  {alias}
                                </option>
                              ))}
                            </select>
                            <FiChevronDown className="text-on-surface-variant text-sm flex-shrink-0 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Step 3: Metode Pembayaran ── */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                      3
                    </span>
                    <h2 className="font-bold text-lg text-on-surface font-sans">
                      Metode Pembayaran
                    </h2>
                  </div>
                  <div className="space-y-4">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentChannel("MIDTRANS");
                        setPaymentProof(null); // Hygiene Rule
                      }}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
                        paymentChannel === "MIDTRANS"
                          ? "bg-primary/5 ring-2 ring-primary/30"
                          : "bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/10"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentChannel === "MIDTRANS" ? "border-primary" : "border-outline-variant/40"}`}
                      >
                        {paymentChannel === "MIDTRANS" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </span>
                      <div>
                        <span className="block font-sans font-bold text-sm text-on-surface">
                          Pembayaran Otomatis (Midtrans)
                        </span>
                        <span className="block font-sans text-xs text-on-surface-variant mt-0.5">
                          Bisa bayar pakai GoPay, OVO, Virtual Account, dll.
                          Verifikasi instan.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentChannel("MANUAL")}
                      className={`w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200 ${
                        paymentChannel === "MANUAL"
                          ? "bg-primary/5 ring-2 ring-primary/30"
                          : "bg-surface-container-lowest hover:bg-surface-container-low border border-outline-variant/10"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${paymentChannel === "MANUAL" ? "border-primary" : "border-outline-variant/40"}`}
                      >
                        {paymentChannel === "MANUAL" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                        )}
                      </span>
                      <div>
                        <span className="block font-sans font-bold text-sm text-on-surface">
                          Transfer Bank Manual (BCA)
                        </span>
                        <span className="block font-sans text-xs text-on-surface-variant mt-0.5">
                          Transfer langsung ke rekening panti. Perlu proses
                          verifikasi manual oleh pengurus.
                        </span>
                      </div>
                    </button>

                    {paymentChannel === "MANUAL" && (
                      <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/10 animate-in fade-in slide-in-from-top-2">
                        <div className="mb-4">
                          <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">
                            Rekening Tujuan
                          </span>
                          <span className="block font-mono text-lg font-bold text-on-surface">
                            Bank BCA: 1234567890
                          </span>
                          <span className="block text-sm text-on-surface-variant">
                            a.n. Panti Asuhan Dr. J. Lucas
                          </span>
                        </div>
                        <div>
                          <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                            Unggah Bukti Transfer
                          </span>
                          <div className="relative">
                            <input
                              type="file"
                              id="payment-proof"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) =>
                                setPaymentProof(e.target.files?.[0] || null)
                              }
                              className="sr-only"
                            />
                            <label
                              htmlFor="payment-proof"
                              className="inline-flex items-center gap-3 cursor-pointer text-sm text-on-surface-variant font-medium group w-full"
                            >
                              <span className="py-2 px-4 rounded-full bg-primary/10 text-primary font-semibold group-hover:bg-primary/20 transition-colors shrink-0">
                                Pilih Berkas
                              </span>
                              <span className="truncate">
                                {paymentProof ? paymentProof.name : "Belum ada berkas"}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Error Message ── */}
                {formError && (
                  <div className="mb-4 p-4 bg-error/10 text-error rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                    <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium leading-relaxed">{formError}</span>
                  </div>
                )}

                {/* ── Submit ── */}
                <PrimaryButton
                  className="w-full flex items-center justify-center gap-2 py-4 text-base font-bold shadow-md hover:shadow-lg transition-all tracking-wide"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Memproses..." : "Lanjutkan Pembayaran"}
                </PrimaryButton>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
                  <div className="flex items-center gap-1.5 opacity-60">
                    <FiLock className="text-sm text-on-surface-variant" />
                    <span className="font-public-sans text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                      256-bit Encryption
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <FiShield className="text-sm text-on-surface-variant" />
                    <span className="font-public-sans text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Secure Payment
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-60">
                    <FiCheckCircle className="text-sm text-on-surface-variant" />
                    <span className="font-public-sans text-[9px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Verified by Midtrans
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* STATE 2: PENDING PAYMENT (RESUME FLOW) */}
            {paymentState === "PENDING_PAYMENT" && snapToken && (
              <div className="text-center p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 mt-10">
                <h2 className="text-2xl font-bold text-yellow-600 mb-4">
                  Menunggu Pembayaran
                </h2>
                <p className="mb-6 text-on-surface-variant">
                  Anda belum menyelesaikan pembayaran. Silakan lanjutkan
                  pembayaran Anda, atau batalkan jika ingin membuat nominal
                  donasi baru.
                </p>
                <div className="flex justify-center gap-4">
                  <PrimaryButton
                    onClick={() => triggerSnap(snapToken!, donationId)}
                  >
                    Lanjutkan Pembayaran
                  </PrimaryButton>
                  <button
                    onClick={handleCancelTransaction}
                    className="bg-error/10 text-error px-6 py-2 rounded-xl font-semibold transition-colors hover:bg-error/20"
                  >
                    Batalkan
                  </button>
                </div>
              </div>
            )}

            {/* STATE 3: SUCCESS */}
            {paymentState === "SUCCESS" && (
              <div className="text-center p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/15 mt-10">
                <h2 className="text-2xl font-bold text-primary mb-2">
                  Terima Kasih!
                </h2>
                <p className="text-on-surface-variant">
                  Donasi Anda telah berhasil kami terima. Tanda terima secara otomatis sedang dikirim ke email Anda.
                </p>
                <button
                  onClick={handleCancelTransaction}
                  className="mt-6 text-primary font-bold underline underline-offset-4"
                >
                  Buat Donasi Lagi
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
    </div>
  );
}
