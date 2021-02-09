# Bandcamp Discover for Volumio

Volumio plugin for discovering Bandcamp music.

*This plugin is not affiliated with Bandcamp whatsoever.*

## Getting Started

To install the Bandcamp Discover plugin, first make sure you have [enabled SSH access](https://volumio.github.io/docs/User_Manual/SSH.html) on your Volumio device. Then, in a terminal:

```
$ ssh volumio@<your_Volumio_address>

volumio:~$ mkdir bandcamp-plugin
volumio:~$ cd bandcamp-plugin
volumio:~/bandcamp-plugin$ git clone https://github.com/patrickkfkan/volumio-bandcamp.git
volumio:~/bandcamp-plugin$ cd volumio-bandcamp
volumio:~/bandcamp-plugin/volumio-bandcamp$ volumio plugin install

...
Progress: 100
Status :Bandcamp Discover Successfully Installed, Do you want to enable the plugin now?
...

// If the process appears to hang at this point, just press Ctrl-C to return to the terminal.
```

Now access Volumio in a web browser. Go to ``Plugins -> Installed plugins`` and enable the Bandcamp Discover plugin by activating the switch next to it.

### Updating

When a new version of the plugin becomes available, you can ssh into your Volumio device and update as follows (assuming you have not deleted the directory which you cloned from this repo):

```
volumio:~$ cd ~/bandcamp-plugin/volumio-bandcamp/
volumio:~/bandcamp-plugin/volumio-bandcamp$ git pull
...
volumio:~/bandcamp-plugin/volumio-bandcamp$ volumio plugin update

This command will update the plugin on your device
...
Progress: 100
Status :Successfully updated plugin

// If the process appears to hang at this point, just press Ctrl-C to return to the terminal.

volumio:~/bandcamp-plugin/volumio-bandcamp$ sudo systemctl restart volumio
```

## Limitations

- Bandcamp login is not supported, due to Bandcamp not releasing an API that allows it. This means you will not be able to access your purchases nor stream high-quality music from Bandcamp.
- This plugin scrapes content from the Bandcamp website. If Bandcamp changes their site, then this plugin may no longer work until it is updated to match those changes. Furthermore, loading of some resources could take a while if the plugin has to gather data from multiple pages.

## Support Bandcamp and Artists

As the name implies, the purpose of this plugin is to allow you to discover music and artists on Bandcamp through Volumio. If you come across something you like, consider purchasing it on the Bandcamp website. To this end, the plugin displays links for accessing albums, artists and labels on Bandcamp. You can also access the album or artist of a currently playing Bandcamp track through the menu in Volumio's player view (click the ellipsis icon to bring up the menu).

## Changelog

0.1.0b-20210210
- Added Bandcamp Daily and Shows

0.1.0a
- Initial release
