import { HttpService, Workspace } from "@rbxts/services";
import Roact from "@rbxts/roact";
import * as BoardManager from "./BoardManager";
import { Game, User } from "@kakomimasu/client-js";

interface MyComponentProps {
	data: Game;
}

const FREE_COLOR = new Color3(1, 1, 1);

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

const URL = "https://api.kakomimasu.com/v1/matches?sort=startedAtUnixTime&limit=1";

function access() {
	const result = pcall(() => {
		const response = HttpService.GetAsync(URL);
		const game2 = HttpService.JSONDecode(response) as Game[];
		return game2[1];
	});
	return result[1] as Game;
}

function Board({ data }: MyComponentProps) {
	if ((!data.gaming && !data.ending) || !data.board || !data.tiled) {
		return <></>;
	}
	const cells = [];
	const width = data.board.width;
	const height = data.board.height;
	const xs = 1 / width;
	const ys = 1 / height;

	BoardManager.update(data);

	const layout = (
		<uigridlayout
			FillDirectionMaxCells={width}
			SortOrder={Enum.SortOrder.LayoutOrder}
			CellSize={new UDim2(xs, 0, ys, 0)}
			CellPadding={new UDim2(0, 0, 0, 0)}
		/>
	);
	cells.push(layout);

	for (let y = 1; y < height; y++) {
		for (let x = 1; x < width; x++) {
			const n = (y - 1) * width + x;
			const point = data.board.points[n];
			const tile = data.tiled[n];
			if (!tile) {
				continue;
			}
			let playerImage, cellColor;
			if (tile.player !== undefined && tile.player) {
				const player = PLAYER[tile.player + 1];
				playerImage = player.image;
				cellColor = Color3.fromHex(player.color[tile.type + 1]);
			} else {
				cellColor = FREE_COLOR;
			}

			const cellContents = [];

			if (playerImage) {
				const cellImage = (
					<imagelabel Image={playerImage} BackgroundTransparency={1} Size={new UDim2(1, 0, 1, 0)} />
				);
				cellContents.push(cellImage);
			}

			const cellText = (
				<textlabel
					Text={"" + point}
					Size={new UDim2(1, 0, 1, 0)}
					TextScaled={true}
					TextSize={9999}
					BackgroundTransparency={1}
					TextXAlignment={Enum.TextXAlignment.Right}
					TextYAlignment={Enum.TextYAlignment.Bottom}
				/>
			);
			cellContents.push(cellText);

			const cell = (
				<frame BackgroundColor3={cellColor} LayoutOrder={n}>
					{cellContents}
				</frame>
			);
			cells.push(cell);
		}
	}

	return (
		<frame Position={new UDim2(0, 0, 0, 400)} Size={new UDim2(1, 0, 1, -400)}>
			<>{cells}</>
		</frame>
	);
}

function Status({ data }: MyComponentProps) {
	let text = "";

	if (data.gaming || data.ending) {
		const player1 = data.players[1];
		const player2 = data.players[2];
		const point1 = player1.point.areaPoint + player1.point.wallPoint;
		const point2 = player2.point.areaPoint + player2.point.wallPoint;
		text = "ポイント:" + point1 + "対" + point2 + " ターン:" + data.turn + "/" + data.totalTurn;
	}

	return (
		<textlabel
			Position={new UDim2(0, 0, 0, 0)}
			Size={new UDim2(1, 0, 0, 200)}
			Text={text}
			TextScaled={true}
			BackgroundColor3={new Color3(1, 1, 1)}
		/>
	);
}

function getUser(userId: string) {
	const usersURL = "https://api.kakomimasu.com/v1/users/" + userId;
	const result = pcall(() => {
		const response = HttpService.GetAsync(usersURL);
		const json = HttpService.JSONDecode(response);
		return json;
	});
	return result[1] as User;
}

function PlayerName({ data }: MyComponentProps) {
	let text = "";

	let player1Name = "";
	let player2Name = "";

	if (data.gaming || data.ending) {
		const player1 = data.players[1];
		const player2 = data.players[2];

		if (player1.type === "account") {
			// account player
			const user1 = getUser(player1.id);
			player1Name = user1.screenName;
			const user2 = getUser(player2.id);
			player2Name = user2.screenName;
		} else {
			// guest player
			player1Name = player1.id;
			player2Name = player2.id;
		}

		const point1 = player1.point.areaPoint + player1.point.wallPoint;
		const point2 = player2.point.areaPoint + player2.point.wallPoint;
		text = player1Name + "対" + player2Name;
	}

	return (
		<textlabel
			Position={new UDim2(0, 0, 0, 200)}
			Size={new UDim2(1, 0, 0, 200)}
			Text={text}
			TextScaled={true}
			BackgroundColor3={new Color3(1, 1, 1)}
		/>
	);
}

function Main({ data }: MyComponentProps) {
	return (
		<>
			<Status data={data} />
			<PlayerName data={data} />
			<Board data={data} />
		</>
	);
}

const data = access();
const parent = Workspace.FindFirstChild("Display")?.FindFirstChild("SurfaceGui");
let handle = Roact.mount(<Main data={data} />, parent);

while (wait(1)) {
	const data = access();
	handle = Roact.update(handle, <Main data={data} />);
}
