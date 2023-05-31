# Answering Questions About Images

This is a Node.js app where you can upload images, ask questions about images using voice prompts, then listen to the responses in voice.

Voice to Text: I turn an audio into text using [Whisper](https://openai.com/research/whisper) which is an OpenAI Speech Recognition Model that turns audio 
into text with up to 99% accuracy. Whisper is a speech transcription system form the creators of ChatGPT. Anyone can use it, and it is completely free. The system is trained on 680 000 hours of speech data from the network and recognizes 99 languages.

Generating Answers: We use [blip-2](https://replicate.com/andreasjansson/blip-2) model that answers questions about images.

Text to Voice: I use [gTTS.js](https://www.npmjs.com/package/gtts) which is Google Text to Speech JavaScript library originally written in Phyton.


To get started.
```
       Clone the repository

       git clone https://github.com/Ashot72/Answering-Questions-About-Images
       cd Answering-Questions-About-Images

       Add your key to .env file
       
       # installs dependencies
         npm install

       # to run locally
         npm start
      
```

Go to [Answering Questions About Images Video](https://youtu.be/6w_F1GARGDQ) page

Go to [Answering Questions About Images Description](https://ashot72.github.io/Answering-Questions-About-Images/doc.html) page
