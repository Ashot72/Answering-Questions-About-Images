const { OpenAIApi, Configuration } = require("openai");
import path from 'path';
import fs from "fs"
import express from 'express';
import multer from 'multer';
import Replicate from "replicate";
import gTTS from "gtts"

let fileName = null

const openai = new OpenAIApi(new Configuration({ 
  apiKey: process.env.OPENAI_API_KEY,
 }))

 const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
 });
  
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },

  filename(req, file, cb) {
    if(file.originalname === "recording.mp3") {
      const fileNameArr = file.originalname.split('.');
      fileName = `${Date.now()}.${fileNameArr[fileNameArr.length - 1]}`
      cb(null, fileName);
    } else {
      const imageExt = file.originalname.split('.').pop()
      cb(null, fileName.replace("mp3", imageExt));   
    }  
  },
});

const upload = multer({ storage });
const app = express();

const port = process.env.PORT || 3000;

const getUploadPath = () => path.join(__dirname, 'uploads')
const getFilePath = (fileName) => path.join(__dirname, 'uploads', fileName)

app.use(express.static('public/assets'));
app.use(express.static('uploads'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.post('/record', upload.fields([
                 { name: 'audio', maxCount: 1 },
                 { name: 'file', maxCount: 1}
            ]), async (req, res) => {

  const lastIamgeFile = fileName.replace("mp3", "png");
  const lastMp3File = fileName;

  const transcription = await transcribeAudio(lastMp3File);
  console.log('Transcription:', transcription);
  
  const base64 = fs.readFileSync(getFilePath(lastIamgeFile), {encoding: 'base64'});    
  const mimeType = "image/png";
  const dataURI = `data:${mimeType};base64,${base64}`;

  const output: any = await replicate.run(
    "andreasjansson/blip-2:4b32258c42e9efd4288bb9910bc532a69727f9acd26aa08e175713a0a857a608",
    {
      input: {
        question: transcription,
        image: dataURI
      }
    }
  );

   console.log({output})
   
   const questionFile = lastMp3File.replace(".mp3", "-question.txt") 
   fs.writeFileSync(getFilePath(questionFile), transcription);

   const answerPath = lastMp3File.replace(".mp3", "-answer.txt")
   fs.writeFileSync(getFilePath(answerPath), output);

   const  gtts = new gTTS(output, 'en');

   gtts.save(getFilePath(lastMp3File.replace(".mp3", "-gen.mp3")), function (err, result){
    if(err) { throw new Error(err); }       
    console.log("Text to speech converted!");

    return res.json({ success: true })
  });   
}) 

app.get('/recordings', async (req, res) => {  
  let filesTexts = fs.readdirSync(getUploadPath());

  const files = filesTexts.filter((file) => {
    const fileNameArr = file.split('-');
    return fileNameArr[fileNameArr.length - 1] === 'gen.mp3';
  }).map((file) => `/${file}`);

  const prompts = filesTexts.filter((file) => {
    const fileNameArr = file.split('-');
    return fileNameArr[fileNameArr.length - 1] === 'question.txt';
  }).map((txt) => fs.readFileSync(getFilePath(txt), 'utf8'));

  const responses = filesTexts.filter((file) => {
    const fileNameArr = file.split('-');
    return fileNameArr[fileNameArr.length - 1] === 'answer.txt';
  }).map((txt) => fs.readFileSync(getFilePath(txt), 'utf8'));
  
  return res.json({ success: true, files, prompts, responses });
});

async function transcribeAudio(filename) {
  const transcript = await openai.createTranscription(
    fs.createReadStream(getFilePath(filename)),
    "whisper-1"
  );
  return transcript.data.text;
}

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
