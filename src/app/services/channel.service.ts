import fs from 'fs';
import path from 'path';

import { Channel } from '../classes/Channel';
import { Version } from '../classes/Version';
import { Changelog } from '../classes/Changelog';

var channels: Channel[] = []
const repoPath: string = "repo/game"

async function readChangelogFiles(path: string) {
    try {
        if (fs.statSync(path).isDirectory()) {
            const changelogFiles: any = fs.readdirSync(path)
            return new Changelog(fs.readFileSync(path + "/" + changelogFiles[0], 'utf8'), fs.readFileSync(path + "/" + changelogFiles[1], 'utf8'))
        }
        else {
            const changelogFiles: any = fs.readFileSync(path, 'utf8')
            return new Changelog("", changelogFiles)
        }
    }
    catch (e) {
        console.log(e)
        return new Changelog("", "")
    }
}

export const init = async () => {
    
    channels = []
    
    if (!fs.existsSync(repoPath))
        fs.mkdirSync(repoPath, {recursive: true})

    if (!fs.existsSync("uploads"))
        fs.mkdirSync("uploads")

    const repoContent: any = fs.readdirSync(path.join(repoPath))
    
    for(const folderName of repoContent) {
        const folderPath: string = path.join(repoPath, folderName)
        const folderContent: any = fs.readdirSync(folderPath)
        const channel: Channel = new Channel(folderName)
        
        for(const subFolderName of folderContent) {
            const regex = new RegExp(/.*\.zip$/)
            const filePath: string = fs.readdirSync(path.join(repoPath, folderName, subFolderName)).filter((file: string) => regex.test(file))[0]
            const changelog: any = fs.existsSync(path.join(repoPath, folderName, subFolderName, "changelogs")) 
                ? path.join(repoPath, folderName, subFolderName, "changelogs") 
                : fs.existsSync(path.join(repoPath, folderName, subFolderName, "changelog"))
                    ? path.join(repoPath, folderName, subFolderName, "changelog")
                    : false
            let fileContent: Changelog = new Changelog("", "")
            if (changelog)
                fileContent = await readChangelogFiles(changelog)
            
            const forgeVersion: string = fs.readdirSync(path.join(repoPath, folderName, subFolderName)).filter((file: string) => new RegExp(/[0-9]{2}\.[0-9]{1}\.[0-9]{2}/).test(file))[0]
            const version: Version = new Version(subFolderName, fileContent, path.join(repoPath, folderName, subFolderName, filePath), forgeVersion)
            channel.Version = version
        }
        channels.push(channel)
    }
    console.log(`Channel service initialized with ${channels.length} channels : ${
        channels.map((channel: Channel) => channel.ChannelName)
    }`)
    return channels
}

export const getChannels = () => {
    return channels
}

export const createChannel = (name: string) => {
    
    fs.mkdirSync(path.join(repoPath, name))

    const channel: Channel = new Channel(name)

    channels.push(channel)

    return channel
}

export const getChannel = (name: string) => {
    const channel: Channel = channels.find((channel: Channel) => channel.ChannelName === name) as Channel
    console.log(channels)
    if (channel)
        return channel

    throw new Error("Channel not found")
}

export const updateChannel = async (name: string, newName: string) => {
    
    const channelPath: string = path.join(repoPath, name)
    const newChannelPath: string = path.join(repoPath, newName)
    
    if (fs.existsSync(channelPath)) {
        await fs.renameSync(channelPath, newChannelPath)
        
        await init()

        return true
    }

    throw new Error("Channel not found")
}

export const deleteChannel = (name: string) => {
    
    const channelPath: string = path.join(repoPath, name)

    if (fs.existsSync(channelPath)) {
        fs.rmdirSync(channelPath, { recursive: true })
        init()

        return true
    }

    throw new Error("Channel not found")
}

export const createVersion = (channel: string, name: string, changelogEn: string, changelogFr: string, file: any, forgeVersion: string) => {
    
    const channelPath: string = path.join(repoPath, channel)
    const latestVersion: string | boolean | undefined = fs.existsSync(path.join(channelPath, 'latest')) ? fs.readdirSync(path.join(channelPath, 'latest')).find((file: string) => file.endsWith('.zip')) : false
    const versionPath = path.join(repoPath, channel, name) as string

    if (!fs.existsSync(channelPath)) {
        createChannel(channel)
    }

    const changelogs: Changelog = new Changelog(changelogEn, changelogFr)

    // check if new version name is newer than latest version
    if(latestVersion) {
        const latestVersionName: string = latestVersion.split('.zip')[0]
        if(latestVersionName <= name) {
            // remove old latest file
            fs.unlinkSync(path.join(channelPath, 'latest', latestVersion))

            // copy new latest file
            fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, 'latest', `${name}.zip`))
        
            // create changelogs directory with files if not exists

            if (!fs.existsSync(path.join(channelPath, 'latest', 'changelogs'))) {
                fs.mkdirSync(path.join(channelPath, 'latest', 'changelogs'))
            }
            fs.writeFileSync(path.join(channelPath, 'latest', 'changelogs', 'en'), changelogEn)
            fs.writeFileSync(path.join(channelPath, 'latest', 'changelogs', 'fr'), changelogFr)
        
            // check if forge version exists and update it
            const currentForgeVersion: string = fs.readdirSync(path.join(channelPath, 'latest')).filter((file: string) => new RegExp(/1\.20\.1-[0-9]{2}\.[0-9]{1}\.[0-9]{1,2}/).test(file))[0]
            if (currentForgeVersion) 
                fs.renameSync(path.join(channelPath, 'latest', currentForgeVersion), forgeVersion)
            else
                fs.writeFileSync(path.join(channelPath, 'latest', forgeVersion), "")
        }
    }
    else {
        try {
            fs.mkdirSync(path.join(channelPath, 'latest'))
        }
        catch (e) {
            console.log(e)
        }
        
        if (!fs.existsSync(path.join(channelPath, 'latest', 'changelogs'))) {
            fs.mkdirSync(path.join(channelPath, 'latest', 'changelogs'))
        }
        fs.writeFileSync(path.join(channelPath, 'latest', 'changelogs', 'en'), changelogEn)
        fs.writeFileSync(path.join(channelPath, 'latest', 'changelogs', 'fr'), changelogFr)
        fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, 'latest', `${name}.zip`))
        fs.writeFileSync(path.join(channelPath, 'latest', forgeVersion), "")
    }

    fs.mkdirSync(versionPath)
    if (!fs.existsSync(path.join(versionPath, 'changelogs'))) {
        fs.mkdirSync(path.join(versionPath, 'changelogs'))
    }
    fs.writeFileSync(path.join(versionPath, 'changelogs', 'en'), changelogEn)
    fs.writeFileSync(path.join(versionPath, 'changelogs', 'fr'), changelogFr)
    fs.writeFileSync(path.join(versionPath, forgeVersion), "")
    fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(versionPath, `${name}.zip`))
    fs.unlinkSync(path.join('uploads', file[0].originalname))

    const version: Version = new Version(name, changelogs, versionPath, forgeVersion)
    
    init()

    return version
}

export const getVersion = (channel: string, versionName: string) => {
    const channelData = getChannel(channel)

    const version = channelData.versions.filter((version: Version) => {
        if (version.Version === versionName) {
            return version
        }
    })

    return version[0]
}

export const updateVersion = (channelName: string, name: string, newName?: string, changelogEn?: string, changelogFr?: string, file?: any, forgeVersion?: string) => {
    const channelPath: string = path.join(repoPath, channelName)
    const versionPath: string = path.join(channelPath, name)
    const latestVersion: string | boolean | undefined = fs.existsSync(path.join(channelPath, 'latest')) ? fs.readdirSync(path.join(channelPath, 'latest')).find((file: string) => file.endsWith('.zip')) : false

    if (fs.existsSync(versionPath)) {
        if (newName) {
            if (name === "latest" && typeof latestVersion == "string") {
                fs.renameSync(path.join(versionPath, name, latestVersion), path.join(versionPath, `${newName}.zip`))
            }
            else {
                fs.renameSync(path.join(versionPath), path.join(channelPath, newName))
            }
        }
    
        if (changelogEn) {
            fs.writeFileSync(path.join(channelPath, newName ? newName : name, "changelogs"), changelogEn)
        }

        if (changelogFr) {
            fs.writeFileSync(path.join(channelPath, newName ? newName : name, "changelogs"), changelogFr)
        }
    
        if (file) {
            fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, newName ? newName : name, `${newName ? newName : name}.zip`))
            fs.unlinkSync(path.join('uploads', file[0].originalname))
        }
    
        if (forgeVersion) {
            const currentForgeVersion: string = fs.readdirSync(path.join(channelPath, newName ? newName : name)).filter((file: string) => new RegExp(/1\.20\.1-[0-9]{2}\.[0-9]{1}\.[0-9]{1,2}/).test(file))[0]
            if (currentForgeVersion) 
                fs.renameSync(path.join(channelPath, newName ? newName : name, currentForgeVersion), path.join(channelPath, newName ? newName : name, forgeVersion))
            else
                fs.writeFileSync(path.join(channelPath, newName ? newName : name, forgeVersion), "")
        }
    
        init()
    
        return true
    }

    throw new Error("Version not found")
}

export const deleteVersion = (channelName: string, name: string) => {
    const channelPath: string = path.join(repoPath, channelName)
    const versionPath: string = path.join(repoPath, channelName, name)
    const latestVersion: string | boolean | undefined = fs.existsSync(path.join(channelPath, 'latest')) ? fs.readdirSync(path.join(channelPath, 'latest')).find((file: string) => file.endsWith('.zip')) : false

    if (fs.existsSync(versionPath)) {
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
                fs.copyFileSync(path.join(repoPath, channelName, lastVersion, 'changelogs'), path.join(channelPath, 'latest', 'changelogs'))
            }
            
            init()
        }
       
        return true
    }
    
    throw new Error("Version not found")
}

export const getDownload = (channel: string, versionName: string) => {
    const channelData = getVersion(channel, versionName)
    return channelData.Path
}