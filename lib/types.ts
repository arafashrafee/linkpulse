export type LinkRow = {
  id: string;
  user_id: string;
  destination_url: string;
  short_code: string;
  title: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ClickRow = {
  id: string;
  link_id: string;
  clicked_at: string;
  referrer: string | null;
  device_type: string | null;
  browser: string | null;
};

export type DeviceType = "desktop" | "mobile" | "tablet" | "unknown";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export type SignUpResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; error: string };

export type ActionResultWithId =
  | { ok: true; id: string }
  | { ok: false; error: string };

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      links: {
        Row: LinkRow;
        Insert: {
          id?: string;
          user_id: string;
          destination_url: string;
          short_code: string;
          title?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          destination_url?: string;
          short_code?: string;
          title?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "links_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      clicks: {
        Row: ClickRow;
        Insert: {
          id?: string;
          link_id: string;
          clicked_at?: string;
          referrer?: string | null;
          device_type?: string | null;
          browser?: string | null;
        };
        Update: {
          id?: string;
          link_id?: string;
          clicked_at?: string;
          referrer?: string | null;
          device_type?: string | null;
          browser?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clicks_link_id_fkey";
            columns: ["link_id"];
            isOneToOne: false;
            referencedRelation: "links";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      resolve_and_click: {
        Args: {
          p_code: string;
          p_referrer?: string | null;
          p_device_type?: string | null;
          p_browser?: string | null;
        };
        Returns: {
          destination_url: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
