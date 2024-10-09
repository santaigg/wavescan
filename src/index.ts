import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { bearer } from "@elysiajs/bearer";
import { Database } from "./database";
import { Steam } from "./steam";
import { getPlayerFullProfile, getPlayerProfile } from "./player/info";
import cors from "@elysiajs/cors";

const db = Database.getInstance();
const steam = Steam.getInstance();

const app = new Elysia()
	.use(swagger())
	.use(bearer())
	.use(cors({
		origin: "*",
		methods: ["GET", "POST", "PUT", "DELETE"],
	}))
	.get("/", () => "Wavescan Out!")
	// API V1
	.group("/api/v1", (app) =>
		app
			// Player Routes
			.group("/player", (app) =>
				app
					.get("/:playerId", async ({ params }) => {
						const { playerId } = params;
						// Select all related data for the player
						const { data, error } = await db.client
							.from("spectre_player")
							.select(
								"*, spectre_player_stats ( * ), spectre_player_banner ( * ), spectre_player_account ( * ), spectre_team_member ( * , spectre_team ( * )), spectre_match_player ( * , spectre_match_team ( *, spectre_match ( * ) ) )",
							)
							.eq("id", playerId);
						return { data, error };
					})
					.get("/:playerId/stats", async ({ params }) => {
						const { playerId } = params;
						const { data, error } = await db.client
							.from("spectre_player_stats")
							.select("*")
							.eq("player", playerId);
						return { data, error };
					})
					.get("/:playerId/banner", async ({ params }) => {
						const { playerId } = params;
						const { data, error } = await db.client
							.from("spectre_player_banner")
							.select("*")
							.eq("player", playerId);
						return { data, error };
					})
					.get("/:playerId/account", async ({ params }) => {
						const { playerId } = params;
						const { data, error } = await db.client
							.from("spectre_player_account")
							.select("*")
							.eq("player", playerId);
						return { data, error };
					})
					.get("/:playerId/profile", async ({ params }) => {
						const { playerId } = params;
						const player_profile = await getPlayerProfile(playerId);
						return { ...player_profile };
					})
					.get("/:playerId/full_profile", async ({ params }) => {
						const { playerId } = params;
						const player_profile = await getPlayerFullProfile(playerId);
						return { ...player_profile };
					}),
			),
	)
	.listen(3003);

console.log(
	`🔥 Wavescan is running at ${app.server?.hostname}:${app.server?.port}`,
);
