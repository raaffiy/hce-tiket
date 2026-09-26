export type FileType = "ktm" | "ig" | "tiktok" | "bmc" | "proposal" | "payment" | "pitch_deck" | "pitch_deck_final";

export interface FileValidationRule {
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  maxSizeMB: number;
  label: string;
}

export const FILE_RULES: Record<FileType, FileValidationRule> = {
  ktm: {
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: ["pdf"],
    maxSizeMB: 10,
    label: "KTM",
  },
  ig: {
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: ["pdf"],
    maxSizeMB: 10,
    label: "Bukti Follow Instagram",
  },
  tiktok: {
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: ["pdf"],
    maxSizeMB: 10,
    label: "Bukti Follow TikTok",
  },
  bmc: {
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: ["pdf"],
    maxSizeMB: 15,
    label: "BMC",
  },
  proposal: {
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: ["pdf"],
    maxSizeMB: 5,
    label: "Proposal Bisnis",
  },
  payment: {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/jpg"],
    allowedExtensions: ["png", "jpg", "jpeg"],
    maxSizeMB: 1,
    label: "Bukti Transfer Pembayaran",
  },
  pitch_deck: {
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: ["pdf"],
    maxSizeMB: 15,
    label: "Pitch Deck",
  },
  pitch_deck_final: {
    allowedMimeTypes: ["application/pdf"],
    allowedExtensions: ["pdf"],
    maxSizeMB: 15,
    label: "Pitch Deck Final",
  },
};

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Validates uploaded file without modifying its quality or content.
 * File will be uploaded in its original form.
 */
export function validateUploadFile(file: File, type: FileType): void {
  const rule = FILE_RULES[type];
  if (!rule) {
    throw new Error(`Tipe berkas '${type}' tidak dikenal.`);
  }

  // 1. Validasi Ukuran Minimum (Cek file kosong)
  if (file.size < 100) {
    throw new Error(`File ${rule.label} kosong atau rusak.`);
  }

  // 2. Validasi Ekstensi File
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!rule.allowedExtensions.includes(ext)) {
    const formattedExts = rule.allowedExtensions.map((e) => e.toUpperCase()).join(", ");
    throw new Error(
      `Format file ${rule.label} tidak sesuai. Harap unggah file dengan format: ${formattedExts}`
    );
  }

  // 3. Validasi MIME Type (jika terdeteksi oleh browser)
  const mime = (file.type || "").toLowerCase();
  if (mime) {
    const isMimeValid =
      rule.allowedMimeTypes.includes(mime) ||
      (type === "payment" && (mime.startsWith("image/jpeg") || mime.startsWith("image/png") || mime === "image/jpg" || mime === "image/pjpeg")) ||
      (type !== "payment" && (mime === "application/pdf" || mime === "application/x-pdf" || mime === "application/octet-stream"));

    if (!isMimeValid) {
      const formattedExts = rule.allowedExtensions.map((e) => e.toUpperCase()).join(", ");
      throw new Error(
        `Format file ${rule.label} tidak sesuai. Harap unggah file dengan format: ${formattedExts}`
      );
    }
  }

  // 4. Validasi Batas Ukuran File (Maksimal)
  const maxSizeBytes = rule.maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(
      `Ukuran file ${rule.label} (${formatBytes(file.size)}) melebihi batas maksimal ${rule.maxSizeMB} MB. Silakan pilih file dengan ukuran lebih kecil.`
    );
  }
}

export interface ValidationAndCompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  isCompressed: boolean;
  reductionPercentage: number;
}

/**
 * Backwards compatibility helper: validates file and returns original file without compression.
 */
export async function validateAndCompressFile(
  file: File,
  type: FileType
): Promise<ValidationAndCompressionResult> {
  validateUploadFile(file, type);
  return {
    file,
    originalSize: file.size,
    compressedSize: file.size,
    isCompressed: false,
    reductionPercentage: 0,
  };
}
