verifyIsInstalled();

getNodeVersionList();

getNodeVersionRemoteList();

const itemList = document.getElementById('item-list');

const searchBar = document.getElementById('search-bar');

var itemListOriginalOrder;

window.addEventListener('message', async (event) => {

    const message = event.data;

    switch (message.type) {

        case 'receive-list':

            const versionList = message.data;

            versionList.forEach(item => {

                createNodeItem(item);

            });

            getCurrentNodeVersion();

             itemListOriginalOrder = Array.from(itemList.children);

            break;

        case 'receive-current':

            changeCurrentStateFromList(message.data);

            break;

        case 'receive-default':

            changeDefaultStateFromList(message.data);

            break;

        case 'receive-uninstall':

            deleteItemFromList(message.data);

            break;

        default:
            break;
    }


});


searchBar.addEventListener('input', () => {

    if (searchBar.value === '') {
        itemList.innerHTML = '';
        itemListOriginalOrder.forEach((originalItem) => {
            itemList.appendChild(originalItem.cloneNode(true));
        });
        return;
    }

    const children = Array.from(itemList.children);

    const filteredChildren = children.filter((child) => {
        return child.textContent.toLowerCase().includes(searchBar.value.toLowerCase());
    });

    filteredChildren.sort((a, b) => {
        return a.textContent.localeCompare(b.textContent);
    });

    itemList.innerHTML = '';

    filteredChildren.forEach((child) => {
        itemList.appendChild(child);
    });

});

//FNM Functions

function verifyIsInstalled() {

    clientVsCode.postMessage({
        type: 'send-installed'
    });

}

function getNodeVersionList() {

    clientVsCode.postMessage({
        type: 'send-list'
    });

}

function getNodeVersionRemoteList() {

    clientVsCode.postMessage({
        type: 'send-list-remote'
    });

}

function getCurrentNodeVersion() {

    clientVsCode.postMessage({
        type: 'send-current'
    });

}

function setDefaultNodeVersion(id) {

    clientVsCode.postMessage({
        type: 'send-default',
        data: id
    });

}

function uninstallNodeVersion(id) {

    clientVsCode.postMessage({
        type: 'send-uninstall',
        data: id
    });
}



//View rendering functions

function createNodeItem(item) {

    if (item.alias === '') {
        item.alias = item.version;
    }

    if (item.alias !== '' && item.version !== '') {

        const nodeItem = document.createElement('div');
        nodeItem.classList.add('node-item');

        const id = item.version.replace(/\./g, '_');

        nodeItem.setAttribute('id', id);

        const nodeItemContent = document.createElement('div');
        nodeItemContent.classList.add('node-item-content');

        const alias = document.createElement('span');
        alias.classList.add('alias');
        alias.textContent = item.alias;

        const tag = document.createElement('span');
        tag.classList.add('tag');

        const version = document.createElement('span');
        version.classList.add('version');
        version.textContent = item.version;

        const options = document.createElement('div');
        options.classList.add('options');

        const favoriteOption = document.createElement('a');
        const favoriteIcon = document.createElement('i');
        favoriteOption.classList.add('action');

        if (item.default === true) {
            favoriteIcon.classList.add('codicon', 'codicon-heart-filled');

            tag.classList.add('default', 'show');
            tag.textContent = 'default';

        } else {
            favoriteIcon.classList.add('codicon', 'codicon-heart');
        }

        favoriteOption.appendChild(favoriteIcon);

        const editOption = document.createElement('a');
        const editIcon = document.createElement('i');
        editOption.classList.add('action');
        editIcon.classList.add('codicon', 'codicon-edit');
        editOption.appendChild(editIcon);

        const deleteOption = document.createElement('a');
        const deleteIcon = document.createElement('i');
        deleteOption.classList.add('action');
        deleteIcon.classList.add('codicon', 'codicon-close');
        deleteOption.appendChild(deleteIcon);

        options.appendChild(favoriteOption);
        options.appendChild(editOption);
        options.appendChild(deleteOption);

        nodeItem.appendChild(nodeItemContent);
        nodeItemContent.appendChild(alias);
        nodeItemContent.appendChild(tag);
        nodeItemContent.appendChild(version);
        nodeItemContent.appendChild(options);

        itemList.appendChild(nodeItem);

        favoriteOption.addEventListener('click', () => {
            setDefaultNodeVersion(item.version);
        });

        deleteOption.addEventListener('click', () => {
            uninstallNodeVersion(item.version);
        });

    }
}

function changeCurrentStateFromList(id) {

    try {
        const castedId = id.replace(/\./g, '_');

        console.log(castedId);

        const item = itemList.querySelector('#' + castedId);

        const tag = item.querySelector('.tag');

        tag.classList.add('current', 'show');

        tag.textContent = 'current';

    } catch {
        console.error('Item not defined');
    }


}

function changeDefaultStateFromList(id) {

    try {

        const castedId = id.replace(/\./g, '_');

        console.log(castedId);

        const oldItem = itemList.querySelector('.default');

        oldItem.classList.remove('show');

        const oldIcon = itemList.querySelector('.codicon-heart-filled');

        oldIcon.classList.remove('codicon-heart-filled');
        oldIcon.classList.add('codicon-heart');

        const changedItem = document.getElementById(castedId);

        const icon = changedItem.querySelector('.codicon-heart');

        icon.classList.remove('codicon-heart');
        icon.classList.add('codicon-heart-filled');


    } catch {

        console.error('Item not defined');

    }

}

function deleteItemFromList(id) {

    try {

        const castedId = id.replace(/\./g, '_');

        const deletedItem = document.getElementById(castedId);

        itemList.removeChild(deletedItem);

    } catch {
        console.error('Item not defined');
    }


}

