if getgenv().EasyExecute == true then
    return
end
getgenv().EasyExecute = true
local args = {...}
if WebSocket and WebSocket.connect and type(WebSocket.connect) == "function" then
    return task.spawn(function()
        local port = args[1] or 8080
        if queueteleport ~= nil and type(queueteleport) == "function" then
            pcall(function()
                queueteleport('loadstring(game:HttpGet("https://raw.githubusercontent.com/Nicuse101/easy-execute/refs/heads/master/loader.lua"))(' .. tostring(port) .. ')')
            end)
        end
        local WebSocket = WebSocket.connect('ws://localhost:'..tostring(port))
    
        local function getTextAfterPrefix(str, prefix)
            if string.sub(str, 1, #prefix) == prefix then
                return string.sub(str, #prefix + 1)
            else
                return nil 
            end
        end
    
        WebSocket:Send('Connected!')
    
        WebSocket.OnMessage:Connect(function(msg)
            local result = getTextAfterPrefix(msg, 'execute:')
            if result ~= nil then
                task.spawn(loadstring(result))
                WebSocket:Send('Successfully executed')
            end
        end)
    
        while true do wait() end
    end)
else
    error('Easy Execute: Unsupported executor.')
    getgenv().EasyExecute = false
    return
end
