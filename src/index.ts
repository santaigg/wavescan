import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { bearer } from "@elysiajs/bearer";
import { Database } from "./database";
import { Steam } from "./steam";
import { getPlayerFullProfile, getPlayerProfile } from "./player/player";
import cors from "@elysiajs/cors";
import { addMatch, checkMatch, getMatch } from "./match/match";
import { getPlayerIdFromSteamId } from "./steam/steam";

const db = Database.getInstance();
const steam = Steam.getInstance();

const app = new Elysia()
	.use(swagger({
		documentation: {
			info: {
				title: "Wavescan API (Santai.GG)",
				version: "1.0.0",
			},
		},
		path: "/api/v1",
	}))
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
						console.log("[Player Route] - [GET] - /:playerId - ", playerId);
						// Select all related data for the player
						const { data, error } = await db.client
							.from("spectre_player")
							.select(
								"*, spectre_player_stats ( * ), spectre_player_banner ( * ), spectre_player_account ( * ), spectre_team_member ( * , spectre_team ( * )), spectre_match_player ( * , spectre_match_team ( *, spectre_match ( * ) ) )",
							)
							.eq("id", playerId);
						return { data, error };
					}, {
						detail: {
							summary: "Get Player",
							description: "",
							tags: ["Player"],
						},
					})
					.get("/:playerId/stats", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/stats - ", playerId);
						const { data, error } = await db.client
							.from("spectre_player_stats")
							.select("*")
							.eq("player", playerId);
						return { data, error };
					}, {
						detail: {
							summary: "Get Player Stats",
							description: "",
							tags: ["Player"],
						},
					})
					.get("/:playerId/banner", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/banner - ", playerId);
						const { data, error } = await db.client
							.from("spectre_player_banner")
							.select("*")
							.eq("player", playerId);
						return { data, error };
					}, {
						detail: {
							summary: "Get Player Banner",
							description: "",
							tags: ["Player"],
						},
					})
					.get("/:playerId/account", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/account - ", playerId);
						const { data, error } = await db.client
							.from("spectre_player_account")
							.select("*")
							.eq("player", playerId);
						return { data, error };
					}, {
						detail: {
							summary: "Get Player Account",
							description: "",
							tags: ["Player"],
						},
					})
					.get("/:playerId/profile", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/profile - ", playerId);
						const player_profile = await getPlayerProfile(playerId);
						return { ...player_profile };
					}, {
						detail: {
							summary: "Get Player Profile",
							description: "",
							tags: ["Player"],
						},
					})
					.get("/:playerId/full_profile", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/full_profile - ", playerId);
						const player_profile = await getPlayerFullProfile(playerId);
						return { ...player_profile };
					}, {
						detail: {
							summary: "Get Full Player Profile",
							description: "",
							tags: ["Player"],
						},
					})
					.get("/steam/:steamId", async ({ params }) => {
						const { steamId } = params;
						console.log("[Player Route] - [GET] - /steam/:steamId - ", steamId);
						const steam_profile = await getPlayerIdFromSteamId(steamId);
						return { ...steam_profile };
					}, {
						detail: {
							summary: "Get Player ID from Steam ID",
							description: "",
							tags: ["Player"],
							responses: {
								200: {
									description: "Success",
									content: {
										"application/json": {
											schema: {
												type: "object",
												properties: {
													success: {
														type: "boolean",
													},
													player_id: {
														type: "string",
													},
													error: {
														type: "string",
														nullable: true,
													},
												},
											},
										},
									},
								},
							},
						},
					})
			)
			.group("/match", (app) =>
				app
					.get("/:matchId", async ({ params }) => {
						const { matchId } = params;
						console.log("[Match Route] - [GET] - /:matchId - ", matchId);
						const match = await getMatch(matchId);
						return { ...match };
					})
					.get("/:matchId/check", async ({ params }) => {
						const { matchId } = params;
						console.log("[Match Route] - [GET] - /:matchId/check - ", matchId);
						const match = await checkMatch(matchId);
						return { ...match };
					})
					.get("/:matchId/add", async ({ params }) => {
						const { matchId } = params;
						console.log("[Match Route] - [GET] - /:matchId/add - ", matchId);
						const match = await addMatch(matchId);
						return { ...match };
					})
			)
	)
	.listen(3003);

console.log(
	`🔥 Wavescan is running at ${app.server?.hostname}:${app.server?.port}`,
);
