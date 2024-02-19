const { exec } = require('child_process');

export function verifyInstalled() {

    let response;

    exec('fnm --versions', (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(`Error al ejecutar el comando: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error en la salida estándar del comando: ${stderr}`);
            return;
        }
        console.log(`Salida del comando:\n${stdout}`);

        if (stdout.includes('fnm')) {
            response = 'Está instalado';
        }

    });

    return response;

}

export function getList(){

    let response;

    exec('fnm list', (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(`Error al ejecutar el comando: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Error en la salida estándar del comando: ${stderr}`);
            return;
        }

        console.log(`Salida del comando:\n${stdout}`);

        if (stdout.includes('fnm')) {
            response = 'Está instalado';
        }

    });


}


getList();



