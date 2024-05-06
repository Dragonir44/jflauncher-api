import {collections} from '../app/services/db.service';

const updateDocument = async () => {
    try {
        await collections.channel?.bulkWrite([
            {
                updateMany: {
                    filter: {},
                    update: [
                        {
                            $rename: {
                                "versions.$[element].Version": "versions.$[element].version",
                                // "versions.$[element].changelog.fr": "versions.$[element].Changelog.Fr",
                                // "versions.$[element].changelog.en": "versions.$[element].Changelog.En",
                                // "versions.$[element].path": "versions.$[element].Path",
                                // "versions.$[element].forgeVersion": "versions.$[element].ForgeVersion"
                            }
                        }
                    ],
                    arrayFilters: [{ "element.version": { $exists: true } }]
                }
            }
        ])
        console.log("Documents mis à jour avec succès !");
    }
    catch (error) {
        console.error(`Error while updating document : ${error}`);
    }
}

updateDocument();