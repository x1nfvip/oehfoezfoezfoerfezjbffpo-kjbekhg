let token = '';
let isConnected = false;
let mimicUserId = null;
let ws = null;

async function verifyDiscordToken() {
    const tokenInput = document.getElementById('discordToken').value;
    token = tokenInput;
    
    try {
        const response = await fetch('https://discord.com/api/v9/users/@me', {
            headers: { 'Authorization': token }
        });
        
        if (response.ok) {
            const userData = await response.json();
            isConnected = true;
            showNotification(`Connected as ${userData.username}`);
            document.getElementById('discordSection').style.display = 'none';
            loadCommandCenter(userData);
            return true;
        } else {
            throw new Error('Invalid token');
        }
    } catch (error) {
        showNotification('Connection failed: ' + error.message);
        return false;
    }
}

async function executeCommand(command) {
    if (!isConnected) {
        showNotification('Please connect first!');
        return;
    }

    try {
        switch(command) {
            case 'clear':
                const Amount = prompt('Enter number of messages to clear:');
                if (Amount) await clearMessages(Amount);
                break;
            case 'embed':
                const title = prompt('Enter embed title:');
                const description = prompt('Enter embed description:');
                if (title && description) await sendEmbed(title, description);
                break;
            case 'spam':
                const message = prompt('Enter message to spam:');
                const count = prompt('Enter number of times:');
                if (message && count) await spamMessages(message, count);
                break;
            case 'massdm':
                const dmMessage = prompt('Enter message to mass DM:');
                if (dmMessage) await massDM(dmMessage);
                break;
            case 'friend':
                const action = prompt('Enter action (add/remove/block/unblock):');
                const targetId = prompt('Enter user ID:');
                if (action && targetId) await manageFriends(targetId, action);
                break;
            case 'massrole':
                const roleId = prompt('Enter role ID:');
                const roleName = prompt('Enter role name:');
                if (roleId && roleName) await massRole(roleId, roleName);
                break;
            case 'status':
                const status = prompt('Enter status text:');
                if(status) await updateStatus(status);
                break;
            case 'nuke':
                if (confirm('Are you sure you want to nuke this server?')) {
                    await nukeServer();
                }
                break;
            case 'deletechannels':
                if (confirm('Are you sure you want to delete all channels?')) {
                    await deleteAllChannels();
                }
                break;
            case 'deleteroles':
                if (confirm('Are you sure you want to delete all roles?')) {
                    await deleteAllRoles();
                }
                break;
            case 'massBan':
                const banReason = prompt('Enter ban reason:');
                if (banReason) {
                    const targetUserIds = prompt('Enter user IDs to ban (comma-separated):').split(',');
                    if (targetUserIds.length > 0) {
                        await massBan(targetUserIds, banReason);
                    }
                }
                break;
            case 'serverlock':
                const lockReason = prompt('Enter lock reason:');
                if (lockReason) {
                    await serverLock(lockReason);
                }
                break;
                case 'mimic':
                    mimicUserId = prompt('Enter user ID to mimic:');
                    if (mimicUserId) {
                        showNotification(`Now mimicking user ID: ${mimicUserId}`);
                        initializeWebSocket();
                    }
                    break;
                
        }
        showNotification('Command executed successfully!');
    } catch (error) {
        showNotification('Command failed: ' + error.message);
    }
}

async function clearMessages(amount) {
    const channelId = prompt('Enter channel ID:');
    if (!channelId) return;

    const messages = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages?limit=${amount}`, {
        headers: { 'Authorization': token }
    }).then(res => res.json());

    for (const message of messages) {
        await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${message.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function sendEmbed(title, description) {
    const channelId = prompt('Enter channel ID:');
    if (!channelId) return;

    await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            embed: {
                title,
                description,
                color: 0x5865f2
            }
        })
    });
}

async function manageFriends(userId, action) {
    const types = {
        'add': 1,
        'remove': 2,
        'block': 3,
        'unblock': 0
    };

    if (!types[action]) {
        showNotification('Invalid action!');
        return;
    }

    try {
        const response = await fetch(`https://discord.com/api/v9/users/@me/relationships/${userId}`, {
            method: action === 'remove' ? 'DELETE' : 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: types[action]
            })
        });

        if (response.ok) {
            showNotification(`Successfully ${action}ed user!`);
        } else {
            throw new Error(`Failed to ${action} user`);
        }
    } catch (error) {
        showNotification(error.message);
    }
}

async function massrole(roleId, action) {
    const serverId = prompt('Enter server ID:');
    if (!serverId) return;

    const types = {
        'add': 1,
        'remove': 2
    };
    
    if (!types[action]) {
        showNotification('Invalid action!');
        return;
    }
    
    try {
        const response = await fetch(`https://discord.com/api/v9/guilds/${serverId}/members?limit=1000`, {
            headers: { 'Authorization': token }
        });
        const members = await response.json();
        
        for (const member of members) {
            const memberId = member.user.id;
            await fetch(`https://discord.com/api/v9/guilds/${serverId}/members/${memberId}/roles/${roleId}`, {
                method: action === 'add' ? 'PUT' : 'DELETE',
                headers: { 'Authorization': token }
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        showNotification(`Successfully ${action}ed role to all members!`);
    } catch (error) {
        showNotification(error.message);
    }
}

async function updateStatus(status) {
    try {
        await fetch('https://discord.com/api/v9/users/@me/settings', {
            method: 'PATCH',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                custom_status: {
                    text: status
                }
            })
        });
    } catch (error) {
        showNotification('Failed to update status');
    }
}

async function spamMessages(message, count) {
    const channelId = prompt('Enter channel ID:');
    if (!channelId) return;

    for (let i = 0; i < count; i++) {
        await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: message })
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function massDM(message) {
    const friends = await fetch('https://discord.com/api/v9/users/@me/relationships', {
        headers: { 'Authorization': token }
    }).then(res => res.json());

    for (const friend of friends) {
        try {
            const dm = await fetch('https://discord.com/api/v9/users/@me/channels', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ recipient_id: friend.id })
            }).then(res => res.json());

            await fetch(`https://discord.com/api/v9/channels/${dm.id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: message })
            });
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            continue;
        }
    }
}

async function nukeServer() {
    const serverId = prompt('Enter server ID:');
    if (!serverId) return;

    await deleteAllChannels(serverId);
    await deleteAllRoles(serverId);
}

async function deleteAllChannels(serverId) {
    if (!serverId) serverId = prompt('Enter server ID:');
    if (!serverId) return;

    const channels = await fetch(`https://discord.com/api/v9/guilds/${serverId}/channels`, {
        headers: { 'Authorization': token }
    }).then(res => res.json());

    for (const channel of channels) {
        await fetch(`https://discord.com/api/v9/channels/${channel.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function deleteAllRoles(serverId) {
    if (!serverId) serverId = prompt('Enter server ID:');
    if (!serverId) return;

    const roles = await fetch(`https://discord.com/api/v9/guilds/${serverId}/roles`, {
        headers: { 'Authorization': token }
    }).then(res => res.json());

    for (const role of roles) {
        await fetch(`https://discord.com/api/v9/guilds/${serverId}/roles/${role.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': token }
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function massBan(userIds, reason) {
    const serverId = prompt('Enter server ID:');
    if (!serverId) return;
    
    for (const userId of userIds) {
        await fetch(`https://discord.com/api/v9/guilds/${serverId}/bans/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                delete_message_days: 7,
                reason: reason
            })
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function serverLock(reason) {
    const serverId = prompt('Enter server ID:');
    if (!serverId) return;

    const channels = await fetch(`https://discord.com/api/v9/guilds/${serverId}/channels`, {
        headers: { 'Authorization': token }
    }).then(res => res.json());

    for (const channel of channels) {
        await fetch(`https://discord.com/api/v9/channels/${channel.id}/permissions/@everyone`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: 0,
                deny: "2048" // Deny send messages permission
            })
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function initializeWebSocket() {
    ws = new WebSocket('wss://gateway.discord.gg/?v=9&encoding=json');
    
    ws.onopen = () => {
        ws.send(JSON.stringify({
            op: 2,
            d: {
                token: token,
                properties: {
                    $os: 'windows',
                    $browser: 'chrome',
                    $device: 'chrome'
                }
            }
        }));
    };

    ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        
        if (data.t === 'MESSAGE_CREATE') {
            const message = data.d;
            if (message.author.id === mimicUserId) {
                await fetch(`https://discord.com/api/v9/channels/${message.channel_id}/messages`, {
                    method: 'POST',
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: message.content,
                        tts: false
                    })
                });
            }
        }
    };

    // Keep connection alive
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 1, d: null }));
        }
    }, 30000);
}
