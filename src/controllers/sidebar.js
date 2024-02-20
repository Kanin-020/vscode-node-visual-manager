verifyIsInstalled();

getNodeVersionList();

getNodeVersionRemoteList();

const itemList = document.getElementById('item-list');

window.addEventListener('message', async (event) => {

    const message = event.data;

    switch (message.type) {
        case 'receive-list':

            const versionList = message.data;

            versionList.forEach(item => {

                createNodeItem(item);

            });

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

        nodeItem.setAttribute('id', item.version);

        const nodeItemContent = document.createElement('div');
        nodeItemContent.classList.add('node-item-content');

        const alias = document.createElement('span');
        alias.classList.add('alias');
        alias.textContent = item.alias;

        const version = document.createElement('span');
        version.classList.add('version');
        version.textContent = item.version;

        const options = document.createElement('div');
        options.classList.add('options');

        const favoriteOption = document.createElement('a');
        const favoriteIcon = document.createElement('i');
        favoriteOption.classList.add('action');

        if (item.alias.includes('default')) {
            favoriteIcon.classList.add('codicon', 'codicon-heart-filled');
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

        favoriteOption.addEventListener('click', () => {
            setDefaultNodeVersion(item.version);
        });

        deleteOption.addEventListener('click', () => {
            uninstallNodeVersion(item.version);
        });

        options.appendChild(favoriteOption);
        options.appendChild(editOption);
        options.appendChild(deleteOption);

        nodeItem.appendChild(nodeItemContent);
        nodeItemContent.appendChild(alias);
        nodeItemContent.appendChild(version);
        nodeItemContent.appendChild(options);

        itemList.appendChild(nodeItem);

    }
}

function changeDefaultStateFromList(id) {

    try {

        const oldIcon = itemList.querySelector('.codicon-heart-filled');

        oldIcon.classList.remove('codicon-heart-filled');
        oldIcon.classList.add('codicon-heart');

        const changedItem = document.getElementById(id);

        const icon = changedItem.querySelector('.codicon-heart');

        icon.classList.remove('codicon-heart');
        icon.classList.add('codicon-heart-filled');


    } catch {

        console.error('Item not defined');

    }

}

function deleteItemFromList(id) {

    const deletedItem = document.getElementById(id);

    itemList.removeChild(deletedItem);

}

