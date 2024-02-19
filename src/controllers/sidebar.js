const button = document.getElementById('button');

button.addEventListener('click', () => {
    console.log("Amongos");
    // verifyInstalled();
});

const comando = 'fnm list-remote';

// function verifyInstalled() {

//     console.log("pre-exec");

//     exec('fnm --versions', (error, stdout, stderr) => {
//         if (error) {
//             console.error(`Error al ejecutar el comando: ${error.message}`);
//             return;
//         }
//         if (stderr) {
//             console.error(`Error en la salida estándar del comando: ${stderr}`);
//             return;
//         }
//         console.log(`Salida del comando:\n${stdout}`);

//         if (stdout.includes('fnm')) {
//             console.log('Está instalado');
//         }

//     });

//     console.log("post-exec");



// }


// verifyInstalled();
