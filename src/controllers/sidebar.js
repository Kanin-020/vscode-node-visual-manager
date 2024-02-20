verifyIsInstalled();

getList();

const itemList = document.getElementById('item-list');


function verifyIsInstalled() {

    clientVsCode.postMessage({
        type: 'verifyIsInstalled'
    });

}

function getList(){

    clientVsCode.postMessage({
        type: 'getList'
    });

}


window.addEventListener('message', async (event) => {
    const message = event.data;

    console.log(message.data);



    // const item = document.createElement('div');
    // item.classList.add('node-item');



});
