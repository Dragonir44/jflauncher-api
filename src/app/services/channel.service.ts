import fs from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

import { Channel } from '../classes/Channel';
import { Version } from '../classes/Version';
import { Changelog } from '../classes/Changelog';

import { collections } from './db.service';

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

const initDB = async (channels: Channel[]) => {
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
    
    const channels: Channel[] = []
    
    if (!fs.existsSync(repoPath))
        fs.mkdirSync(repoPath, {recursive: true})

    if (!fs.existsSync("uploads"))
        fs.mkdirSync("uploads")

    const repoContent: any = fs.readdirSync(path.join(repoPath))
    
    for(const folderName of repoContent) {
        const folderPath: string = path.join(repoPath, folderName)
        const folderContent: any = fs.readdirSync(folderPath)
        const channel: Channel = new Channel(folderName)
        let fileContent: Changelog = new Changelog("", "")
        
        for(const subFolderName of folderContent) {
            const regex = new RegExp(/.*\.zip$/)
            const filePath: string = fs.readdirSync(path.join(repoPath, folderName, subFolderName)).filter((file: string) => regex.test(file))[0]
            const changelog: any = fs.existsSync(path.join(repoPath, folderName, subFolderName, "changelogs")) 
                ? path.join(repoPath, folderName, subFolderName, "changelogs") 
                : fs.existsSync(path.join(repoPath, folderName, subFolderName, "changelog"))
                    ? path.join(repoPath, folderName, subFolderName, "changelog")
                    : false
            if (changelog)
                fileContent = await readChangelogFiles(changelog)
            const forgeVersion: string = fs.readdirSync(path.join(repoPath, folderName, subFolderName)).filter((file: string) => new RegExp(/[0-9]{2}\.[0-9]{1}\.[0-9]{2}/).test(file))[0]
            const version: Version = new Version(subFolderName, fileContent, path.join(repoPath, folderName, subFolderName, filePath), forgeVersion)
            channel.Version = version
        }

        channels.push(channel)
    }

    initDB(channels)
}

export const getChannels = async () => {
    return await (collections.channel?.find({}).toArray() as unknown) as Channel[];
}

export const createChannel = async (name: string) => {
    
    fs.mkdirSync(path.join(repoPath, name))

    const newChannel = {
        _id: new ObjectId(),
        name: name,
        versions: []
    }

    await collections.channel?.insertOne(newChannel)

    return await (collections.channel?.find({}).toArray() as unknown) as Channel[]
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

        collections.channel?.updateOne({ name: name }, { $set: { name: newName } })

        return await (collections.channel?.find({}).toArray() as unknown) as Channel[]
    }

    throw new Error("Channel not found")
}

export const deleteChannel = async (name: string) => {
    
    const channelPath: string = path.join(repoPath, name)

    if (fs.existsSync(channelPath)) {
        fs.rmSync(channelPath, { recursive: true })

        await collections.channel?.deleteOne({name: name})

        return await (collections.channel?.find({}).toArray() as unknown) as Channel[]
    }

    throw new Error("Channel not found")
}

export const createVersion = async(channel: string, name: string, changelogEn: string, changelogFr: string, file: any, forgeVersion: string) => {
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
        }

        // check if forge version is different
        const currentForgeVersion: string = fs.readdirSync(path.join(channelPath, 'latest')).filter((file: string) => new RegExp(/1\.20\.1-[0-9]{2}\.[0-9]{1}\.[0-9]{1,2}/).test(file))[0]

        if (currentForgeVersion && currentForgeVersion !== forgeVersion) {
            fs.renameSync(path.join(channelPath, 'latest', currentForgeVersion), forgeVersion)
        }
        // update latest version in db
        await collections.channel?.updateOne({ 
            name: channel 
        }, 
        { 
            $set: { 
                "versions.$[element].Version": 'latest', 
                "versions.$[element].Changelog": { 
                    En: changelogEn, 
                    Fr: changelogFr 
                }, 
                "versions.$[element].Path": path.join(channelPath, 'latest', `${name}.zip`), 
                "versions.$[element].ForgeVersion": forgeVersion 
            } 
        },
        { 
            arrayFilters: [{ "element.Version": 'latest' }] 
        })
        
    }
    else {
        try {
            fs.mkdirSync(path.join(channelPath, 'latest'))
        }
        catch (e) {
            console.log(e)
        }
        fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, 'latest', `${name}.zip`))
        fs.writeFileSync(path.join(channelPath, 'latest', forgeVersion), "")

        await collections.channel?.updateOne({ 
            name: channel 
        }, 
        { 
            $push: { 
                versions: { 
                    Version: 'latest', 
                    Changelog: { 
                        En: changelogEn, 
                        Fr: changelogFr 
                    }, 
                    Path: path.join(channelPath, 'latest', `${name}.zip`), 
                    ForgeVersion: forgeVersion 
                } 
            } 
        })
    }

    if (!fs.existsSync(versionPath))
        fs.mkdirSync(versionPath)
    fs.writeFileSync(path.join(versionPath, forgeVersion), "")
    fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(versionPath, `${name}.zip`))
    fs.unlinkSync(path.join('uploads', file[0].originalname))

    const version: Version = new Version(name, changelogs, versionPath, forgeVersion)
    
    await collections.channel?.updateOne({ 
        name: channel 
    }, 
    { 
        $push: { 
            versions: { 
                Version: name, 
                Changelog: { 
                    En: changelogEn, 
                    Fr: changelogFr 
                }, 
                Path: versionPath, 
                ForgeVersion: forgeVersion 
            } 
        } 
    })

    return version
}

export const getVersion = async (channel: string, versionName: string) => {
    const channelData = await collections.channel?.findOne({
        name: channel,
        "versions.Version": versionName
    })
    console.log("test", channelData)
    if (channelData){
        for (const version of channelData?.versions) {
            if (version.Version === versionName) {
                return version
            }
        }

    }

    throw new Error("Version not found")
}

export const updateVersion = async (channelName: string, name: string, newName?: string, changelogEn?: string, changelogFr?: string, file?: any, forgeVersion?: string) => {
    const channelPath: string = path.join(repoPath, channelName)
    const versionPath: string = path.join(channelPath, name)
    const latestVersion: string | boolean | undefined = fs.existsSync(path.join(channelPath, 'latest')) ? fs.readdirSync(path.join(channelPath, 'latest')).find((file: string) => file.endsWith('.zip')) : false
    let channelBase: any = await collections.channel?.findOne({ name: channelName })
    let updateBase: any = await getVersion(channelName, name)

    if (fs.existsSync(versionPath)) {
        if (newName) {
            if (name === "latest" && typeof latestVersion == "string") {
                fs.renameSync(path.join(versionPath, name, latestVersion), path.join(versionPath, `${newName}.zip`))
                updateBase.Path = path.join(channelPath, newName, `${newName}.zip`)
            }
            else {
                fs.renameSync(path.join(versionPath), path.join(channelPath, newName))
                updateBase.Version = newName
            }
        }
    
        if (changelogEn) {
            fs.writeFileSync(path.join(channelPath, newName ? newName : name, "changelog"), changelogEn)
            updateBase.Changelog.En = changelogEn
        }

        if (changelogFr) {
            fs.writeFileSync(path.join(channelPath, newName ? newName : name, "changelog"), changelogFr)
            updateBase.Changelog.Fr = changelogFr
        }
    
        if (file) {
            fs.copyFileSync(path.join('uploads', file[0].originalname), path.join(channelPath, newName ? newName : name, `${newName ? newName : name}.zip`))
            fs.unlinkSync(path.join('uploads', file[0].originalname))
            updateBase.Path = path.join(channelPath, newName ? newName : name, `${newName ? newName : name}.zip`)
        }
    
        if (forgeVersion) {
            const currentForgeVersion: string = fs.readdirSync(path.join(channelPath, newName ? newName : name)).filter((file: string) => new RegExp(/1\.20\.1-[0-9]{2}\.[0-9]{1}\.[0-9]{1,2}/).test(file))[0]
            if (currentForgeVersion) 
                fs.unlinkSync(path.join(channelPath, newName ? newName : name, currentForgeVersion))
            
            fs.writeFileSync(path.join(channelPath, newName ? newName : name, forgeVersion), "")
            updateBase.ForgeVersion = forgeVersion
        }

        channelBase.versions = channelBase.versions.map((version: any) => {
            if (version.Version === name) {
                return updateBase
            }
            return version
        })
        
        await collections.channel?.updateOne({
            name: channelName
        }, {
            $set: channelBase
        })
        return true 
    }

    throw new Error("Version not found")
}

export const deleteVersion = async (channelName: string, name: string) => {
    const channelPath: string = path.join(repoPath, channelName)
    const versionPath: string = path.join(repoPath, channelName, name)
    const latestVersion: string | boolean | undefined = (
        fs.existsSync(path.join(channelPath, 'latest')) 
        && fs.readdirSync(path.join(channelPath, 'latest')).find((file: string) => file.endsWith('.zip'))?.split('.zip')[0] == name
    )
        ? true
        : false

    if (fs.existsSync(versionPath)) {
        fs.rmSync(versionPath, { recursive: true })

        await collections.channel?.updateOne({
            name: channelName
        }, {
            $pull: {
                versions: {
                    Version: name
                }
            }
        })

        if (latestVersion) {
            let lastVersion: string = ''
            fs.rmSync(path.join(channelPath, 'latest'), { recursive: true })
            
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
                fs.readdirSync(path.join(channelPath, lastVersion)).forEach((file: string) => {
                    fs.copyFileSync(path.join(channelPath, lastVersion, file), path.join(channelPath, 'latest', file))
                })
            }
            
            await collections.channel?.updateOne({
                name: channelName
            }, {
                $set: {
                    "versions.$[element].Version": 'latest',
                    "versions.$[element].Path": path.join(channelPath, 'latest', `${lastVersion}.zip`)
                }
            }, {
                arrayFilters: [{ "element.Version": 'latest' }]
            })
        }
       
        return true
    }
    
    throw new Error("Version not found")
}

export const getDownload = async(channel: string, versionName: string) => {
    const channelData = await getVersion(channel, versionName)
    return channelData.Path
}