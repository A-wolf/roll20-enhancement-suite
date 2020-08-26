const fs = require('fs');
const firefoxDeploy = require('firefox-extension-deploy');
const shell = require('shelljs');
require('dotenv').load();
const Discord = require('discord.js');

const deployData = JSON.parse(fs.readFileSync("deploy_data.json", "utf8"));
const chromeZipPath = `./dist/chrome/prod/${deployData.chrome}`;
const firefoxZipPath = `./dist/firefox/prod/${deployData.firefox}`;

console.log("Pushing commits to master...");
shell.exec("git push origin master");

console.log("Pushing tags...");
shell.exec("git push --tags");

console.log(`Deploying version ${deployData.version} for:`);

if (typeof (deployData.chrome) !== "undefined") {
    console.log(`  Chrome: ${deployData.chrome}`);
    const chromeWebStore = require('chrome-webstore-upload')({
        extensionId: 'fadcomaehamhdhekodcpiglabcjkepff',
        clientId: process.env.CHROME_CLIENT_ID,
        clientSecret: process.env.CHROME_SECRET,
        refreshToken: process.env.CHROME_REFRESH_TOKEN,
    });

    chromeWebStore.fetchToken()
        .then(token => {
            chromeWebStore.uploadExisting(fs.createReadStream(chromeZipPath), token)

                .then(res1 => {

                    console.log(res1);
                    chromeWebStore.publish("default", token).then(res2 => {

                        console.log(res2);
                    });
                })
        });
}

if (typeof (deployData.firefox) !== "undefined") {
    console.log(`  Firefox: ${deployData.firefox}`);

    firefoxDeploy({
        issuer: process.env.FIREFOX_ISSUER,
        secret: process.env.FIREFOX_SECRET,

        id: "{ffed5dfa-f0e1-403d-905d-ac3f698660a7}",
        version: deployData.version,
        src: fs.createReadStream(firefoxZipPath),
    }).then(function () {
        console.log("Firefox: success!");
    }, function (err) {
        console.log("Firefox error");
        console.log(err);
    });
}

{
    const client = new Discord.Client();

    let changelog = null;
    try {
        changelog = JSON.parse(fs.readFileSync("changelog.json", "utf8", e => {
            if (e) console.log(e);
        }));
    } catch (err) {
        console.log(`Failed to get changelog, exiting: ${err}`);
        process.exit(1);
    }

    let latestChanges = changelog.versions[changelog.current];
    if (!latestChanges) {
        console.log("Couldn't find latest changes.");
        process.exit(1);
    }

    client.on("ready", () => {
        const channel = client.channels.get(process.env.DISCORD_CHANNEL);
        if (channel) {
            const noMedia = !latestChanges.info.media || latestChanges.info.media.length <=0;

            let strBuffer = `**${changelog.current} - ${latestChanges.info.title}**\n`;
            if(!noMedia) {
                strBuffer += `https://justas-d.github.io/roll20-enhancement-suite/${latestChanges.info.media}\n`;
            }

            latestChanges.changes.forEach(c => {
                strBuffer += `• ${c.content}\n`;
            });

            channel.send(strBuffer);
        } else {
            console.log("couldn't find discord chanel");
        }

        client.destroy();
    });

    client.login(process.env.DISCORD_TOKEN);
}
