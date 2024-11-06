const { Camunda8 } = require("@camunda8/sdk");
require('dotenv').config();
console.log(process.env.CAMUNDA_CLUSTER_ID);

const path = require("path");
const { type } = require("os");

// Crea una instancia nueva de Camunda 8
const camunda = new Camunda8();
const zeebe = camunda.getZeebeGrpcApiClient();

try {
    async function deployProcess() {
        deploy = await zeebe.deployResource({
            processFilename: path.join(process.cwd(), "peru-demo.bpmn"),
        });
        console.log(
            `[Zeebe] Proceso implementado: ${deploy.deployments[0].process.bpmnProcessId}`
        );
    }
    deployProcess();
    main();
} catch (e) {
    console.log(e);
}

//Deploy the process
async function main() {
    try {
        // Crea una instancia nueva de Camunda 8
        // const camunda = new Camunda8();
        // const zeebe = camunda.getZeebeGrpcApiClient();

        //Crear una instancia con el modelo arriba
        const p = await zeebe.createProcessInstance({
            bpmnProcessId: `peru-demo-no`,
        });
        console.log(`[Zeebe] Finished Process Instance ${p.processInstanceKey}.`);

        //Zeebe service task -- Procesar Pedido
        console.log("Empezando worker -- procesando pedido...");
        zeebe.createWorker({
            taskType: "procesarPedido",
            taskHandler: (job) => {
                try {
                    console.log("Algo de procesando aqui...")
                    //Error
                    // throw Error("Error en procesando pedido");
                    return job.complete({
                        procesandoResultado: "Exitosa!",
                    });
                } catch (error) {
                    console.error('Error en procesando pedido:', error);
                    job.error("errorProcesarPedido", error.message);
                }
            },
        });

        //Zeebe service task -- Cargar Cuenta
        console.log("Empezando worker -- cargando cuenta...");
        zeebe.createWorker({
            taskType: "cargarCuenta",
            taskHandler: (job) => {
                console.log("here");
                try {
                    //logic here
                    console.log("Algo de cargando cuenta aqui...");
                    //Error
                    // throw Error("Error en cargando cuenta");
                    return job.complete({
                        cargandoResultado: "Exitosa!",
                    });
                } catch (error) {
                    console.error('Error en cargando cuenta:', error);
                    job.error("errorCargarCuenta", error.message);
                }
            },
        });

        //Zeebe service task -- Cancelar Pedido
        console.log("Empezando worker -- cancelando pedido...");
        zeebe.createWorker({
            taskType: "cancelarPedido",
            taskHandler: (job) => {
                try {
                    //logic here
                    console.log("Algo de cancelación aqui...");

                    return job.complete({
                        cancelandoResultado: "Exitosa!",
                    });
                } catch (error) {
                    console.error('Error canceling order:', error);
                    job.fail(error.message);
                }
            },
        });
    }

    catch (error) {
        console.log("err")
        console.error(error);
    }
}

