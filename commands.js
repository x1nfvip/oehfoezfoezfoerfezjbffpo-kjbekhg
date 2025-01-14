const commands = {
    messageTools: {
        title: "Message Tools",
        icon: "fa-message",
        options: [
            { name: "Clear Messages", command: "clear", premium: false },
            { name: "Development!", command: null, premium: true },
            { name: "Development!", command: null, premium: true },
            { name: "Spam Messages", command: "spam", premium: false }
        ]
    },
    serverControls: {
        title: "Server Controls",
        icon: "fa-server",
        options: [
            { name: "Development!", command: null, premium: true },
            { name: "Development!", command: null, premium: true },
            { name: "Development!", command: null, premium: true },
            { name: "Nuke Server", command: "nuke", premium: false }
        ]
    },
    userActions: {
        title: "User Actions",
        icon: "fa-user",
        options: [
            { name: "Mass DM", command: "massdm", premium: false },
            { name: "Friend Manager", command: "friend", premium: false },
            { name: "Status Changer", command: "status", premium: false },
            { name: "Development!", command: null, premium: true }
        ]
    },
    raidTools: {
        title: "Raid Tools",
        icon: "fa-bomb",
        options: [
            { name: "Development!", command: null, premium: true },
            { name: "Development!", command: null, premium: true },
            { name: "Delete All Channels", command: "deletechannels", premium: false },
            { name: "Delete All Roles", command: "deleteroles", premium: false }
        ]
    }
};

function loadCommandCenter() {
    const mainContainer = document.getElementById('mainContainer');
    mainContainer.style.display = 'block';
    
    const commandGrid = document.querySelector('.command-grid');
    commandGrid.innerHTML = '';

    Object.values(commands).forEach(section => {
        const card = document.createElement('div');
        card.className = 'command-card';
        
        card.innerHTML = `
            <div class="command-title">
                <i class="fas ${section.icon}"></i> ${section.title}
            </div>
            <button class="open-button" onclick="toggleOptions('${section.title.replace(/\s+/g, '')}')">
                <span>Open Commands</span>
                <i class="fas fa-chevron-down"></i>
            </button>
            <div class="command-options" id="${section.title.replace(/\s+/g, '')}">
                ${section.options.map(opt => `
                    <button 
                        ${opt.premium ? 'class="premium-button"' : ''}
                        ${opt.command ? `onclick="executeCommand('${opt.command}')"` : ''}
                    >
                        ${opt.name}
                    </button>
                `).join('')}
            </div>
        `;
        
        commandGrid.appendChild(card);
    });

    const supportSection = document.createElement('div');
    supportSection.className = 'command-section';
    supportSection.innerHTML = `
        <h2>Support & Contact</h2>
        <div class="contact-container">
            <a href="mailto:x1nf@ddoslist.lol" class="contact-item">
                <i class="fas fa-envelope"></i>
                <span>Email Support</span>
            </a>
            <a href="https://discord.gg/cloudware" target="_blank" class="contact-item">
                <i class="fab fa-discord"></i>
                <span>Join Discord</span>
            </a>
            <a href="https://t.me/x1nff" target="_blank" class="contact-item">
                <i class="fab fa-telegram"></i>
                <span>Telegram</span>
            </a>
        </div>
    `;
    mainContainer.appendChild(supportSection);
}

function toggleOptions(id) {
    const options = document.getElementById(id);
    const button = options.previousElementSibling;
    const icon = button.querySelector('i.fa-chevron-down');
    
    options.classList.toggle('active');
    icon.style.transform = options.classList.contains('active') ? 'rotate(180deg)' : 'rotate(0)';
    button.classList.toggle('active');
}

window.loadCommandCenter = loadCommandCenter;
window.toggleOptions = toggleOptions;
