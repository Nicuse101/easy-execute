if getgenv().EasyExecute == true then
    return
end
getgenv().EasyExecute = true
local args = {...}
if WebSocket and WebSocket.connect and type(WebSocket.connect) == "function" then
    return task.spawn(function()
        local port = args[1] or 8080
        local address = args[2] or "localhost"
        if queue_on_teleport and type(queue_on_teleport) == "function" then
            pcall(function()
                queue_on_teleport(`loadstring(game:HttpGet("https://raw.githubusercontent.com/Nicuse101/easy-execute/refs/heads/master/loader.lua"))({port}, {address})`)
            end)
        end
        print(`Attempting to connect to {address}:{port}...`)
        local ConnectionSuccessful, WebSocket = pcall(function()
            return WebSocket.connect(`ws://{address}:{port}`)
        end)
        if ConnectionSuccessful then
            print(`[Easy Execute] Successfully connected to {address}:{port}!`)
            WebSocket:Send(`Client connected {game:GetService("Players").LocalPlayer.Name}`)
        else
            getgenv().EasyExecute = false
            error(`[Easy Execute] Failed to connect to {address}:{port}`)
        end
    
        local function getTextAfterPrefix(str, prefix)
            if string.sub(str, 1, #prefix) == prefix then
                return string.sub(str, #prefix + 1)
            else
                return nil 
            end
        end
    
        WebSocket.OnMessage:Connect(function(msg)
            local start = os.clock()
            local result = getTextAfterPrefix(msg, 'execute:')
            if result ~= nil then
                local success, err = pcall(function()
                    return loadstring(result)()
                end)
                if success then
                    print(`[Easy Execute] Successfully executed from server in {os.clock() - start}s.`)
                    WebSocket:Send('Successfully executed')
                else
                    error(`An error occured while trying to execute script from server: {err}`)
                    WebSocket:Send(`An error occured while trying to execute the script: {err}`)
                end
            end
        end)
    
        while true do task.wait() end -- Keep connection alive
    end)
else
    getgenv().EasyExecute = false
    error('[Easy Execute] Unsupported executor.')
    return
end
