# JFLauncher api

## Description

The JFLauncher api are used to share versions of the modpack Jimmu's Factory on all the diffrent channel (alpha,beta, release,...)

## How to use

### Routes

#### /channel

GET : give the diffrent channels name

#### /channel/:name

GET : give the different channel versions name

#### /channel/:name/:version

GET : give the changelogs of the version

#### /channel/:name/:version/download

GET : download the channel version

### Header

token : type string : token generated manually and give to the both side inside a .env file
name : type string : channel name give by the /channel route
version : type string : version name give by the /channel/:name route


## TODO

- [x] Change variable logic
  - [x] Update server repo
  - [x] Update service
    - [x] Init database
    - [x] Rework init
    - [x] Get channels
    - [x] Create channel
    - [x] Get channel
    - [x] Update channel
    - [x] Delete channel
    - [x] Create version
    - [x] Get Version
    - [x] Update version
    - [x] Delete version
    - [x] Get download link
    - [x] Add a check to remove old directory
- [ ] Add news routes
- [ ] Add server config route
