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