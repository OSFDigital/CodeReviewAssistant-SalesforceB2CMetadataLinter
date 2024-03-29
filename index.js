const path = require("path");
const core = require("@actions/core");
const exec = require("@actions/exec");
const io = require("@actions/io");
const { v4: uuidV4 } = require("uuid");
const {
    BlobServiceClient,
    StorageSharedKeyCredential,
} = require("@azure/storage-blob");

async function run() {
    try {
        const xsdsPath = core.getInput("xsdsPath", { required: true });
        const xmlsPath = core.getInput("xmlsPath", { required: true });

        const azureAccount = core.getInput("azureAccount", { required: true });
        const azureKey = core.getInput("azureKey", { required: true });

        const tempDirectory = process.env.RUNNER_TEMP;
        if (!tempDirectory) {
            throw new Error("Missing env.RUNNER_TEMP!");
        }

        const destDirectory = path.join(tempDirectory, uuidV4());
        await io.mkdirP(destDirectory);

        const jarVer = "1.1.0";
        const blobURL = `https://${azureAccount}.blob.core.windows.net`;

        const azureCredentials = new StorageSharedKeyCredential(
            azureAccount,
            azureKey
        );
        const blobServiceClient = new BlobServiceClient(
            blobURL,
            azureCredentials
        );
        const containerClient = blobServiceClient.getContainerClient("jars");

        const blobName = `salesforceb2c-metadata-linter-${jarVer}.jar`;
        const blobClient = containerClient.getBlobClient(blobName);

        const jarPath = path.join(destDirectory, blobName);
        await blobClient.downloadToFile(jarPath);

        const javaPath = await io.which("java", true);
        core.setSecret(`${javaPath} -jar ${jarPath}`);
        await exec.exec(javaPath, [
            `-jar`,
            jarPath,
            `--xsds-path=${xsdsPath}`,
            `--xmls-path=${xmlsPath}`,
            `--annotations-type=GITHUB_ACTIONS`,
        ]);
    } catch (e) {
        core.setFailed(e.message);
    }
}

run();
