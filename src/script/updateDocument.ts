import {collections} from '../app/services/db.service';

const updateDocument = async () => {
    try {
        await collections.channel?.updateMany({}, { 
            $rename: { 
                "versions.$[element].Changelog.Fr": "versions.$[element].Changelog.fr" 
            } 
        }, {
            arrayFilters: [{ "element.Changelog.Fr": { $exists: true } }]
        })
        console.log("Documents mis à jour avec succès !");
    }
    catch (error) {
        console.error(`Error while updating document : ${error}`);
    }
}

updateDocument();