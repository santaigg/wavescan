import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database as SupabaseDatabase, Tables } from "./database.types";

export class Database {
	public client: SupabaseClient<SupabaseDatabase>;
	public static instance: Database;
	constructor() {
		const supabaseUrl = process.env.SUPABASE_URL;
		const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
		if (!supabaseUrl || !supabaseAnonKey) {
			throw new Error("Supabase URL or Anon Key is not set");
		}
		this.client = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey);
	}

	public static getInstance(): Database {
		if (!Database.instance) {
			Database.instance = new Database();
		}
		return Database.instance;
	}
}
