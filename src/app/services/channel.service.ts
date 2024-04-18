import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

import { Channel } from '../classes/Channel';
import { Version } from '../classes/Version';
import { Changelog } from '../classes/Changelog';

import { collections } from './db.service';

var channels: Channel[] = []
const repoPath: string = "repo/game"

async function readChangelogFiles(path: string) {
    if (fs.statSync(path).isDirectory()) {
        const changelogFiles: any = fs.readdirSync(path)
        return new Changelog(fs.readFileSync(path + "/" + changelogFiles[0], 'utf8'), fs.readFileSync(path + "/" + changelogFiles[1], 'utf8'))
    }
    else {
        const changelogFiles: any = fs.readFileSync(path, 'utf8')
        return new Changelog("", changelogFiles)
    }
}

const initDB = async () => {
    console.log("Initializing database")
    try {
        channels.forEach(async (channel) => {
            if (collections.channel && await collections.channel.findOne({ name: channel.ChannelName }) == null) {
                const channelData = {
                    _id: new ObjectId(),
                    name: channel.ChannelName,
                    versions: channel.Version.map((version: Version) => {
                        return {
                            Version: version.Version,
                            Changelog: {
                                En: version.Changelog.En,
                                Fr: version.Changelog.Fr
                            },
                            Path: version.Path,
                            ForgeVersion: version.ForgeVersion
                        }
                    })
                }
        
                const result = await collections.channel?.insertOne(channelData)
    
                result
                    ? console.log(`Channel ${channel.ChannelName} inserted`)
                    : console.log(`Channel ${channel.ChannelName} not inserted`)
            }
            else {
                const channelData = {
                    name: channel.ChannelName,
                    versions: channel.Version.map((version: Version) => {
                        return {
                            Version: version.Version,
                            Changelog: {
                                En: version.Changelog.En,
                                Fr: version.Changelog.Fr
                            },
                            Path: version.Path,
                            ForgeVersion: version.ForgeVersion
                        }
                    })
                }
        
                const result = await collections.channel?.updateOne({ ChannelName: channel.ChannelName }, { $set: channelData })
    
                result
                    ? console.log(`Channel ${channel.ChannelName} updated`)
                    : console.log(`Channel ${channel.ChannelName} not updated`)
            }
        })

        channels = await (collections.channel?.find({}).toArray() as unknown) as Channel[];
    }
    catch (e) {
        console.log(e)
    }
}

export const init = async () => {
    
    channels = []
    
    if (!fs.existsSync(repoPath))
        fs.mkdirSync(repoPath)

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
            const fileContent: Changelog = await readChangelogFiles(changelog)
            const forgeVersion: string = fs.readdirSync(path.join(repoPath, folderName, subFolderName)).filter((file: string) => new RegExp(/[0-9]{2}\.[0-9]{1}\.[0-9]{2}/).test(file))[0]
            const version: Version = new Version(subFolderName, fileContent, path.join(repoPath, folderName, subFolderName, filePath), forgeVersion)
            channel.Version = version
        }

        channels.push(channel)
    }

    initDB()
}

export const getChannels = () => {
    return channels
}

export const createChannel = (name: string) => {
    
    fs.mkdirSync(path.join(repoPath, name))

    const channel: Channel = new Channel(name)

    const newChannel = {
        _id: new ObjectId(),
        name: name,
        versions: []
    }

    collections.channel?.insertOne(newChannel)

    channels = collections.channel?.find({}).toArray() as unknown as Channel[]

    return channel
}

export const getChannel = async (name: string) => {
    const channel: Channel = await (collections.channel?.findOne({name: name}) as unknown) as Channel

    if (channel)
        return channel

    throw new Error("Channel not found")
}

export const updateChannel = async (name: string, newName: string) => {
    
    const channelPath: string = path.join(repoPath, name)
    const newChannelPath: string = path.join(repoPath, newName)
    
    if (fs.existsSync(channelPath)) {
        await fs.renameSync(channelPath, newChannelPath)
        // init()
        collections.channel?.updateOne({ name: name }, { $set: { name: newName } })

        channels = await (collections.channel?.find({}).toArray() as unknown) as Channel[]

        return true
    }

    throw new Error("Channel not found")
}

export const deleteChannel = async (name: string) => {
    
    const channelPath: string = path.join(repoPath, name)

    if (fs.existsSync(channelPath)) {
        fs.rmdirSync(channelPath, { recursive: true })
        // init()

        await collections.channel?.deleteOne({name: name})

        channels = await (collections.channel?.find({}).toArray() as unknown) as Channel[]

        return true
    }

    throw new Error("Channel not found")
}

export const createVersion = (channel: string, name: string, changelogs: Changelog, file: any, forgeVersion: string) => {
    
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
            if (fs.existsSync(path.join(channelPath, 'latest', 'changelogs')))
                fs.unlinkSync(path.join(channelPath, 'latest', 'changelogs'))

            for (const changelog of changelogs) {
                fs.writeFileSync(path.join(channelPath, 'latest', 'changelogs', changelog), changelog)
            }
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
        for (const changelog of changelogs) {
            fs.writeFileSync(path.join(channelPath, 'latest', 'changelogs', changelog), changelog)
        }
        fs.writeFileSync(path.join(channelPath, 'latest', forgeVersion), "")
    }

    fs.mkdirSync(versionPath)

    for (const changelog of changelogs) {
        fs.writeFileSync(path.join(versionPath, "changelog"), changelog)
    }
    fs.writeFileSync(path.join(versionPath, forgeVersion), "")
    fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(versionPath, `${name}.zip`))
    fs.unlinkSync(path.join('uploads', file[0].originalname))

    const version: Version = new Version(name, changelogs, versionPath, forgeVersion)
    
    init()

    return version
}

export const getVersion = async (channel: string, versionName: string) => {
    const channelData = await getChannel(channel)
    return channelData.Version.filter((version: Version) => version.Version === versionName)[0]
}

export const updateVersion = (channelName: string, name: string, newName?: string, changelog?: string, file?: any, forgeVersion?: string) => {
    
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
                fs.copyFileSync(path.join(repoPath, channelName, lastVersion, 'changelog'), path.join(channelPath, 'latest', 'changelog'))
            }
            
            init()
        }
       
        return true
    }
    
    throw new Error("Version not found")
}

export const getDownload = async(channel: string, versionName: string) => {
    const channelData = await getVersion(channel, versionName)
    return channelData.Path
}