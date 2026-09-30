-- ============================================================
-- HIPMI COLLAB EXPO (HCE 2026) - SUPABASE DATABASE SCHEMA
-- ============================================================
-- Salin dan jalankan seluruh query SQL ini di Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste -> Run

-- 1. DROP EXISTING TABLES (IF RE-RUNNING)
DROP TABLE IF EXISTS public.activities CASCADE;
DROP TABLE IF EXISTS public.participants CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.staff CASCADE;
DROP TABLE IF EXISTS public.media_partners CASCADE;
DROP TABLE IF EXISTS public.sponsors CASCADE;

-- ============================================================
-- 2. CREATE TABLES
-- ============================================================

-- Table 1: Tickets
CREATE TABLE public.tickets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    type TEXT NOT NULL CHECK (type IN ('FREE', 'PAID')),
    badge TEXT NOT NULL CHECK (badge IN ('EARLY', 'NORMAL', 'EXTEND')),
    visibility TEXT NOT NULL CHECK (visibility IN ('PUBLIC', 'PRIVATE')) DEFAULT 'PUBLIC',
    price NUMERIC NOT NULL DEFAULT 0,
    original_price NUMERIC DEFAULT 0,
    quota INTEGER NOT NULL DEFAULT 0,
    sold INTEGER NOT NULL DEFAULT 0,
    remaining INTEGER NOT NULL DEFAULT 0,
    start_date TEXT DEFAULT '',
    end_date TEXT DEFAULT '',
    benefits JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Sold Out', 'Archived')) DEFAULT 'Active',
    private_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 2: Transactions
CREATE TABLE public.transactions (
    order_id TEXT PRIMARY KEY,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    participant_id TEXT,
    participant_name TEXT NOT NULL,
    nim TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT DEFAULT '',
    faculty TEXT DEFAULT '',
    study_program TEXT DEFAULT '',
    ticket_id TEXT,
    ticket_name TEXT NOT NULL,
    ticket_type TEXT NOT NULL CHECK (ticket_type IN ('FREE', 'PAID')) DEFAULT 'PAID',
    amount NUMERIC NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    payment_method TEXT DEFAULT 'QRIS Official (Scan QR)',
    payment_status TEXT NOT NULL CHECK (payment_status IN ('Paid', 'Pending', 'Failed', 'Refunded')) DEFAULT 'Pending',
    payment_proof TEXT,
    check_in_status TEXT NOT NULL CHECK (check_in_status IN ('Checked In', 'Not Checked In')) DEFAULT 'Not Checked In',
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Table 3: Participants
CREATE TABLE public.participants (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES public.transactions(order_id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    nim TEXT NOT NULL,
    email TEXT NOT NULL,
    whatsapp TEXT DEFAULT '',
    faculty TEXT DEFAULT '',
    prodi TEXT DEFAULT '',
    ticket_id TEXT,
    ticket_name TEXT NOT NULL,
    ticket_type TEXT NOT NULL CHECK (ticket_type IN ('FREE', 'PAID')) DEFAULT 'PAID',
    price NUMERIC NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('Paid', 'Pending', 'Failed', 'Refunded')) DEFAULT 'Pending',
    payment_proof TEXT,
    check_in_status TEXT NOT NULL CHECK (check_in_status IN ('Checked In', 'Not Checked In')) DEFAULT 'Not Checked In',
    check_in_time TEXT,
    checked_in_method TEXT CHECK (checked_in_method IS NULL OR checked_in_method IN ('QR Scan', 'Manual')),
    registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 4: Staff Management
CREATE TABLE public.staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'STAFF')),
    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_date TEXT DEFAULT TO_CHAR(NOW(), 'YYYY-MM-DD'),
    last_active TEXT DEFAULT 'Belum pernah login',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 5: Media Partners
CREATE TABLE public.media_partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT DEFAULT '',
    website TEXT DEFAULT '',
    instagram TEXT DEFAULT '',
    description TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 6: Sponsors
CREATE TABLE public.sponsors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT DEFAULT '',
    website TEXT DEFAULT '',
    description TEXT DEFAULT '',
    tier TEXT NOT NULL CHECK (tier IN ('Main Sponsor', 'Gold', 'Silver', 'Bronze', 'Partner')),
    display_order INTEGER DEFAULT 0,
    status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table 7: Recent Activities
CREATE TABLE public.activities (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    timestamp TEXT DEFAULT 'Baru saja',
    icon_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_transactions_email ON public.transactions(email);
CREATE INDEX IF NOT EXISTS idx_transactions_nim ON public.transactions(nim);
CREATE INDEX IF NOT EXISTS idx_participants_order_id ON public.participants(order_id);
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_nim ON public.participants(nim);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);

-- ============================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS) & POLICIES
-- ============================================================
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Allow full access for anon & authenticated roles
CREATE POLICY "Allow public all for tickets" ON public.tickets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all for transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all for participants" ON public.participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all for staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all for media_partners" ON public.media_partners FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all for sponsors" ON public.sponsors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all for activities" ON public.activities FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. INITIAL SEED DATA
-- ============================================================

-- Seed Tickets
INSERT INTO public.tickets (id, name, description, type, badge, visibility, price, original_price, quota, sold, remaining, start_date, end_date, benefits, status)
VALUES
('early-bird', 'Early Bird', 'Tiket presale terbatas dengan harga spesial', 'PAID', 'EARLY', 'PUBLIC', 35000, 50000, 100, 0, 100, '2026-09-01T00:00', '2026-10-10T23:59', '["Akses Lengkap Seminar (Offline)", "E-Sertifikat Resmi ber-SKP", "E-Booklet Materi Eksklusif Pembicara", "Snack & Coffee Break", "Sesi Tanya Jawab Interaktif"]'::jsonb, 'Active'),
('regular', 'Presale / Regular', 'Akses seminar reguler dengan seminar kit lengkap', 'PAID', 'NORMAL', 'PUBLIC', 50000, 75000, 250, 0, 250, '2026-09-01T00:00', '2026-10-23T23:59', '["Semua benefit paket Early Bird", "Official HCE Seminar Kit & Goodie Bag", "Priority Seating (Area Tengah Depan)", "Sesi Networking bersama 500+ Peserta", "Doorprize & Voucher Pelatihan Eksklusif"]'::jsonb, 'Active'),
('vip', 'VIP Experience', 'Akses baris terdepan + eksklusif Meet & Greet Sadam Permana', 'PAID', 'EXTEND', 'PUBLIC', 85000, 120000, 50, 0, 50, '2026-09-01T00:00', '2026-10-23T23:59', '["Semua benefit paket Regular", "VIP Front-Row Seat (Baris Terdepan Panggung)", "Exclusive Meet & Greet + Foto bersama Sadam Permana", "VIP Lunch Box & Premium Merchandise Box", "Akses Komunitas Entrepreneur HCE VIP Network"]'::jsonb, 'Active');

-- Seed Staff Accounts
INSERT INTO public.staff (id, name, email, role, status, created_date, last_active)
VALUES
('STF-001', 'Super Admin HCE', 'superadmin@hce-event.id', 'SUPER_ADMIN', 'Active', '2026-09-01', 'Aktif Sekarang'),
('STF-002', 'Gate Keeper 01 (Registrasi)', 'gate01@hce-event.id', 'STAFF', 'Active', '2026-09-10', 'Belum pernah login'),
('STF-003', 'Gate Keeper 02 (Auditorium)', 'gate02@hce-event.id', 'STAFF', 'Active', '2026-09-10', 'Belum pernah login');

-- Seed Media Partners
INSERT INTO public.media_partners (id, name, logo, website, instagram, description, display_order, status)
VALUES
('MP-001', 'Info Olimpiade', '/media_partners/LOGO INFO OLIMPIADE.png', 'https://instagram.com/infoolimpiade', '@infoolimpiade', 'Media Partner Publikasi Event Mahasiswa', 1, 'Active'),
('MP-002', 'Pojok Event', '/media_partners/Logo Pojok Event-20.jpg', 'https://instagram.com/pojokevent', '@pojokevent', 'Portal Informasi Webinar & Seminar Nasional', 2, 'Active'),
('MP-003', 'Event Update', '/media_partners/Logo event update.png', 'https://instagram.com/eventupdate', '@eventupdate', 'Media Partner Seputar Info Acara Kampus', 3, 'Active'),
('MP-004', 'Seminar Utama', '/media_partners/Seminar utama.png', 'https://instagram.com/seminarutama', '@seminarutama', 'Platform Publikasi Seminar & Konferensi', 4, 'Active'),
('MP-005', 'Info Lomba', '/media_partners/imfolomba.jpg', 'https://instagram.com/infolomba', '@infolomba', 'Media Partner Kompetisi & Expo', 5, 'Active'),
('MP-006', 'Telyu Info', '/media_partners/telyuinfo.jpg', 'https://instagram.com/telyuinfo', '@telyuinfo', 'Media Komunitas Kampus Telkom University', 6, 'Active'),
('MP-007', 'Telyutizen', '/media_partners/telyutizen.jpg', 'https://instagram.com/telyutizen', '@telyutizen', 'Pusat Informasi & Kreativitas Mahasiswa', 7, 'Active');

-- Seed Sponsors
INSERT INTO public.sponsors (id, name, logo, website, description, tier, display_order, status)
VALUES
('SP-001', 'Telkom University', 'https://upload.wikimedia.org/wikipedia/id/0/08/Logo_Telkom_University.svg', 'https://telkomuniversity.ac.id', 'Official University Host & Venue Partner', 'Main Sponsor', 1, 'Active'),
('SP-002', 'Bank Central Asia (BCA)', 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg', 'https://bca.co.id', 'Official Banking & Payment Partner', 'Gold', 2, 'Active'),
('SP-003', 'Bank Mandiri', 'https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg', 'https://bankmandiri.co.id', 'Official Banking Partner', 'Silver', 3, 'Active');

-- Seed Initial Welcome Activity
INSERT INTO public.activities (id, type, title, description, timestamp)
VALUES
('ACT-001', 'ticket_created', 'Sistem Supabase Terhubung', 'Database PostgreSQL Supabase berhasil diintegrasikan dengan website HCE 2026', 'Baru saja');

-- ============================================================
-- 6. SUPABASE AUTH CONFIGURATION (STAFF MANAGEMENT)
-- ============================================================
-- Agar akun staff yang dibuat langsung aktif dan dapat login langsung
-- tanpa tertahan verifikasi email / limit rate kirim email Supabase:
CREATE OR REPLACE FUNCTION public.auto_confirm_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    NEW.email_confirmed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_auto_confirm_auth_user ON auth.users;
CREATE TRIGGER trigger_auto_confirm_auth_user
BEFORE INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.auto_confirm_new_auth_user();

-- ============================================================
-- 7. SUPABASE STORAGE BUCKET CONFIGURATION (MEDIA PARTNERS)
-- ============================================================
-- Bucket untuk menyimpan logo media partner yang diunggah dari dashboard admin:
-- 
-- CARA AKTIVASI (PILIH SALAH SATU):
-- OPSI A (Lewat Dashboard Supabase):
-- 1. Buka Supabase Dashboard -> Menu "Storage" di sidebar kiri.
-- 2. Klik "New bucket".
-- 3. Beri nama: media-partners
-- 4. Centang "Public bucket" (Wajib ON agar gambar bisa dilihat publik).
-- 5. Klik "Save".
--
-- OPSI B (Jalankan SQL berikut di Supabase SQL Editor):
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-partners', 'media-partners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy agar semua orang dapat melihat logo (Public Read)
CREATE POLICY "Public Read Media Partners" ON storage.objects
FOR SELECT USING (bucket_id = 'media-partners');

-- Policy agar user / admin dapat mengunggah logo (Insert)
CREATE POLICY "Allow Insert Media Partners" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'media-partners');

-- Policy agar user / admin dapat memperbarui logo (Update)
CREATE POLICY "Allow Update Media Partners" ON storage.objects
FOR UPDATE USING (bucket_id = 'media-partners');

-- Policy agar admin dapat menghapus logo (Delete)
CREATE POLICY "Allow Delete Media Partners" ON storage.objects
FOR DELETE USING (bucket_id = 'media-partners');

-- ============================================================
-- 8. SUPABASE STORAGE BUCKET CONFIGURATION (PAYMENT PROOFS)
-- ============================================================
-- Bucket untuk menyimpan bukti transfer / struk pembayaran dari pembeli tiket:
-- 
-- CARA AKTIVASI:
-- OPSI A (Lewat Dashboard Supabase):
-- 1. Buka Supabase Dashboard -> Menu "Storage" di sidebar kiri.
-- 2. Klik "New bucket".
-- 3. Beri nama: payment-proofs
-- 4. Centang "Public bucket" (Wajib ON agar bukti transfer bisa dilihat di dashboard admin).
-- 5. Klik "Save".
--
-- OPSI B (Jalankan SQL berikut di Supabase SQL Editor):
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Policy agar semua orang/admin dapat melihat bukti pembayaran (Public Read)
CREATE POLICY "Public Read Payment Proofs" ON storage.objects
FOR SELECT USING (bucket_id = 'payment-proofs');

-- Policy agar pembeli tiket dapat mengunggah bukti pembayaran (Insert)
CREATE POLICY "Allow Insert Payment Proofs" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'payment-proofs');

-- Policy agar admin/user dapat memperbarui bukti pembayaran (Update)
CREATE POLICY "Allow Update Payment Proofs" ON storage.objects
FOR UPDATE USING (bucket_id = 'payment-proofs');

-- Policy agar admin dapat menghapus bukti pembayaran (Delete)
CREATE POLICY "Allow Delete Payment Proofs" ON storage.objects
FOR DELETE USING (bucket_id = 'payment-proofs');

-- ============================================================
-- 9. BREVO AUTOMATED EMAIL & CERTIFICATE TRACKING (SQL MIGRATION)
-- ============================================================
-- Jalankan bagian ini di Supabase SQL Editor untuk menambahkan field tracking email Brevo:

ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS certificate_status TEXT DEFAULT 'Tersedia Setelah Acara Selesai (SKP Resmi)';

ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS email_status TEXT DEFAULT 'Pending',
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS certificate_status TEXT DEFAULT 'Tersedia Setelah Acara Selesai (SKP Resmi)';

-- Index untuk mempercepat query status email
CREATE INDEX IF NOT EXISTS idx_transactions_email_status ON public.transactions(email_status);
CREATE INDEX IF NOT EXISTS idx_participants_email_status ON public.participants(email_status);



