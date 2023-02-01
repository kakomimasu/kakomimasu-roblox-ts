import { Game } from "@kakomimasu/client-js";

let gameId = "";
const cells = [];

export function update(data: Game) {
	if (gameId !== data.id) {
		print("new game!!");
		gameId = data.id;
		create(data);
	}
	print(data);
}

function create(data: Game) {
	if (!data.board) return;
	const board = data.board;
	print("create...");
	board.points.map((point, i) => {
		const x = i % board.width;

		const cell = new Instance("Part");
		// cell.Name = `{}`

		return cell;
	});
}
