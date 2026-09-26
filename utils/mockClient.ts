// Frontend Mock Client (Standalone - No Backend/Database required)

export interface MockProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: "peserta" | "panitia" | "juri";
  subtheme?: string;
}

export interface MockTeam {
  id: string;
  team_name: string;
  leader_id: string;
  tahap1_status: string;
  tahap2_status: string;
  tahap3_status: string;
  tahap4_status: string;
  tahap3_zoom_link?: string;
  tahap3_present_order?: string;
  tahap4_schedule?: string;
  leader?: { subtheme?: string; email?: string; phone?: string; full_name?: string } | null;
  team_files?: any[];
  team_members?: any[];
  scores?: any[];
}

const mockStages = [
  { stage_number: 1, stage_name: "Tahap 1: Registrasi & BMC", is_open: true },
  { stage_number: 2, stage_name: "Tahap 2: Proposal Bisnis", is_open: true },
  { stage_number: 3, stage_name: "Tahap 3: Pitching Online", is_open: false },
  { stage_number: 4, stage_name: "Tahap 4: Grand Final", is_open: false },
];

const mockAnnouncements = [
  {
    id: "ann-1",
    title: "Selamat Datang di HIPMI Collab Expo 2026!",
    content: "Pastikan seluruh data tim dan berkas administrasi telah diunggah dengan lengkap sebelum batas waktu.",
    target: "all",
    created_at: new Date().toISOString(),
  },
  {
    id: "ann-2",
    title: "Pengumuman Webinar Proposal & TM",
    content: "Technical Meeting & Webinar Proposal akan diselenggarakan via Zoom pada 31 Agustus 2026.",
    target: "peserta",
    created_at: new Date().toISOString(),
  },
];

const mockProfiles: MockProfile[] = [
  {
    id: "user-peserta-1",
    email: "peserta@hce2026.com",
    full_name: "Ahmad Rizky Pratama",
    phone: "081234567890",
    role: "peserta",
    subtheme: "Digital Technology & AI",
  },
  {
    id: "user-juri-1",
    email: "juri@gmail.com",
    full_name: "Dr. Hendra Wijaya, M.M.",
    role: "juri",
  },
  {
    id: "user-panitia-1",
    email: "panitia@gmail.com",
    full_name: "Panitia HCE 2026",
    role: "panitia",
  },
];

const mockTeams: MockTeam[] = [
  {
    id: "team-1",
    team_name: "Inovasi Nusantara",
    leader_id: "user-peserta-1",
    tahap1_status: "approved",
    tahap2_status: "approved",
    tahap3_status: "pending",
    tahap4_status: "pending",
    leader: {
      full_name: "Ahmad Rizky Pratama",
      email: "peserta@hce2026.com",
      phone: "081234567890",
      subtheme: "Digital Technology & AI",
    },
    team_members: [
      { id: "m-1", team_id: "team-1", full_name: "Ahmad Rizky Pratama", email: "peserta@hce2026.com", nim: "1301210001", member_role: "Ketua", university: "Telkom University" },
      { id: "m-2", team_id: "team-1", full_name: "Siti Nurhaliza", email: "siti@example.com", nim: "1301210002", member_role: "Anggota", university: "Telkom University" },
      { id: "m-3", team_id: "team-1", full_name: "Budi Santoso", email: "budi@example.com", nim: "1301210003", member_role: "Anggota", university: "Telkom University" },
    ],
    team_files: [
      { team_id: "team-1", file_type: "ktm", file_name: "InovasiNusantara_KTM_HCE2026.pdf", file_path: "#" },
      { team_id: "team-1", file_type: "ig", file_name: "InovasiNusantara_IG_HCE2026.pdf", file_path: "#" },
      { team_id: "team-1", file_type: "tiktok", file_name: "InovasiNusantara_TIKTOK_HCE2026.pdf", file_path: "#" },
      { team_id: "team-1", file_type: "bmc", file_name: "InovasiNusantara_BMC_HCE2026.pdf", file_path: "#" },
      { team_id: "team-1", file_type: "proposal", file_name: "InovasiNusantara_PROPOSAL_HCE2026.pdf", file_path: "#" },
      { team_id: "team-1", file_type: "payment", file_name: "InovasiNusantara_PAYMENT.jpg", file_path: "#" },
    ],
    scores: [
      { judge_id: "user-juri-1", score_type: "proposal", final_score: 88, feedback: "Ide sangat inovatif dan implementasi jelas.", criteria_scores: {} },
    ],
  },
  {
    id: "team-2",
    team_name: "EcoTech Solution",
    leader_id: "user-peserta-2",
    tahap1_status: "approved",
    tahap2_status: "pending",
    tahap3_status: "pending",
    tahap4_status: "pending",
    leader: {
      full_name: "Rania Safira",
      email: "rania@ecotech.com",
      phone: "081987654321",
      subtheme: "Sustainable Business",
    },
    team_members: [
      { id: "m-4", team_id: "team-2", full_name: "Rania Safira", email: "rania@ecotech.com", nim: "210512001", member_role: "Ketua", university: "Institut Teknologi Bandung" },
      { id: "m-5", team_id: "team-2", full_name: "Dimas Anggara", email: "dimas@ecotech.com", nim: "210512002", member_role: "Anggota", university: "Institut Teknologi Bandung" },
    ],
    team_files: [
      { team_id: "team-2", file_type: "ktm", file_name: "EcoTech_KTM.pdf", file_path: "#" },
      { team_id: "team-2", file_type: "bmc", file_name: "EcoTech_BMC.pdf", file_path: "#" },
    ],
    scores: [],
  },
  {
    id: "team-3",
    team_name: "Creative AI Labs",
    leader_id: "user-peserta-3",
    tahap1_status: "approved",
    tahap2_status: "approved",
    tahap3_status: "approved",
    tahap4_status: "pending",
    tahap3_zoom_link: "https://zoom.us/j/1234567890",
    tahap3_present_order: "1",
    tahap4_schedule: "24 Oktober 2026, 09:00 WIB",
    leader: {
      full_name: "Farhan Maulana",
      email: "farhan@creativeai.id",
      phone: "082134567891",
      subtheme: "Creative Industry & Media",
    },
    team_members: [
      { id: "m-6", team_id: "team-3", full_name: "Farhan Maulana", email: "farhan@creativeai.id", nim: "1901234", member_role: "Ketua", university: "Universitas Indonesia" },
    ],
    team_files: [
      { team_id: "team-3", file_type: "bmc", file_name: "CreativeAI_BMC.pdf", file_path: "#" },
      { team_id: "team-3", file_type: "proposal", file_name: "CreativeAI_Proposal.pdf", file_path: "#" },
      { team_id: "team-3", file_type: "pitch_deck", file_name: "CreativeAI_PitchDeck.pdf", file_path: "#" },
    ],
    scores: [
      { judge_id: "user-juri-1", score_type: "proposal", final_score: 92, feedback: "Pitch deck sangat menarik.", criteria_scores: {} },
    ],
  },
  {
    id: "team-4",
    team_name: "AgroSmart Nusantara",
    leader_id: "user-peserta-4",
    tahap1_status: "approved",
    tahap2_status: "approved",
    tahap3_status: "pending",
    tahap4_status: "pending",
    leader: {
      full_name: "Nabila Zahra",
      email: "nabila@agrosmart.id",
      phone: "081399887766",
      subtheme: "Agrotechnology & Food Security",
    },
    team_members: [
      { id: "m-7", team_id: "team-4", full_name: "Nabila Zahra", email: "nabila@agrosmart.id", nim: "2001928", member_role: "Ketua", university: "IPB University" },
      { id: "m-8", team_id: "team-4", full_name: "Haikal Firdaus", email: "haikal@agrosmart.id", nim: "2001929", member_role: "Anggota", university: "IPB University" },
    ],
    team_files: [
      { team_id: "team-4", file_type: "ktm", file_name: "AgroSmart_KTM.pdf", file_path: "#" },
      { team_id: "team-4", file_type: "bmc", file_name: "AgroSmart_BMC.pdf", file_path: "#" },
      { team_id: "team-4", file_type: "proposal", file_name: "AgroSmart_Proposal.pdf", file_path: "#" },
    ],
    scores: [
      { judge_id: "user-juri-1", score_type: "proposal", final_score: 85, feedback: "Potensi pasar agritech sangat besar.", criteria_scores: {} },
    ],
  },
  {
    id: "team-5",
    team_name: "EduFuture Platform",
    leader_id: "user-peserta-5",
    tahap1_status: "pending",
    tahap2_status: "pending",
    tahap3_status: "pending",
    tahap4_status: "pending",
    leader: {
      full_name: "Kevin Ardiansyah",
      email: "kevin@edufuture.com",
      phone: "085611223344",
      subtheme: "Digital Technology & AI",
    },
    team_members: [
      { id: "m-9", team_id: "team-5", full_name: "Kevin Ardiansyah", email: "kevin@edufuture.com", nim: "1804567", member_role: "Ketua", university: "Universitas Gadjah Mada" },
    ],
    team_files: [
      { team_id: "team-5", file_type: "ktm", file_name: "EduFuture_KTM.pdf", file_path: "#" },
      { team_id: "team-5", file_type: "bmc", file_name: "EduFuture_BMC.pdf", file_path: "#" },
    ],
    scores: [],
  },
];

class QueryBuilder {
  private tableName: string;
  private filters: Record<string, any> = {};
  private singleResult = false;
  private maybeSingleResult = false;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(_columns = "*") {
    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = value;
    return this;
  }

  order(_column: string, _opts?: { ascending?: boolean }) {
    return this;
  }

  single() {
    this.singleResult = true;
    return this;
  }

  maybeSingle() {
    this.maybeSingleResult = true;
    return this;
  }

  in(_column: string, _values: any[]) {
    return this;
  }

  neq(_column: string, _value: any) {
    return this;
  }

  gte(_column: string, _value: any) {
    return this;
  }

  lte(_column: string, _value: any) {
    return this;
  }

  like(_column: string, _pattern: string) {
    return this;
  }

  ilike(_column: string, _pattern: string) {
    return this;
  }

  upsert(_data: any, _options?: any) {
    return this;
  }

  insert(_data: any, _options?: any) {
    return this;
  }

  update(_data: any, _options?: any) {
    return this;
  }

  delete(_options?: any) {
    return this;
  }

  async then(resolve: (val: any) => void) {
    let result: any = [];

    if (this.tableName === "competition_stages") {
      result = [...mockStages];
      if (this.filters.stage_number) {
        result = result.filter((s: any) => s.stage_number === this.filters.stage_number);
      }
    } else if (this.tableName === "profiles") {
      result = [...mockProfiles];
      if (this.filters.id) {
        result = result.filter((p: any) => p.id === this.filters.id);
      }
      if (this.filters.role) {
        result = result.filter((p: any) => p.role === this.filters.role);
      }
    } else if (this.tableName === "teams") {
      result = [...mockTeams];
      if (this.filters.id) {
        result = result.filter((t: any) => t.id === this.filters.id);
      }
      if (this.filters.leader_id) {
        result = result.filter((t: any) => t.leader_id === this.filters.leader_id);
      }
    } else if (this.tableName === "team_members") {
      const allMembers = mockTeams.flatMap((t) => t.team_members || []);
      result = allMembers;
      if (this.filters.team_id) {
        result = result.filter((m: any) => m.team_id === this.filters.team_id);
      }
    } else if (this.tableName === "team_files") {
      const allFiles = mockTeams.flatMap((t) => t.team_files || []);
      result = allFiles;
      if (this.filters.team_id) {
        result = result.filter((f: any) => f.team_id === this.filters.team_id);
      }
    } else if (this.tableName === "announcements") {
      result = [...mockAnnouncements];
    } else if (this.tableName === "scores") {
      const allScores = mockTeams.flatMap((t) => t.scores || []);
      result = allScores;
      if (this.filters.team_id) {
        result = result.filter((s: any) => s.team_id === this.filters.team_id);
      }
    } else if (this.tableName === "stage_judges") {
      result = [
        { judge_id: "user-juri-1", stage_number: 2, is_active: true },
        { judge_id: "user-juri-1", stage_number: 3, is_active: true },
        { judge_id: "user-juri-1", stage_number: 4, is_active: true },
      ];
    }

    if (this.singleResult) {
      resolve({ data: result[0] || null, error: result[0] ? null : new Error("Not found") });
    } else if (this.maybeSingleResult) {
      resolve({ data: result[0] || null, error: null });
    } else {
      resolve({ data: result, error: null });
    }
  }
}

export function createClient() {
  return {
    auth: {
      async getUser() {
        return {
          data: {
            user: {
              id: "user-panitia-1",
              email: "panitia@gmail.com",
            },
          },
          error: null,
        };
      },
      async getSession() {
        return {
          data: {
            session: {
              user: {
                id: "user-panitia-1",
                email: "panitia@gmail.com",
              },
            },
          },
          error: null,
        };
      },
      onAuthStateChange(_cb: (event: string, session: any) => void) {
        return {
          data: {
            subscription: {
              unsubscribe: () => {},
            },
          },
        };
      },
      async signOut() {
        return { error: null };
      },
    },
    from(tableName: string) {
      return new QueryBuilder(tableName);
    },
    storage: {
      from(_bucket: string) {
        return {
          async upload(_path: string, _file: any, _options?: any): Promise<{ data: { path: string } | null; error: any }> {
            return { data: { path: _path }, error: null };
          },
          async download(_path: string) {
            return { data: new Blob(["mock content"], { type: "application/pdf" }), error: null };
          },
          getPublicUrl(path: string) {
            return { data: { publicUrl: path } };
          },
          async remove(_paths: string[]) {
            return { data: null, error: null };
          },
        };
      },
    },
    channel(_name: string) {
      return {
        on(_event: string, _schema: any, _cb: any) {
          return this;
        },
        subscribe() {
          return this;
        },
      };
    },
    removeChannel(_ch: any) {},
  };
}
