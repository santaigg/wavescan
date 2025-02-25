import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { bearer } from "@elysiajs/bearer";
import * as Sentry from "@sentry/bun";
import { Database } from "./database";
import { Steam } from "./steam";
import { getGameRanks, getPlayerConnections, getPlayerFullProfile, getPlayerIdByConnectionId, getPlayerProfile } from "./player/player";
import cors from "@elysiajs/cors";
import { addMatch, checkMatch, getMatch } from "./match/match";
import { getPlayerIdFromSteamId } from "./steam/steam";
import { dumpPlayer, getDumpStatus } from "./dump/dump";
import { searchPlayer } from "./search/search";
import { getSoloRankedLeaderboard } from "./leaderboard/leaderboard";
import { ConnectionType } from "./player/player.types";

const db = Database.getInstance();
const steam = Steam.getInstance();


if (!process.env.SENTRY_DSN) {
	throw new Error("SENTRY_DSN is not set");
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  // Tracing
  tracesSampleRate: 1.0, // Capture 100% of the transactions
});

const app = new Elysia()
	.use(swagger({
		documentation: {
			info: {
				title: "Wavescan API (Santai.GG)",
				version: "1.0.0",
			},
		},
		path: "/api/v1/swagger",
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
							summary: "Get Player ID from SteamID64",
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
					.get("/:playerId/game_ranks", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/game_ranks - ", playerId);
						const game_ranks = await getGameRanks(playerId);
						return { ...game_ranks };
					}, {
						detail: {
							summary: "Get Player Rank From GameService",
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
													solo_rank: {
														type: "number",
													},
													team_rank: {
														type: "number",
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
					.get("/:playerId/dump", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/dump - ", playerId);
						const dump = await dumpPlayer(playerId);
						return { ...dump };
					}, {
						detail: {
							summary: "Dump Player Matches",
							description: "",
							tags: ["Player"],
						},
					})
					.get("/:playerId/dump_status", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/dump_status - ", playerId);
						const dump_status = await getDumpStatus(playerId);
						return { ...dump_status };
					}, {
						detail: {
							summary: "Get Player Dump Status",
							description: "Get the dump status of a player. This includes if they've been initially dumped, if they're currently being dumped, and their dump status.",
							tags: ["Player"],
						},
					})
					.get("/:playerId/connections", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/connections - ", playerId);
						const connections = await getPlayerConnections(playerId);
						return { ...connections };
					}, {
						/**
						 * Example Response: {"success":true,"connections":[{"pragmaPlayerId":"8d02f2c0-69b8-4cee-9656-2d0866b44e9b","pragmaDisplayName":{"displayName":"truo","discriminator":"9622"},"idProviderAccounts":[{"idProviderType":"DISCORD","accountId":"132228986817216512","providerDisplayName":{"displayName":"truo","discriminator":""}},{"idProviderType":"STEAM","accountId":"76561198061346842","providerDisplayName":{"displayName":"truo","discriminator":""}},{"idProviderType":"TWITCH","accountId":"115376341","providerDisplayName":{"displayName":"truo","discriminator":""}}],"pragmaSocialId":"2a90914d-56ab-47bb-bb46-0442ee8b120e"}]}
						 */
						detail: {
							summary: "Get Player Social Connections",
							description: "Gets back a list of social connections for a player. (Example: Steam, Discord, etc.)",
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
													connections: {
														type: "array",
														items: {
															type: "object",
															properties: {
																pragmaPlayerId: {
																	type: "string",
																},
																pragmaDisplayName: {
																	type: "object",
																	properties: {
																		displayName: {
																			type: "string",
																		},
																		discriminator: {
																			type: "string",
																		},
																	},
																},
																idProviderAccounts: {
																	type: "array",
																	items: {
																		type: "object",
																		properties: {
																			idProviderType: {
																				type: "string",
																			},
																			accountId: {
																				type: "string",
																			},
																			providerDisplayName: {
																				type: "object",
																				properties: {
																					displayName: {
																						type: "string",
																					},
																					discriminator: {
																						type: "string",
																					},
																				},
																			},
																		},
																	},
																},
															},
														},
													},
													pragmaSocialId: {
														type: "string",
													},
												},
											},
										},
									},
								},
							},
						}
					})
					.get("/player-id-from-connection/:connectionType/:connectionId", async ({ params }) => {
						const { connectionType, connectionId } = params;
						// Convert connectionType to ConnectionType enum uppercase
						const connectionTypeUpper = connectionType.toUpperCase() as ConnectionType;
						console.log("[Player Route] - [GET] - /player-id-from-connection/:connectionType/:connectionId - ", connectionTypeUpper, connectionId);
						const player_id = await getPlayerIdByConnectionId(connectionTypeUpper, connectionId);
						return { ...player_id };
					}, {
						detail: {
							summary: "Get Player ID from Connection ID",
							description: "Gets back a player ID from a connection ID. This is useful for getting a player ID from a SteamID64, Discord ID, etc.",
							tags: ["Player"],
							parameters: [
								{
									name: "connectionType",
									in: "path",
									description: "The type of connection. (Example: STEAM, DISCORD, TWITCH, etc.)",
									required: true,
									schema: {
										type: "string",
									},
								},
								{
									name: "connectionId",
									in: "path",
									description: "The ID of the connection. (Example: SteamID64, Discord ID, etc.)",
									required: true,
									schema: {
										type: "string",
									},
								},
							],
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
					.get("/:playerId/steam_profile", async ({ params }) => {
						const { playerId } = params;
						console.log("[Player Route] - [GET] - /:playerId/steam_profile - ", playerId);
						
						// Get Steam account from player_account table
						const { data: accounts, error: accountError } = await db.client
							.from("spectre_player_account")
							.select("*")
							.eq("player", playerId)
							.eq("provider_type", "STEAM");

						if (accountError) {
							return { success: false, error: accountError.message };
						}

						if (!accounts || accounts.length === 0) {
							return { success: false, error: "No Steam account found for this player" };
						}

						const steamAccountId = accounts[0].account_id;
						
						try {
							const steamProfile = await steam.client.getUserSummary(steamAccountId);
							return { 
								success: true, 
								steam_profile: steamProfile 
							};
						} catch (error) {
							return { 
								success: false, 
								error: "Failed to fetch Steam profile" 
							};
						}
					}, {
						detail: {
							summary: "Get Player's Steam Profile",
							description: "Gets the Steam profile information for a player using their player ID",
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
														type: "boolean"
													},
													steam_profile: {
														type: "object",
														properties: {
															avatar: {
																type: "object",
																properties: {
																	small: { type: "string" },
																	medium: { type: "string" },
																	large: { type: "string" }
																}
															},
															nickname: { type: "string" },
															url: { type: "string" },
															created: { type: "number" },
															lastLogOff: { type: "number" },
															countryCode: { type: "string" },
															profileState: { type: "number" },
															personaState: { type: "number" }
														}
													},
													error: {
														type: "string",
														nullable: true
													}
												}
											}
										}
									}
								}
							}
						}
					})
			)
			.group("/match", (app) =>
				app
					.get("/:matchId", async ({ params }) => {
						const { matchId } = params;
						console.log("[Match Route] - [GET] - /:matchId - ", matchId);
						const match = await getMatch(matchId);
						return { ...match };
					}, {
						detail: {
							summary: "Get Match from DB",
							description: "Gets back a full match payload using the Match Id from the DB.",
							tags: ["Match"],
							responses: {
								200: {
									description: "Success",
									content: {
										"application/json": {
											schema: {
												"properties": {
													"success": {
														"type": "boolean"
													},
													"match": {
														"required": [
															"id",
															"created_at",
															"queue_name",
															"queue_game_mode",
															"queue_game_map",
															"region",
															"is_ranked",
															"is_abandoned_match",
															"match_date",
															"raw_match_data",
															"surrendered_team",
															"updated_at",
															"spectre_match_team"
														],
														"properties": {
															"id": {
																"type": "string"
															},
															"created_at": {
																"type": "string"
															},
															"queue_name": {
																"type": "string"
															},
															"queue_game_mode": {
																"type": "string"
															},
															"queue_game_map": {
																"type": "string"
															},
															"region": {
																"type": "string"
															},
															"is_ranked": {
																"type": "boolean"
															},
															"is_abandoned_match": {
																"type": "boolean"
															},
															"match_date": {
																"type": "string"
															},
															"raw_match_data": {
																"type": "string"
															},
															"surrendered_team": {
																"type": "number"
															},
															"spectre_match_team": {
																"type": "array",
																"items": {
																	"type": "object",
																	"properties": {
																		"id": {
																			"type": "string"
																		},
																		"team": {
																			"type": "string"
																		},
																		"match": {
																			"type": "string"
																		},
																		"created_at": {
																			"type": "string"
																		},
																		"rounds_won": {
																			"type": "number"
																		},
																		"team_index": {
																			"type": "number"
																		},
																		"xp_per_round": {
																			"type": "number"
																		},
																		"rounds_played": {
																			"type": "number"
																		},
																		"fans_per_round": {
																			"type": "number"
																		},
																		"used_team_rank": {
																			"type": "boolean"
																		},
																		"current_rank_id": {
																			"type": "number"
																		},
																		"previous_rank_id": {
																			"type": "number"
																		},
																		"xp_per_round_won": {
																			"type": "number"
																		},
																		"fans_per_round_won": {
																			"type": "number"
																		},
																		"num_ranked_matches": {
																			"type": "number"
																		},
																		"ranked_rating_delta": {
																			"type": "number"
																		},
																		"spectre_match_player": {
																			"type": "array",
																			"items": {
																				"type": "object",
																				"properties": {
																					"id": {
																						"type": "number"
																					},
																					"crew": {
																						"type": "string"
																					},
																					"team": {
																						"type": "string"
																					},
																					"player": {
																						"type": "string"
																					},
																					"division": {
																						"type": "string"
																					},
																					"num_kills": {
																						"type": "number"
																					},
																					"created_at": {
																						"type": "string"
																					},
																					"crew_score": {
																						"type": "number"
																					},
																					"num_deaths": {
																						"type": "number"
																					},
																					"num_assists": {
																						"type": "number"
																					},
																					"teammate_index": {
																						"type": "number"
																					},
																					"current_rank_id": {
																						"type": "number"
																					},
																					"previous_rank_id": {
																						"type": "number"
																					},
																					"selected_sponsor": {
																						"type": "string"
																					},
																					"saved_player_name": {
																						"type": "string"
																					},
																					"total_damage_done": {
																						"type": "number"
																					},
																					"num_ranked_matches": {
																						"type": "number"
																					},
																					"saved_sponsor_name": {
																						"type": "string"
																					},
																					"is_anonymous_player": {
																						"type": "boolean"
																					},
																					"current_ranked_rating": {
																						"type": "number"
																					},
																					"previous_ranked_rating": {
																						"type": "number"
																					},
																					"selected_banner_catalog_id": {
																						"type": "string"
																					}
																				}
																			}
																		},
																		"current_ranked_rating": {
																			"type": "number"
																		},
																		"is_full_team_in_party": {
																			"type": "boolean"
																		},
																		"previous_ranked_rating": {
																			"type": "number"
																		}
																	}
																}
															}
														},
														"type": "object"
													}
												},
											},
										},
									},
								},
							}
						},
					})
					.get("/:matchId/check", async ({ params }) => {
						const { matchId } = params;
						console.log("[Match Route] - [GET] - /:matchId/check - ", matchId);
						const match = await checkMatch(matchId);
						return { ...match };
					}, {
						detail: {
							summary: "Check Match",
							description: "Uses a Match Id to check if a match is available to pull from MT servers.",
							tags: ["Match"],
						}
					})
					.get("/:matchId/add", async ({ params }) => {
						const { matchId } = params;
						console.log("[Match Route] - [GET] - /:matchId/add - ", matchId);
						const match = await addMatch(matchId);
						return { ...match };
					}, {
						detail: {
							summary: "Add Match to DB",
							description: "Uses a Match Id to add a match to the DB. You likely should check the match first then use this endpoint to add it.",
							tags: ["Match"],
						}
					})
			)
			.group("/search", (app) =>
				app
					.group("/player", (app) =>
						app
							.get("/:playerName", async ({ params }) => {
								const { playerName } = params;
								console.log("[Search Route] - [GET] - /player/:playerName - ", playerName);
								const search_results = await searchPlayer(playerName, 10, 0, true);
								return { ...search_results };
							}, {
								detail: {
									summary: "Search for a player by display name from DB",
									description: "This uses the player's display name to search for a player in the DB.",
									tags: ["Search"],
								},
							})
					)
			)
			.group("/leaderboard", (app) =>
				app
					.get("/solo_ranked", async ({ query }: { query: { season?: string } }) => {
						const season = query.season !== undefined ? parseInt(query.season as string) : undefined;
						if (season !== undefined && (season < 0 || season > 2)) {
							return { success: false, error: "Invalid season" };
						}
						const leaderboard = await getSoloRankedLeaderboard(season);
						return { ...leaderboard };
					}, {
						detail: {
							summary: "Get Solo Ranked Leaderboard",
							description: "Get the solo ranked leaderboard. Optionally filter by season.",
							tags: ["Leaderboard"],
							parameters: [
								{
									name: "season",
									in: "query",
									description: "Season number to filter by (e.g. 0, 1, 2)",
									required: false,
									schema: {
										type: "integer"
									}
								}
							]
						},
					})
			)
	)
	.listen(3003);

console.log(
	`🔥 Wavescan is running at ${app.server?.hostname}:${app.server?.port}`,
);
