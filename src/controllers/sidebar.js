var itemListOriginalOrder;

verifyNvmIsInstalled();

getCurrentNodeVersion();

getNodeVersionList();

const itemList = document.getElementById('item-list');

const searchBar = document.getElementById('search-bar');


window.addEventListener('message', async (event) => {

    const message = event.data;

    switch (message.type) {

        case 'receive-list':

            const versionList = message.data;

            getCurrentNodeVersion();

            versionList.forEach(item => {

                createNodeItem(item);

            });


            itemListOriginalOrder = Array.from(itemList.children);

            break;

        case 'receive-current':

            changeCurrentStateFromList(message.data);

            break;

        case 'receive-use':

            getCurrentNodeVersion();

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

//FNM Message sending

async function verifyNvmIsInstalled() {

    clientVsCode.postMessage({
        type: 'send-nvm'
    });

}

async function getNodeVersionList() {

    clientVsCode.postMessage({
        type: 'send-list'
    });

}

async function getCurrentNodeVersion() {

    clientVsCode.postMessage({
        type: 'send-current'
    });

}

async function useNodeVersion(id) {

    clientVsCode.postMessage({
        type: 'send-use',
        data: id
    });

}

async function uninstallNodeVersion(id) {

    clientVsCode.postMessage({
        type: 'send-uninstall',
        data: id
    });

}

//View rendering functions

function createNodeItem(item) {

    const nodeItem = document.createElement('div');
    nodeItem.classList.add('node-item');

    let id = item.replace(/\./g, '_');

    id = 'v' + id;


    nodeItem.setAttribute('id', id);

    const nodeItemContent = document.createElement('div');
    nodeItemContent.classList.add('node-item-content');

    const version = document.createElement('span');
    version.classList.add('version');
    version.textContent = item;

    const tag = document.createElement('span');
    tag.classList.add('tag', 'current');
    tag.textContent = 'current';

    const options = document.createElement('div');
    options.classList.add('options');

    const setOption = document.createElement('a');
    const setIcon = document.createElement('i');
    setOption.classList.add('action');
    setIcon.classList.add('codicon', 'codicon-run');
    setOption.appendChild(setIcon);

    const deleteOption = document.createElement('a');
    const deleteIcon = document.createElement('i');
    deleteOption.classList.add('action');
    deleteIcon.classList.add('codicon', 'codicon-close');
    deleteOption.appendChild(deleteIcon);

    options.appendChild(setOption);
    options.appendChild(deleteOption);

    nodeItem.appendChild(nodeItemContent);
    nodeItemContent.appendChild(version);
    nodeItemContent.appendChild(tag);
    nodeItemContent.appendChild(options);

    itemList.appendChild(nodeItem);

    setOption.addEventListener('click', () => {
        useNodeVersion(item);
    });

    deleteOption.addEventListener('click', () => {
        uninstallNodeVersion(item);
    });


}

function changeCurrentStateFromList(id) {

    try {

        let castedId = id.replace(/\./g, '_');

        const item = itemList.querySelector('#' + castedId);

        const tag = item.querySelector('.tag');

        tag.classList.add('show');

        const idList = [];

        const itemChildrenList = itemList.children;

        for (let i = 0; i < itemChildrenList.length; i++) {

            if (itemChildrenList[i].id.includes('v')) {
                idList.push(itemChildrenList[i].id);
            }

        }

        for (let i = 0; i < idList.length; i++) {

            castedId = castedId.trim();

            idList[i] = idList[i].trim();

            if (castedId !== idList[i]) {

                const element = itemList.querySelector('#' + idList[i]);
                const tag = element.querySelector('.tag');
                tag.classList.remove('show');

            }
        }

    } catch (error) {
        console.error('Item not defined: ' + error);
    }

}

function deleteItemFromList(id) {

    try {

        let castedId = id.replace(/\./g, '_');

        castedId = 'v' + castedId;

        const deletedItem = document.getElementById(castedId);

        itemList.removeChild(deletedItem);

    } catch {
        console.error('Item not defined');
    }


}

