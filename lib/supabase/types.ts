// Stub — replaced by `npm run db:types` after linking to the Supabase project.
// This file exists so the codebase typechecks before the remote project is live.
// Keep the shape aligned with supabase/migrations/20260421000001_schema.sql.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Media = {
  id: string;
  kind: "image" | "video" | "external_video";
  storage_path: string | null;
  external_url: string | null;
  width: number | null;
  height: number | null;
  blurhash: string | null;
  alt: string | null;
  duration_seconds: number | null;
  owner_resource: "project" | "photo" | null;
  owner_id: string | null;
  created_at: string;
};

type Project = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  year: number | null;
  description: string | null;
  cover_media_id: string | null;
  position: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

type Photo = {
  id: string;
  media_id: string;
  caption: string | null;
  location: string | null;
  taken_at: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

type Movie = {
  id: string;
  tmdb_id: number;
  rating: number | null;
  review: string | null;
  watched_at: string;
  position: number;
  created_at: string;
  updated_at: string;
};

type Tag = { id: string; name: string; slug: string };
type PhotoTag = { photo_id: string; tag_id: string };
type ProjectMedia = { project_id: string; media_id: string; position: number };
type GuestbookEntry = {
  id: string;
  name: string;
  message: string;
  ip_hash: string | null;
  created_at: string;
};

type TableShape<Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Extract<keyof Row, "id">> extends infer _ ? Partial<Row> : never;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      media: TableShape<Media>;
      projects: TableShape<Project>;
      photos: TableShape<Photo>;
      movies: TableShape<Movie>;
      tags: TableShape<Tag>;
      photo_tags: TableShape<PhotoTag>;
      project_media: TableShape<ProjectMedia>;
      guestbook_entries: TableShape<GuestbookEntry>;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
