import fs from 'fs';
import path from 'path';

import { Channel } from '../classes/Channel';
import { Version } from '../classes/Version';

var channels: Channel[] = []

export const init = () => {
    const repoPath: string = "repo"
    
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
}

export const getChannels = () => {
    return channels
}

export const getChannel = (name: string) => {
    return channels.filter((channel: Channel) => channel.ChannelName === name)[0]
}

export const getVersion = (channel: string, versionName: string) => {
    return getChannel(channel).Version.filter((version: Version) => version.Version === versionName)[0]
}

export const getDownload = (channel: string, versionName: string) => {
    return getVersion(channel, versionName).Path
}

export const createChannel = (name: string) => {
    const repoPath: string = "repo"
    fs.mkdirSync(path.join(repoPath, name))

    const channel: Channel = new Channel(name)
    channels.push(channel)

    return channel
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
        fs.writeFileSync(path.join(channelPath, 'latest', 'changelog'), changelog)
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