import { Game } from "@kakomimasu/client-js";
import { Workspace } from "@rbxts/services";

let gameId = "";
const cells: { x: number; y: number; i: number; cell: Part }[] = [];
const agents: { agent: Part }[][] = [];

const CELL_SIZE = 10;
const AREA_HEIGHT = 1;
const WALL_HEIGHT = 4;

const PLAYER = [
	{
		image: "rbxassetid://12194525464",
		color: ["80C9FF", "0096FF"],
	},
	{
		image: "rbxassetid://12194525688",
		color: ["FE9998", "FF0200"],
	},
	{
		image: "rbxassetid://12194525849",
		color: ["B8ABD6", "9370db"],
	},
	{
		image: "rbxassetid://12194526006",
		color: ["FFCF99", "ff8c00"],
	},
];

export function update(data: Game) {
	if (gameId !== data.id) {
		print("new game!!");
		gameId = data.id;
		create(data);
	}

	cells.forEach(({ x, y, i, cell }) => {
		const tile = data.tiled?.[i];
		if (!tile) return;
		let color = "FFFFFF";
		let sizeY = AREA_HEIGHT;
		if (tile.player) {
			color = PLAYER[tile.player].color[tile.type];
			if (tile.type === 1) {
				sizeY = WALL_HEIGHT;
			}
		}

		cell.Color = Color3.fromHex(color);
		cell.Size = new Vector3(CELL_SIZE, sizeY, CELL_SIZE);
		cell.Position = new Vector3(cell.Position.X, sizeY / 2, cell.Position.Z);
	});
}

function create(data: Game) {
	cells.forEach((cell) => cell.cell.Destroy());
	cells.clear();
	agents.forEach((agent) => agent.forEach((a) => a.agent.Destroy()));
	agents.clear();

	if (!data.board) return;
	const board = data.board;
	const width = board.width;
	const height = board.height;
	print("create...");
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const cell = new Instance("Part");
			cell.Name = `${x}:${y}`;
			cell.Parent = Workspace.FindFirstChild("Board");
			cell.Anchored = true;
			cell.Material = Enum.Material.Asphalt;

			cell.Size = new Vector3(CELL_SIZE, AREA_HEIGHT, CELL_SIZE);
			cell.Position = new Vector3(
				x * CELL_SIZE - (width * CELL_SIZE) / 2,
				0,
				y * CELL_SIZE - (height * CELL_SIZE) / 2,
			);

			cells.push({ x, y, i: y * width + x, cell });
		}
	}

	// for (let pIdx = 0; pIdx < board.nPlayer; pIdx++) {
	// 	agents[pIdx] = [];
	// 	for (let aIdx = 0; aIdx < board.nAgent; aIdx++) {
	// 		const agent = new Instance("Part");
	// 		agent.Name = `p-${pIdx}:a-${aIdx}`;
	// 		agent.Parent = Workspace.FindFirstChild("Agents");
	// 		agent.Anchored = true;
	// 		agent.Size = new Vector3()
	// 	}
	// 	data.players.forEach((player, pIdx) => {
	// 		player.agents.forEach((agent, aIdx) => {
	// 			agents[pIdx][aIdx] =
	// 	 });
	// 	})
	// }
}
