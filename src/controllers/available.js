var itemListOriginalOrder;

getNodeVersionAvailableList();

const itemList = document.getElementById('item-list');

const searchBar = document.getElementById('search-bar');


window.addEventListener('message', async (event) => {

    try {

        const message = event.data;

        switch (message.type) {

            case 'receive-list-available':

                const versionList = message.data;

                versionList.forEach(item => {

                    createNodeItem(item);

                });

                itemListOriginalOrder = Array.from(itemList.children);

                break;

            default:
                break;
        }

    } catch (error) {
        console.error(error);
    }

});


searchBar.addEventListener('input', () => {

    try {

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


    } catch (error) {
        console.error(error);
    }

});

//FNM Message sending

async function getNodeVersionAvailableList() {

    clientVsCode.postMessage({
        type: 'send-list-available'
    });

}

async function installNodeVersion(id) {

    clientVsCode.postMessage({
        type: 'send-install',
        data: id
    });

}

//View rendering functions

function createNodeItem(item) {

    try {

        const nodeItem = document.createElement('div');
        nodeItem.classList.add('node-item');

        let id = item.version.replace(/\./g, '_');

        id = 'v' + id;

        nodeItem.setAttribute('id', id);

        const nodeItemContent = document.createElement('div');
        nodeItemContent.classList.add('node-item-content');

        const version = document.createElement('span');
        version.classList.add('version');
        version.textContent = item.version;

        const tag = document.createElement('span');
        tag.classList.add('tag');

        switch (item.type) {
            case 'Current':
                tag.classList.add('remote');
                break;
            case 'LTS':
                tag.classList.add('lts');
                break;
            case 'Old Stable':
                tag.classList.add('old-stable');
                break;
            case 'Old Unstable':
                tag.classList.add('old-unstable');
                break;
            case 'Common':
                tag.classList.add('remote');
                break;

            default:
                break;
        }

        tag.textContent = item.type;

        const options = document.createElement('div');
        options.classList.add('options');

        const installOption = document.createElement('a');
        const setIcon = document.createElement('i');
        installOption.classList.add('action');
        setIcon.classList.add('codicon', 'codicon-cloud-download');
        installOption.appendChild(setIcon);

        options.appendChild(installOption);

        nodeItem.appendChild(nodeItemContent);
        nodeItemContent.appendChild(version);
        nodeItemContent.appendChild(tag);
        nodeItemContent.appendChild(options);

        itemList.appendChild(nodeItem);

        installOption.addEventListener('click', () => {
            installNodeVersion(item.version);
        });


    } catch (error) {
        console.error(error);
    }

}



