import dotenv from "dotenv"
dotenv.config();

export default function calculateReadingTime(text) {
    if(!text) return 0;

    const AveWordPerMin = process.env.WORDS_PER_MINUTE;
    const WordCount = text
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0).length;

    return Math.max(1, Math.ceil(WordCount/AveWordPerMin));
}

