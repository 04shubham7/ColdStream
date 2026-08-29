import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://shubham1230101130:rgO4bY5Wjez32OMF@cluster0.tbrbsay.mongodb.net/coldmailer";

const Resume = mongoose.model("Resume", new mongoose.Schema({
  name: String,
  fileUrl: String,
  fileName: String,
  fileSize: Number
}, { strict: false }));

async function run() {
  await mongoose.connect(MONGODB_URI);
  const resumes = await Resume.find().sort({ _id: -1 }).limit(1);
  if (resumes.length > 0) {
    console.log("Latest resume:", resumes[0]);
    const res = await fetch(resumes[0].fileUrl);
    const text = await res.text();
    console.log("First 100 bytes of file:", text.substring(0, 100));
  } else {
    console.log("No resumes found.");
  }
  process.exit(0);
}

run();
