import fs from 'fs';
import path from 'path';
import bsplit from 'buffer-split';

import { Channel } from '../classes/Channel';
import { Version } from '../classes/Version';

var channels: Channel[] = []

function readLineJSON(path: string) {
    const buf = fs.readFileSync(path); // omitting encoding returns a Buffer
    const delim = Buffer.from('\n');
    const result: any = bsplit(buf, delim);
    return result
      .map((x: any) => x.toString())
      .filter((x: any) => x !== "")
    //   .map(JSON.parse);
}

export const init = () => {
    const repoPath: string = "repo"
    channels = []
    
    if (!fs.existsSync(repoPath)) {
        fs.mkdirSync(repoPath)
    }

    if (!fs.existsSync("uploads")) {
        fs.mkdirSync("uploads")
    }

    const repoContent: any = fs.readdirSync(path.join(repoPath))

    for(const folderName of repoContent) {
        const folderPath: string = path.join(repoPath, folderName)
        const folderContent: any = fs.readdirSync(folderPath)
        const channel: Channel = new Channel(folderName)
        
        for(const subFolderName of folderContent) {
            const regex = new RegExp(/.*\.zip$/)
            const filePath: string = fs.readdirSync(path.join(repoPath, folderName, subFolderName)).filter((file: string) => regex.test(file))[0]
            const changelog: any = fs.existsSync(path.join(repoPath, folderName, subFolderName, "changelog")) ? path.join(repoPath, folderName, subFolderName, "changelog") : false
            const fileContent: string = readLineJSON(changelog)
            const forgeVersion: string = fs.readdirSync(path.join(repoPath, folderName, subFolderName)).filter((file: string) => new RegExp(/[0-9]{2}\.[0-9]{1}\.[0-9]{2}/).test(file))[0]
            const version: Version = new Version(subFolderName, fileContent, path.join(repoPath, folderName, subFolderName, filePath), forgeVersion)
            channel.Version = version
        }

        channels.push(channel)
    }
}

export const getChannels = () => {
    return channels
}

export const createChannel = (name: string) => {
    const repoPath: string = "repo"
    fs.mkdirSync(path.join(repoPath, name))

    const channel: Channel = new Channel(name)
    channels.push(channel)

    return channel
}

export const getChannel = (name: string) => {
    return channels.filter((channel: Channel) => channel.ChannelName === name)[0]
}

export const updateChannel = async (name: string, newName: string) => {
    const repoPath: string = "repo"
    const channelPath: string = path.join(repoPath, name)
    const newChannelPath: string = path.join(repoPath, newName)

    if (fs.existsSync(channelPath)) {
        await fs.renameSync(channelPath, newChannelPath)
    }

    init()

    return true
}

export const deleteChannel = (name: string) => {
    const repoPath: string = "repo"
    const channelPath: string = path.join(repoPath, name)

    if (fs.existsSync(channelPath)) {
        fs.rmdirSync(channelPath, { recursive: true })
    }

    init()

    return true
}

export const createVersion = (channel: string, name: string, changelog: string, file: any, forgeVersion: string) => {
    const repoPath: string = "repo"
    const channelPath: string = path.join(repoPath, channel)
    const latestVersion: string | boolean | undefined = fs.existsSync(path.join(channelPath, 'latest')) ? fs.readdirSync(path.join(channelPath, 'latest')).find((file: string) => file.endsWith('.zip')) : false
    const versionPath = path.join(repoPath, channel, name) as string

    if (!fs.existsSync(channelPath)) {
        createChannel(channel)
    }

    // check if new version name is newer than latest version
    if(latestVersion) {
        const latestVersionName: string = latestVersion.split('.zip')[0]
        if(latestVersionName <= name) {
            // remove old latest file
            fs.unlinkSync(path.join(channelPath, 'latest', latestVersion))

            // copy new latest file
            fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, 'latest', `${name}.zip`))

            // replace old changelog with new one
            if (fs.existsSync(path.join(channelPath, 'latest', 'changelog')))
                fs.unlinkSync(path.join(channelPath, 'latest', 'changelog'))

            fs.writeFileSync(path.join(channelPath, 'latest', 'changelog'), changelog)
        }
    }
    else {
        try {
            fs.mkdirSync(path.join(channelPath, 'latest'))
        }
        catch (e) {
            console.log(e)
        }
        fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, 'latest', `${name}.zip`))
        fs.writeFileSync(path.join(channelPath, 'latest', 'changelog'), changelog)
        fs.writeFileSync(path.join(channelPath, 'latest', forgeVersion), "")
    }

    fs.mkdirSync(versionPath)

    fs.writeFileSync(path.join(versionPath, "changelog"), changelog)
    fs.writeFileSync(path.join(versionPath, forgeVersion), "")
    fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(versionPath, `${name}.zip`))
    fs.unlinkSync(path.join('uploads', file[0].originalname))

    const version: Version = new Version(name, changelog, versionPath, forgeVersion)
    getChannel(channel).Version = version

    return version
}

export const getVersion = (channel: string, versionName: string) => {
    return getChannel(channel).Version.filter((version: Version) => version.Version === versionName)[0]
}

export const updateVersion = (channelName: string, name: string, newName?: string, changelog?: string, file?: any, forgeVersion?: string) => {
    const repoPath: string = "repo"
    const channelPath: string = path.join(repoPath, channelName)
    const versionPath: string = path.join(channelPath, name)
    const latestVersion: string | boolean | undefined = fs.existsSync(path.join(channelPath, 'latest')) ? fs.readdirSync(path.join(channelPath, 'latest')).find((file: string) => file.endsWith('.zip')) : false
    
    if (newName) {
        if (name === "latest" && typeof latestVersion == "string") {
            fs.renameSync(path.join(versionPath, name, latestVersion), path.join(versionPath, `${newName}.zip`))
        }
        else {
            fs.renameSync(path.join(versionPath), path.join(channelPath, newName))
        }
    }

    if (changelog) {
        fs.writeFileSync(path.join(channelPath, newName ? newName : name, "changelog"), changelog)
    }

    if (file) {
        fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, newName ? newName : name, `${newName ? newName : name}.zip`))
        fs.unlinkSync(path.join('uploads', file[0].originalname))
    }

    if (forgeVersion) {
        const currentForgeVersion: string = fs.readdirSync(path.join(channelPath, newName ? newName : name)).filter((file: string) => new RegExp(/1\.20\.1-[0-9]{2}\.[0-9]{1}\.[0-9]{1,2}/).test(file))[0]
        if (currentForgeVersion) 
            fs.unlinkSync(path.join(channelPath, newName ? newName : name, currentForgeVersion))
        
        fs.writeFileSync(path.join(channelPath, newName ? newName : name, forgeVersion), "")
    }

    init()

    return true
}

export const deleteVersion = (channelName: string, name: string) => {
    const repoPath: string = "repo"
    const channelPath: string = path.join(repoPath, channelName)
    const versionPath: string = path.join(repoPath, channelName, name)
    const latestVersion: string | boolean | undefined = fs.existsSync(path.join(channelPath, 'latest')) ? fs.readdirSync(path.join(channelPath, 'latest')).find((file: string) => file.endsWith('.zip')) : false

    if (fs.existsSync(versionPath))
        fs.rmdirSync(versionPath, { recursive: true })

    if (latestVersion) {
        let lastVersion: string = ''
        fs.rmdirSync(path.join(channelPath, 'latest'), { recursive: true })
        
        if (fs.readdirSync(channelPath).length > 0) {
            fs.readdirSync(path.join(repoPath, channelName)).forEach((version: string) => {

                if (!lastVersion) {
                    lastVersion = version
                }
                else {
                    if (lastVersion < version) {
                        lastVersion = version
                    }
                }
            })
            fs.mkdirSync(path.join(channelPath, 'latest'))
            fs.copyFileSync(path.join(repoPath, channelName, lastVersion, `${lastVersion}.zip`), path.join(channelPath, 'latest', `${lastVersion}.zip`))
            fs.copyFileSync(path.join(repoPath, channelName, lastVersion, 'changelog'), path.join(channelPath, 'latest', 'changelog'))
        }
        
        init()
    }
   
    return true
}

export const getDownload = (channel: string, versionName: string) => {
    return getVersion(channel, versionName).Path
}