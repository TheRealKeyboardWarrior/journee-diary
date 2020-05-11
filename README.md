![Journee Logo](journeelogo.png)

# journee++ 

A lightweight, simplified RedNotebook-type journal/diary app. Built with Electron. Makes a folder full of dated text files.

![Screenshot](journee-screenshot.png)

Journee but..
* Responsive design
* Markdown support (toggle preview & updates on the fly)
* Image support: drop image in journal data folder and add `![title]({jf}/filename.jpg)`
* Consolas font
* Automatic capitalization of text (see settings)
* Updated all dependencies

### Installing and Running

You can find the [Downloads](https://github.com/TheRealKeyboardWarrior/journeeplusplus/releases).

#### Linux
```
chmod +x JourneePlusPlus-1.0.0.AppImage
./JourneePlusPlus-1.0.0.AppImage
```

#### Windows

Just double-click the file and the installer will do the work!

#### MacOS

Create a folder called `Journee` anywhere, unzip the file `JourneePlusPlus-1.0.0-mac.zip` in that folder.
Double-clicking the JourneePlusPlus file will open the application.

#### Run From Source with Electron

Clone the repository
```
git clone https://github.com/adueck/journee-diary
```

Move into the app directory
```
cd journee-diary
```

then install dependencies and run

```
npm install
npm start
```

#### Contributions are welcome!

Apache 2.0 Licence
