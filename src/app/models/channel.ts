import fs from 'fs';
import path from 'path';

import { Channel } from '../classes/Channel';
import { Version } from '../classes/Version';

var channels: Channel[] = []

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
            const fileContent: any = fs.existsSync(path.join(repoPath, folderName, subFolderName, "changelog")) ? fs.readFileSync(path.join(repoPath, folderName, subFolderName, "changelog"), "utf8") : undefined
            const version: Version = new Version(subFolderName, fileContent, path.join(repoPath, folderName, subFolderName, filePath))
            channel.Version = version
        }

        channels.push(channel)
    }
    console.log(channels)
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

export const createVersion = (channel: string, name: string, changelog: string, file: any) => {
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
        if(latestVersionName >= name) {
            return false
        }
        // remove old latest file
        fs.unlinkSync(path.join(channelPath, 'latest', latestVersion))

        // copy new latest file
        fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, 'latest', `${name}.zip`))

        // replace old changelog with new one
        if (fs.existsSync(path.join(channelPath, 'latest', 'changelog')))
            fs.unlinkSync(path.join(channelPath, 'latest', 'changelog'))

        fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, 'latest', 'changelog'))
    }
    else {
        fs.mkdirSync(path.join(channelPath, 'latest'))
        fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, 'latest', `${name}.zip`))
        fs.writeFileSync(path.join(channelPath, 'latest', 'changelog'), changelog)
    }

    fs.mkdirSync(versionPath)

    fs.writeFileSync(path.join(versionPath, "changelog"), changelog)
    fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(versionPath, `${name}.zip`))
    fs.unlinkSync(path.join('uploads', file[0].originalname))

    const version: Version = new Version(name, changelog, versionPath)
    getChannel(channel).Version = version

    return version
}

export const getVersion = (channel: string, versionName: string) => {
    return getChannel(channel).Version.filter((version: Version) => version.Version === versionName)[0]
}

export const updateVersion = (channelName: string, name: string, newName?: string, changelog?: string, file?: any) => {
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