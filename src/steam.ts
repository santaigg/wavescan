import SteamAPI from "steamapi";

export class Steam {
	private static instance: Steam;
	public client: SteamAPI;
	private constructor() {
		const api_key = process.env.STEAM_API_KEY || "";
		this.client = new SteamAPI(api_key);
	}

	public static getInstance(): Steam {
		if (!Steam.instance) {
			Steam.instance = new Steam();
		}
		return Steam.instance;
	}
}
