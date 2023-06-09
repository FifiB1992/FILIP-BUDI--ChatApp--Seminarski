const CLIENT_ID = 'uIFemsqPvldw9Mkz';
const drone = new ScaleDrone(CLIENT_ID, {
    data: {
        name: getRandomName(),
        color: getRandomColor(),
    },
});
let members = [];
drone.on('open', error => {
    if (error) { }
    const room = drone.subscribe('observable-room');
    room.on('open', error => {
        if (error) { }
    });
    room.on('members', m => {
        members = m;
        updateMembersDOM();
    });
    room.on('member_join', member => {
        members.push(member);
        updateMembersDOM();
    });
    room.on('member_leave', ({ id }) => {
        const index = members.findIndex(member => member.id === id);
        members.splice(index, 1);
        updateMembersDOM();
    });
    room.on('members', m => {
        members = m;
        updateMembersDOM();
        addDeleteButton();
    });
    room.on('data', (text, member) => {
        if (member) {
            addMessageToListDOM(text, member);
        }
    });
});
drone.on('close', event => { });
drone.on('error', error => { });
function getRandomName() {
    const adjs = ["Homer Simpson👨‍🦲", "Marge Simpson🤦‍♀️", "Bart Simpson👦", "Lisa🎷", "Maggie Simpson👼", "Mr.Burns🐕💰", "Moe🍻", "Ned Flanders✝️", "Clown Krusty🤡", "Fat Tony🤌🚬", "Carl👨🏿‍🦲", "Chief Wiggum👮"];
    return (
        adjs[Math.floor(Math.random() * adjs.length)] + ":"
    );
}
function getRandomColor() {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}
const DOM = {
    membersCount: document.querySelector('.members-count'),
    membersList: document.querySelector('.members-list'),
    messages: document.querySelector('.messages'),
    input: document.querySelector('.message-form__input'),
    form: document.querySelector('.message-form'),
};
DOM.form.addEventListener('submit', sendMessage);
function sendMessage() {
    const value = DOM.input.value;
    if (value === '') {
        return;
    }
    DOM.input.value = '';
    drone.publish({
        room: 'observable-room',
        message: value,
    });
}
function createMemberElement(member) {
    const { name, color } = member.clientData;
    const el = document.createElement('div');
    el.appendChild(document.createTextNode(name));
    el.className = 'member';
    el.style.color = color;
    return el;
}
function updateMembersDOM() {
    DOM.membersCount.innerText = `${members.length} users in room:`;
    DOM.membersList.innerHTML = '';
    members.forEach(member =>
        DOM.membersList.appendChild(createMemberElement(member))
    );
}
function addDeleteButton() {
    const button = document.createElement('button');
    button.innerText = 'Obriši razgovor';
    button.className = 'delete-button';
    button.addEventListener('click', () => {
        if (confirm('Jeste li sigurni da želite obrisati razgovor?')) {
            DOM.messages.innerHTML = '';
        }
    });
    DOM.form.parentNode.insertBefore(button, DOM.form.nextSibling);
}
function createMessageElement(text, member) {
    const el = document.createElement('div');
    el.appendChild(createMemberElement(member));
    el.appendChild(document.createTextNode(text));
    el.className = 'message';
    return el;
}
function addMessageToListDOM(text, member) {
    const el = DOM.messages;
    const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
    el.appendChild(createMessageElement(text, member));
    if (wasTop) {
        el.scrollTop = el.scrollHeight - el.clientHeight;
    }
}