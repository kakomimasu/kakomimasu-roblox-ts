import { HttpService, ReplicatedStorage } from "@rbxts/services";
import Roact from '@rbxts/roact';

const ReplicatedStorage = game.GetService("ReplicatedStorage");
const Roact = require(ReplicatedStorage.Roact);

const BoardManager = require(script.Parent.ModuleScript)

const FREE_COLOR = new Color3(1, 1, 1)

const PLAYER = [
	{
		image: "rbxassetid://12194525464",
		color: ["80C9FF", "0096FF"]
	},
	{
		image: "rbxassetid://12194525688",
		color: ["FE9998", "FF0200"]
	},
	{
		image: "rbxassetid://12194525849",
		color: ["B8ABD6", "9370db"]
	},
	{
		image: "rbxassetid://12194526006",
		color: ["FFCF99", "ff8c00"]
	}
]

const URL = "https://api.kakomimasu.com/v1/matches?sort=startedAtUnixTime&limit=1";

function access() {
	const success, data = pcall(() => {
		const response = HttpService.GetAsync(URL);
		const game = HttpService.JSONDecode(response);
		return game[1];
	});
	return data
}

function Board(data) {
	if not data.gaming and not data.ending then
		return Roact.createFragment({})
	end
	local cells = {}
	local width = data.board.width
	local height = data.board.height
	local xs = 1 / width
	local ys = 1 / height
	
	BoardManager.update(data)
	
	local layout = Roact.createElement("UIGridLayout", {
		FillDirectionMaxCells = width,
		SortOrder = "LayoutOrder",
		CellSize = UDim2.new(xs, 0, ys, 0),
		CellPadding = UDim2.new(0, 0, 0, 0) 
	})
	table.insert(cells, layout)
	
	for y = 1, height do
		for x = 1, width do
			local n = (y - 1) * width + x
			local point = data.board.points[n]
			local tile = data.tiled[n]
			local playerImage, cellColor
			if tile.player ~= nil then
				local player = PLAYER[tile.player + 1] 
				playerImage = player.image
				cellColor = Color3.fromHex(player.color[tile.type + 1])
			else
				cellColor = FREE_COLOR
			end
			
			local cellContents = {} 
			
			if playerImage then
				local cellImage = Roact.createElement("ImageLabel", {
					Image = playerImage,
					BackgroundTransparency = 1,
					Size = UDim2.new(1, 0, 1, 0)
				})
				table.insert(cellContents, cellImage)
			end
			
			local cellText = Roact.createElement("TextLabel", {
				Text = point,
				Size = UDim2.new(1, 0, 1, 0),
				TextScaled = true,
				TextSize = 9999,
				BackgroundTransparency = 1,
				TextXAlignment = "Right",
				TextYAlignment = "Bottom"
			})
			table.insert(cellContents, cellText)
			
			local cell = Roact.createElement("Frame", {
				BackgroundColor3 = cellColor,
				LayoutOrder = n
			}, cellContents)
			table.insert(cells, cell)
		end
	end

	return Roact.createElement("Frame", {
			Position = UDim2.new(0, 0, 0, 400),
			Size = UDim2.new(1, 0, 1, -400)
		}, {
			Roact.createFragment(cells)
	})
end

local function Status(data)
	local text = ""
	
	if data.gaming or data.ending then
		local player1 = data.players[1]
		local player2 = data.players[2]
		local point1 = player1.point.areaPoint + player1.point.wallPoint
		local point2 = player2.point.areaPoint + player2.point.wallPoint
		text = "ポイント:" .. point1 .. "対" .. point2 .. " ターン:" .. data.turn .. "/" .. data.totalTurn
	end

	return Roact.createElement("TextLabel", {
		Position = UDim2.new(0, 0, 0, 0),
		Size = UDim2.new(1, 0, 0, 200),
		Text = text,
		TextScaled = true,
		BackgroundColor3 = Color3.new(1, 1, 1)
	})
end


local function getUser(userId)
	local usersURL = "https://api.kakomimasu.com/v1/users/" .. userId
	local success, data = pcall(function()
		local response = HttpService:GetAsync(usersURL)
		local json = HttpService:JSONDecode(response)
		return json
	end)
	return data
end


local function PlayerName(data)
	local text = ""
	
	local player1Name = ""
	local player2Name = ""
	
	if data.gaming or data.ending then
		local player1 = data.players[1]
		local player2 = data.players[2]
		
		if (player1.type == "account") then
			-- account player
			local user1 = getUser(player1.id)
			player1Name = user1.screenName
			local user2 = getUser(player2.id)
			player2Name = user2.screenName
		else
			-- guest player
			player1Name = player1.id
			player2Name = player2.id
		end
		
		local point1 = player1.point.areaPoint + player1.point.wallPoint
		local point2 = player2.point.areaPoint + player2.point.wallPoint
		text = player1Name .. "対" .. player2Name
	end

	return Roact.createElement("TextLabel", {
		Position = UDim2.new(0, 0, 0, 200),
		Size = UDim2.new(1, 0, 0, 200),
		Text = text,
		TextScaled = true,
		BackgroundColor3 = Color3.new(1, 1, 1)
	})
end

local function Main(data)
	return Roact.createFragment({
		Status(data),
		PlayerName(data),
		Board(data)
	})
end

local data = access()
local parent = workspace.Display.SurfaceGui
local handle = Roact.mount(Main(data), parent)

while wait(1) do
	data = access()
	handle = Roact.update(handle, Main(data))
end

